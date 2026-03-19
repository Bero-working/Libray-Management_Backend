import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LoanStatus } from '@prisma/client';

import { mapPrismaError } from '../../common/errors/prisma-error.mapper';
import { serializeJsonValue } from '../../common/serializers/json-value.serializer';
import { PrismaService } from '../../database/prisma.service';
import type { ReaderCardPayload } from './readers-pdf.service';
import { CreateReaderDto } from './dto/create-reader.dto';
import { UpdateReaderDto } from './dto/update-reader.dto';

@Injectable()
export class ReadersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateReaderDto) {
    try {
      const reader = await this.prisma.reader.create({
        data: {
          code: dto.ma_doc_gia,
          fullName: dto.ho_ten,
          className: dto.lop,
          birthDate: new Date(dto.ngay_sinh),
          gender: dto.gioi_tinh,
          status: dto.trang_thai,
        },
      });

      return serializeJsonValue(reader);
    } catch (error: unknown) {
      mapPrismaError(error, 'Reader code already exists');
    }
  }

  async findAll() {
    const readers = await this.prisma.reader.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    return serializeJsonValue(readers);
  }

  async findOneByCode(code: string) {
    const reader = await this.prisma.reader.findFirst({
      where: {
        code,
        deletedAt: null,
      },
    });

    if (!reader) {
      throw new NotFoundException('Reader not found');
    }

    return serializeJsonValue(reader);
  }

  async update(code: string, dto: UpdateReaderDto) {
    await this.ensureExists(code);

    const reader = await this.prisma.reader.update({
      where: { code },
      data: {
        ...(dto.ho_ten && { fullName: dto.ho_ten }),
        ...(dto.lop && { className: dto.lop }),
        ...(dto.ngay_sinh && { birthDate: new Date(dto.ngay_sinh) }),
        ...(dto.gioi_tinh && { gender: dto.gioi_tinh }),
        ...(dto.trang_thai && { status: dto.trang_thai }),
      },
    });

    return serializeJsonValue(reader);
  }

  async softDelete(code: string) {
    const reader = await this.ensureExists(code);

    const activeLoan = await this.prisma.loan.findFirst({
      where: {
        readerId: reader.id,
        status: LoanStatus.BORROWED,
        deletedAt: null,
      },
    });

    if (activeLoan) {
      throw new ConflictException({
        code: 'BR_09_READER_HAS_UNRETURNED_LOAN',
        message: 'Reader has unreturned loan',
        details: { ma_doc_gia: code },
      });
    }

    const deleted = await this.prisma.reader.update({
      where: { code },
      data: { deletedAt: new Date() },
    });

    return serializeJsonValue(deleted);
  }

  async getCardPayload(code: string): Promise<ReaderCardPayload> {
    const reader = await this.ensureExists(code);

    return {
      code: reader.code,
      fullName: reader.fullName,
      className: reader.className,
      status: reader.status,
    };
  }

  private async ensureExists(code: string) {
    const reader = await this.prisma.reader.findFirst({
      where: {
        code,
        deletedAt: null,
      },
    });

    if (!reader) {
      throw new NotFoundException('Reader not found');
    }

    return reader;
  }
}
