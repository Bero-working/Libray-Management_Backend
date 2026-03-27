import { BadRequestException, Injectable } from '@nestjs/common';
import { LoanStatus, Prisma } from '@prisma/client';

import { serializeJsonValue } from '../../common/serializers/json-value.serializer';
import { PrismaService } from '../../database/prisma.service';
import { TopBorrowedTitlesReportDto } from './dto/top-borrowed-titles-report.dto';
import { UnreturnedReadersReportDto } from './dto/unreturned-readers-report.dto';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getTopBorrowedTitles(query: TopBorrowedTitlesReportDto) {
    const from = this.parseDateOnly(query.from);
    const to = this.toEndOfDay(query.to);

    if (from > to) {
      throw new BadRequestException('from must be less than or equal to to');
    }

    if (this.daysBetween(from, to) > 366) {
      throw new BadRequestException('date range must not exceed 366 days');
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const offset = (page - 1) * limit;

    const aggregatedRows = await this.prisma.$queryRaw<
      Array<{
        ma_dau_sach: string;
        ten_dau_sach: string;
        tac_gia: string;
        ma_chuyen_nganh: string;
        ten_chuyen_nganh: string;
        so_luot_muon: bigint;
      }>
    >(Prisma.sql`
      SELECT
        bt.ma_dau_sach,
        bt.ten_dau_sach,
        bt.tac_gia,
        m.ma_chuyen_nganh,
        m.ten_chuyen_nganh,
        COUNT(l.id)::bigint AS so_luot_muon
      FROM loans l
      JOIN book_copies bc ON bc.id = l.book_copy_id AND bc.deleted_at IS NULL
      JOIN book_titles bt ON bt.id = bc.book_title_id AND bt.deleted_at IS NULL
      JOIN majors m ON m.id = bt.major_id AND m.deleted_at IS NULL
      WHERE l.deleted_at IS NULL
        AND l.ngay_muon >= ${from}
        AND l.ngay_muon <= ${to}
      GROUP BY bt.ma_dau_sach, bt.ten_dau_sach, bt.tac_gia, m.ma_chuyen_nganh, m.ten_chuyen_nganh
      ORDER BY so_luot_muon DESC, bt.ten_dau_sach ASC, bt.ma_dau_sach ASC
      LIMIT ${limit}
      OFFSET ${offset}
    `);

    const totalRows = await this.prisma.$queryRaw<
      Array<{ total: bigint }>
    >(Prisma.sql`
      SELECT COUNT(*)::bigint AS total
      FROM (
        SELECT bt.id
        FROM loans l
        JOIN book_copies bc ON bc.id = l.book_copy_id AND bc.deleted_at IS NULL
        JOIN book_titles bt ON bt.id = bc.book_title_id AND bt.deleted_at IS NULL
        JOIN majors m ON m.id = bt.major_id AND m.deleted_at IS NULL
        WHERE l.deleted_at IS NULL
          AND l.ngay_muon >= ${from}
          AND l.ngay_muon <= ${to}
        GROUP BY bt.id
      ) grouped_titles
    `);

    const total = Number(totalRows[0]?.total ?? BigInt(0));
    const items = aggregatedRows.map((row, index) => ({
      rank: offset + index + 1,
      ma_dau_sach: row.ma_dau_sach,
      ten_dau_sach: row.ten_dau_sach,
      tac_gia: row.tac_gia,
      ma_chuyen_nganh: row.ma_chuyen_nganh,
      ten_chuyen_nganh: row.ten_chuyen_nganh,
      so_luot_muon: Number(row.so_luot_muon),
    }));

    return serializeJsonValue({
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
        from: query.from,
        to: query.to,
      },
    });
  }

  async getUnreturnedReaders(query: UnreturnedReadersReportDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = {
      deletedAt: null,
      loans: {
        some: {
          deletedAt: null,
          status: {
            not: LoanStatus.RETURNED,
          },
        },
      },
    };

    const [readers, total] = await this.prisma.$transaction([
      this.prisma.reader.findMany({
        where,
        skip,
        take: limit,
        orderBy: { code: 'asc' },
        include: {
          loans: {
            where: {
              deletedAt: null,
              status: {
                not: LoanStatus.RETURNED,
              },
              bookCopy: {
                deletedAt: null,
                bookTitle: {
                  deletedAt: null,
                },
              },
            },
            include: {
              bookCopy: {
                include: {
                  bookTitle: true,
                },
              },
            },
            orderBy: { loanedAt: 'desc' },
          },
        },
      }),
      this.prisma.reader.count({ where }),
    ]);

    return serializeJsonValue({
      items: readers.map((reader) => ({
        ma_doc_gia: reader.code,
        ho_ten: reader.fullName,
        lop: reader.className,
        trang_thai: reader.status,
        so_phieu_muon_dang_mo: reader.loans.length,
        phieu_muon_dang_mo: reader.loans.map((loan) => ({
          loan_id: loan.id,
          ma_sach: loan.bookCopy.code,
          ma_dau_sach: loan.bookCopy.bookTitle.code,
          ten_dau_sach: loan.bookCopy.bookTitle.name,
          ngay_muon: loan.loanedAt,
          tinh_trang: loan.status,
        })),
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  }

  private toEndOfDay(value: string): Date {
    const date = this.parseDateOnly(value);
    date.setUTCHours(23, 59, 59, 999);

    return date;
  }

  private parseDateOnly(value: string): Date {
    return new Date(`${value}T00:00:00.000Z`);
  }

  private daysBetween(from: Date, to: Date): number {
    return Math.floor((to.getTime() - from.getTime()) / 86_400_000);
  }
}
