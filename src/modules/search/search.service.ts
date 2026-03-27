import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { serializeJsonValue } from '../../common/serializers/json-value.serializer';
import { PrismaService } from '../../database/prisma.service';
import { SearchBooksDto } from './dto/search-books.dto';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async findBooks(filters: SearchBooksDto) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const skip = (page - 1) * limit;
    const titleWhere = this.buildTitleWhere(filters);
    const copyWhere = this.buildCopyWhere(filters);

    const [titles, total] = await this.prisma.$transaction([
      this.prisma.bookTitle.findMany({
        where: titleWhere,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          major: true,
          copies: {
            where: copyWhere,
            orderBy: { createdAt: 'desc' },
          },
        },
      }),
      this.prisma.bookTitle.count({ where: titleWhere }),
    ]);

    if (titles.length === 0) {
      return serializeJsonValue({
        items: [],
        meta: this.buildMeta(page, limit, total),
      });
    }

    const counts = await this.prisma.bookCopy.groupBy({
      by: ['bookTitleId'],
      where: {
        bookTitleId: { in: titles.map((title) => title.id) },
        deletedAt: null,
      },
      _count: { _all: true },
    });

    const copiesCountByTitleId = new Map<bigint, number>();
    for (const item of counts) {
      copiesCountByTitleId.set(item.bookTitleId, item._count._all);
    }

    return serializeJsonValue({
      items: titles.map((title) => ({
        ma_dau_sach: title.code,
        ten_dau_sach: title.name,
        nha_xuat_ban: title.publisher,
        so_trang: title.pageCount,
        kich_thuoc: title.size,
        tac_gia: title.author,
        ma_chuyen_nganh: title.major.code,
        ten_chuyen_nganh: title.major.name,
        so_luong_sach: copiesCountByTitleId.get(title.id) ?? 0,
        ban_sao_phu_hop: title.copies.map((copy) => ({
          ma_sach: copy.code,
          tinh_trang: copy.status,
        })),
      })),
      meta: this.buildMeta(page, limit, total),
    });
  }

  private buildTitleWhere(filters: SearchBooksDto): Prisma.BookTitleWhereInput {
    const maDauSach = this.normalize(filters.ma_dau_sach);
    const tenDauSach = this.normalize(filters.ten_dau_sach);
    const tacGia = this.normalize(filters.tac_gia);
    const maChuyenNganh = this.normalize(filters.ma_chuyen_nganh);
    const hasCopyFilters =
      this.normalize(filters.ma_sach) !== undefined ||
      filters.tinh_trang !== undefined;

    return {
      deletedAt: null,
      ...(maDauSach
        ? {
            code: {
              contains: maDauSach,
              mode: 'insensitive',
            },
          }
        : {}),
      ...(tenDauSach
        ? {
            name: {
              contains: tenDauSach,
              mode: 'insensitive',
            },
          }
        : {}),
      ...(tacGia
        ? {
            author: {
              contains: tacGia,
              mode: 'insensitive',
            },
          }
        : {}),
      major: {
        deletedAt: null,
        ...(maChuyenNganh
          ? {
              code: {
                contains: maChuyenNganh,
                mode: 'insensitive',
              },
            }
          : {}),
      },
      ...(hasCopyFilters
        ? {
            copies: {
              some: this.buildCopyWhere(filters),
            },
          }
        : {}),
    };
  }

  private buildCopyWhere(filters: SearchBooksDto): Prisma.BookCopyWhereInput {
    const maSach = this.normalize(filters.ma_sach);

    return {
      deletedAt: null,
      ...(maSach
        ? {
            code: {
              contains: maSach,
              mode: 'insensitive',
            },
          }
        : {}),
      ...(filters.tinh_trang ? { status: filters.tinh_trang } : {}),
    };
  }

  private buildMeta(page: number, limit: number, total: number) {
    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  private normalize(value?: string): string | undefined {
    const trimmed = value?.trim();

    return trimmed ? trimmed : undefined;
  }
}
