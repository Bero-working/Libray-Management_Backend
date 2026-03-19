import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LoanStatus } from '@prisma/client';

import { mapPrismaError } from '../../common/errors/prisma-error.mapper';
import { serializeJsonValue } from '../../common/serializers/json-value.serializer';
import { PrismaService } from '../../database/prisma.service';
import { CreateCopyDto } from './dto/create-copy.dto';
import { UpdateCopyDto } from './dto/update-copy.dto';

@Injectable()
export class CopiesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCopyDto) {
    const title = await this.prisma.bookTitle.findFirst({
      where: { code: dto.ma_dau_sach, deletedAt: null },
    });

    if (!title) {
      throw new NotFoundException('Title not found');
    }

    try {
      const copy = await this.prisma.bookCopy.create({
        data: {
          code: dto.ma_sach,
          bookTitleId: title.id,
          status: dto.tinh_trang,
          acquiredAt: new Date(dto.ngay_nhap),
        },
      });

      return serializeJsonValue(copy);
    } catch (error: unknown) {
      mapPrismaError(error, 'Copy code already exists');
    }
  }

  async findAll() {
    const copies = await this.prisma.bookCopy.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: { bookTitle: true },
    });

    const result = copies.map((copy) => ({
      ma_sach: copy.code,
      ma_dau_sach: copy.bookTitle.code,
      tinh_trang: copy.status,
      ngay_nhap: copy.acquiredAt,
    }));

    return serializeJsonValue(result);
  }

  async findOneByCode(code: string) {
    const copy = await this.prisma.bookCopy.findFirst({
      where: { code, deletedAt: null },
      include: { bookTitle: true },
    });

    if (!copy) {
      throw new NotFoundException('Copy not found');
    }

    const result = {
      ma_sach: copy.code,
      ma_dau_sach: copy.bookTitle.code,
      tinh_trang: copy.status,
      ngay_nhap: copy.acquiredAt,
    };

    return serializeJsonValue(result);
  }

  async update(code: string, dto: UpdateCopyDto) {
    await this.ensureExists(code);

    const copy = await this.prisma.bookCopy.update({
      where: { code },
      data: {
        ...(dto.tinh_trang && { status: dto.tinh_trang }),
        ...(dto.ngay_nhap && { acquiredAt: new Date(dto.ngay_nhap) }),
      },
    });

    return serializeJsonValue(copy);
  }

  async softDelete(code: string) {
    const copy = await this.ensureExists(code);

    const hasActiveLoan = await this.prisma.loan.findFirst({
      where: {
        bookCopyId: copy.id,
        deletedAt: null,
        status: {
          not: LoanStatus.RETURNED,
        },
      },
    });

    if (hasActiveLoan) {
      throw new ConflictException({
        code: 'BR_08_COPY_HAS_ACTIVE_LOAN',
        message: 'Copy has active or pending loans',
        details: { ma_sach: code },
      });
    }

    const deleted = await this.prisma.bookCopy.update({
      where: { code },
      data: { deletedAt: new Date() },
    });

    return serializeJsonValue(deleted);
  }

  private async ensureExists(code: string) {
    const copy = await this.prisma.bookCopy.findFirst({
      where: { code, deletedAt: null },
    });

    if (!copy) {
      throw new NotFoundException('Copy not found');
    }

    return copy;
  }
}
