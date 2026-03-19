import {
  ConflictException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookCopyStatus, LoanStatus } from '@prisma/client';

import { mapPrismaError } from '../../common/errors/prisma-error.mapper';
import { serializeJsonValue } from '../../common/serializers/json-value.serializer';
import { PrismaService } from '../../database/prisma.service';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CreateLoanDto } from './dto/create-loan.dto';
import { FilterLoansDto } from './dto/filter-loans.dto';
import { ReturnLoanDto } from './dto/return-loan.dto';

@Injectable()
export class LoansService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters: FilterLoansDto) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: {
      deletedAt: Date | null;
      status?: LoanStatus;
      reader?: { code: string; deletedAt: Date | null };
      bookCopy?: { code: string; deletedAt: Date | null };
      loanedAt?: { gte?: Date; lte?: Date };
    } = {
      deletedAt: null,
      status: filters.status,
      reader: filters.ma_doc_gia
        ? {
            code: filters.ma_doc_gia,
            deletedAt: null,
          }
        : undefined,
      bookCopy: filters.ma_sach
        ? {
            code: filters.ma_sach,
            deletedAt: null,
          }
        : undefined,
      loanedAt:
        filters.ngay_muon_from || filters.ngay_muon_to
          ? {
              gte: filters.ngay_muon_from
                ? new Date(filters.ngay_muon_from)
                : undefined,
              lte: filters.ngay_muon_to
                ? new Date(filters.ngay_muon_to)
                : undefined,
            }
          : undefined,
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.loan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { loanedAt: 'desc' },
        include: { reader: true, bookCopy: true, staff: true },
      }),
      this.prisma.loan.count({ where }),
    ]);

    const mapped = items.map((loan) => this.toView(loan));

    return serializeJsonValue({
      items: mapped,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  }

  async findOneById(id: string) {
    const numericId = BigInt(id);

    const loan = await this.prisma.loan.findFirst({
      where: { id: numericId, deletedAt: null },
      include: { reader: true, bookCopy: true, staff: true },
    });

    if (!loan) {
      throw new NotFoundException('Loan not found');
    }

    return serializeJsonValue(this.toView(loan));
  }

  async create(dto: CreateLoanDto, user: AuthenticatedUser) {
    try {
      const loan = await this.prisma.$transaction(async (tx) => {
        const reader = await tx.reader.findFirst({
          where: { code: dto.ma_doc_gia, deletedAt: null },
        });

        if (!reader) {
          throw new NotFoundException('Reader not found');
        }

        const copy = await tx.bookCopy.findFirst({
          where: { code: dto.ma_sach, deletedAt: null },
        });

        if (!copy) {
          throw new NotFoundException('Copy not found');
        }

        const activeLoan = await tx.loan.findFirst({
          where: {
            readerId: reader.id,
            deletedAt: null,
            status: {
              not: LoanStatus.RETURNED,
            },
          },
        });

        if (activeLoan) {
          throw new ConflictException({
            code: 'BR_04_ACTIVE_LOAN_EXISTS',
            message: 'Reader already has an active unreturned loan',
            details: { ma_doc_gia: dto.ma_doc_gia },
          });
        }

        const updated = await tx.bookCopy.updateMany({
          where: {
            id: copy.id,
            deletedAt: null,
            status: BookCopyStatus.AVAILABLE,
          },
          data: { status: BookCopyStatus.BORROWED },
        });

        if (updated.count === 0) {
          throw new ConflictException({
            code: 'BR_06_COPY_NOT_AVAILABLE',
            message: 'Copy is not available for borrowing',
            details: { ma_sach: dto.ma_sach },
          });
        }

        const loanedAt = dto.ngay_muon ? new Date(dto.ngay_muon) : new Date();

        const loan = await tx.loan.create({
          data: {
            readerId: reader.id,
            bookCopyId: copy.id,
            staffId: BigInt(user.staffId),
            loanedAt,
            status: LoanStatus.BORROWED,
            returnNote: dto.ghi_chu_tinh_trang ?? null,
          },
          include: { reader: true, bookCopy: true, staff: true },
        });

        return loan;
      });

      return serializeJsonValue(this.toView(loan));
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      mapPrismaError(error, 'Failed to create loan');
    }
  }

  async returnLoan(id: string, dto: ReturnLoanDto) {
    try {
      const loan = await this.prisma.$transaction(async (tx) => {
        const numericId = BigInt(id);

        const existing = await tx.loan.findFirst({
          where: { id: numericId, deletedAt: null },
          include: { bookCopy: true, reader: true, staff: true },
        });

        if (!existing) {
          throw new NotFoundException('Loan not found');
        }

        if (existing.status === LoanStatus.RETURNED) {
          throw new ConflictException({
            code: 'BR_11_LOAN_ALREADY_RETURNED',
            message: 'Loan has already been returned',
            details: { loanId: id },
          });
        }

        const returnedAt = dto.ngay_tra ? new Date(dto.ngay_tra) : new Date();
        const newCopyStatus = dto.tinh_trang_sau_tra;

        const newLoanStatus =
          newCopyStatus === BookCopyStatus.AVAILABLE
            ? LoanStatus.RETURNED
            : LoanStatus.NEEDS_REVIEW;

        const updatedLoan = await tx.loan.update({
          where: { id: existing.id },
          data: {
            status: newLoanStatus,
            returnedAt,
            returnNote: dto.ghi_chu_tinh_trang ?? null,
          },
          include: { reader: true, bookCopy: true, staff: true },
        });

        await tx.bookCopy.update({
          where: { id: existing.bookCopyId },
          data: { status: newCopyStatus },
        });

        return updatedLoan;
      });

      return serializeJsonValue(this.toView(loan));
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      mapPrismaError(error, 'Failed to return loan');
    }
  }

  private toView(loan: {
    id: bigint;
    loanedAt: Date;
    returnedAt: Date | null;
    status: LoanStatus;
    returnNote: string | null;
    reader: { code: string };
    bookCopy: { code: string };
    staff: { code: string };
  }) {
    return {
      id: loan.id,
      ma_doc_gia: loan.reader.code,
      ma_sach: loan.bookCopy.code,
      ma_thu_thu: loan.staff.code,
      ngay_muon: loan.loanedAt,
      ngay_tra: loan.returnedAt,
      tinh_trang: loan.status,
      ghi_chu_tinh_trang: loan.returnNote,
    };
  }
}
