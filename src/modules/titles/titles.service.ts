import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LoanStatus } from '@prisma/client';

import { mapPrismaError } from '../../common/errors/prisma-error.mapper';
import { serializeJsonValue } from '../../common/serializers/json-value.serializer';
import { PrismaService } from '../../database/prisma.service';
import { CreateTitleDto } from './dto/create-title.dto';
import { UpdateTitleDto } from './dto/update-title.dto';

@Injectable()
export class TitlesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTitleDto) {
    const major = await this.prisma.major.findFirst({
      where: { code: dto.ma_chuyen_nganh, deletedAt: null },
    });

    if (!major) {
      throw new NotFoundException('Major not found');
    }

    try {
      const title = await this.prisma.bookTitle.create({
        data: {
          code: dto.ma_dau_sach,
          name: dto.ten_dau_sach,
          publisher: dto.nha_xuat_ban,
          pageCount: dto.so_trang,
          size: dto.kich_thuoc,
          author: dto.tac_gia,
          majorId: major.id,
        },
      });

      return serializeJsonValue(title);
    } catch (error: unknown) {
      mapPrismaError(error, 'Title code already exists');
    }
  }

  async findAll() {
    const titles = await this.prisma.bookTitle.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: { major: true },
    });

    if (titles.length === 0) {
      return [];
    }

    const ids = titles.map((t) => t.id);

    const counts = await this.prisma.bookCopy.groupBy({
      by: ['bookTitleId'],
      _count: { _all: true },
      where: {
        bookTitleId: { in: ids },
        deletedAt: null,
      },
    });

    const countMap = new Map<bigint, number>();
    for (const item of counts) {
      countMap.set(item.bookTitleId, item._count._all);
    }

    const result = titles.map((title) => ({
      ma_dau_sach: title.code,
      ten_dau_sach: title.name,
      nha_xuat_ban: title.publisher,
      so_trang: title.pageCount,
      kich_thuoc: title.size,
      tac_gia: title.author,
      ma_chuyen_nganh: title.major.code,
      so_luong_sach: countMap.get(title.id) ?? 0,
    }));

    return serializeJsonValue(result);
  }

  async findOneByCode(code: string) {
    const title = await this.prisma.bookTitle.findFirst({
      where: { code, deletedAt: null },
      include: { major: true },
    });

    if (!title) {
      throw new NotFoundException('Title not found');
    }

    const copiesCount = await this.prisma.bookCopy.count({
      where: {
        bookTitleId: title.id,
        deletedAt: null,
      },
    });

    const result = {
      ma_dau_sach: title.code,
      ten_dau_sach: title.name,
      nha_xuat_ban: title.publisher,
      so_trang: title.pageCount,
      kich_thuoc: title.size,
      tac_gia: title.author,
      ma_chuyen_nganh: title.major.code,
      so_luong_sach: copiesCount,
    };

    return serializeJsonValue(result);
  }

  async update(code: string, dto: UpdateTitleDto) {
    const existing = await this.prisma.bookTitle.findFirst({
      where: { code, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException('Title not found');
    }

    let majorId: bigint | undefined;

    if (dto.ma_chuyen_nganh) {
      const major = await this.prisma.major.findFirst({
        where: { code: dto.ma_chuyen_nganh, deletedAt: null },
      });

      if (!major) {
        throw new NotFoundException('Major not found');
      }

      majorId = major.id;
    }

    try {
      const title = await this.prisma.bookTitle.update({
        where: { code },
        data: {
          ...(dto.ten_dau_sach && { name: dto.ten_dau_sach }),
          ...(dto.nha_xuat_ban && { publisher: dto.nha_xuat_ban }),
          ...(dto.so_trang && { pageCount: dto.so_trang }),
          ...(dto.kich_thuoc && { size: dto.kich_thuoc }),
          ...(dto.tac_gia && { author: dto.tac_gia }),
          ...(majorId && { majorId }),
        },
      });

      return serializeJsonValue(title);
    } catch (error: unknown) {
      mapPrismaError(error, 'Title update conflicts with existing data');
    }
  }

  async softDelete(code: string) {
    const title = await this.prisma.bookTitle.findFirst({
      where: { code, deletedAt: null },
    });

    if (!title) {
      throw new NotFoundException('Title not found');
    }

    const hasCopies = await this.prisma.bookCopy.findFirst({
      where: {
        bookTitleId: title.id,
        deletedAt: null,
      },
    });

    const hasActiveLoans = await this.prisma.loan.findFirst({
      where: {
        deletedAt: null,
        status: {
          not: LoanStatus.RETURNED,
        },
        bookCopy: {
          bookTitleId: title.id,
          deletedAt: null,
        },
      },
    });

    if (hasCopies || hasActiveLoans) {
      throw new ConflictException({
        code: 'BR_07_TITLE_HAS_DEPENDENCIES',
        message: 'Title has active copies or loans',
        details: { ma_dau_sach: code },
      });
    }

    const deleted = await this.prisma.bookTitle.update({
      where: { code },
      data: { deletedAt: new Date() },
    });

    return serializeJsonValue(deleted);
  }
}
