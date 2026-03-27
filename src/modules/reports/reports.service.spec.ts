import { BadRequestException } from '@nestjs/common';
import { LoanStatus, ReaderStatus } from '@prisma/client';

import type { PrismaService } from '../../database/prisma.service';
import { ReportsService } from './reports.service';

describe('ReportsService', () => {
  it('aggregates top borrowed titles by title instead of by copy', async () => {
    const prisma = {
      loan: {
        findMany: jest.fn(),
      },
      reader: {
        findMany: jest.fn(),
        count: jest.fn(),
      },
      $queryRaw: jest.fn(),
      $transaction: jest
        .fn()
        .mockImplementation(async (operations: Array<Promise<unknown>>) =>
          Promise.all(operations),
        ),
    } as unknown as PrismaService;

    const service = new ReportsService(prisma);

    (prisma.$queryRaw as jest.Mock)
      .mockResolvedValueOnce([
        {
          ma_dau_sach: 'DS001',
          ten_dau_sach: 'Clean Code',
          tac_gia: 'Robert C. Martin',
          ma_chuyen_nganh: 'CN001',
          ten_chuyen_nganh: 'CNTT',
          so_luot_muon: BigInt(2),
        },
        {
          ma_dau_sach: 'DS002',
          ten_dau_sach: 'Domain-Driven Design',
          tac_gia: 'Eric Evans',
          ma_chuyen_nganh: 'CN001',
          ten_chuyen_nganh: 'CNTT',
          so_luot_muon: BigInt(1),
        },
      ])
      .mockResolvedValueOnce([{ total: BigInt(2) }]);

    const result = await service.getTopBorrowedTitles({
      from: '2026-03-01',
      to: '2026-03-31',
      page: 1,
      limit: 10,
    });

    expect(result).toEqual({
      items: [
        {
          rank: 1,
          ma_dau_sach: 'DS001',
          ten_dau_sach: 'Clean Code',
          tac_gia: 'Robert C. Martin',
          ma_chuyen_nganh: 'CN001',
          ten_chuyen_nganh: 'CNTT',
          so_luot_muon: 2,
        },
        {
          rank: 2,
          ma_dau_sach: 'DS002',
          ten_dau_sach: 'Domain-Driven Design',
          tac_gia: 'Eric Evans',
          ma_chuyen_nganh: 'CN001',
          ten_chuyen_nganh: 'CNTT',
          so_luot_muon: 1,
        },
      ],
      meta: {
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
        from: '2026-03-01',
        to: '2026-03-31',
      },
    });
  });

  it('rejects reversed report date range', async () => {
    const prisma = {
      loan: {
        findMany: jest.fn(),
      },
      reader: {
        findMany: jest.fn(),
        count: jest.fn(),
      },
      $queryRaw: jest.fn(),
      $transaction: jest.fn(),
    } as unknown as PrismaService;

    const service = new ReportsService(prisma);

    await expect(
      service.getTopBorrowedTitles({
        from: '2026-03-31',
        to: '2026-03-01',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects date ranges longer than 366 days', async () => {
    const prisma = {
      loan: {
        findMany: jest.fn(),
      },
      reader: {
        findMany: jest.fn(),
        count: jest.fn(),
      },
      $queryRaw: jest.fn(),
      $transaction: jest.fn(),
    } as unknown as PrismaService;

    const service = new ReportsService(prisma);

    await expect(
      service.getTopBorrowedTitles({
        from: '2025-01-01',
        to: '2026-12-31',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('returns reader-centric rows for active unreturned loans', async () => {
    const prisma = {
      loan: {
        findMany: jest.fn(),
      },
      reader: {
        findMany: jest.fn(),
        count: jest.fn(),
      },
      $transaction: jest
        .fn()
        .mockImplementation(async (operations: Array<Promise<unknown>>) =>
          Promise.all(operations),
        ),
    } as unknown as PrismaService;

    const service = new ReportsService(prisma);

    (prisma.reader.findMany as jest.Mock).mockResolvedValue([
      {
        code: 'DG001',
        fullName: 'Nguyen Van A',
        className: 'CTK42',
        status: ReaderStatus.ACTIVE,
        loans: [
          {
            id: BigInt(10),
            loanedAt: new Date('2026-03-15'),
            status: LoanStatus.BORROWED,
            bookCopy: {
              code: 'S001',
              bookTitle: {
                code: 'DS001',
                name: 'Clean Code',
              },
            },
          },
        ],
      },
    ]);
    (prisma.reader.count as jest.Mock).mockResolvedValue(1);

    const result = await service.getUnreturnedReaders({
      page: 1,
      limit: 10,
    });

    expect(result).toEqual({
      items: [
        {
          ma_doc_gia: 'DG001',
          ho_ten: 'Nguyen Van A',
          lop: 'CTK42',
          trang_thai: ReaderStatus.ACTIVE,
          so_phieu_muon_dang_mo: 1,
          phieu_muon_dang_mo: [
            {
              loan_id: '10',
              ma_sach: 'S001',
              ma_dau_sach: 'DS001',
              ten_dau_sach: 'Clean Code',
              ngay_muon: new Date('2026-03-15'),
              tinh_trang: LoanStatus.BORROWED,
            },
          ],
        },
      ],
      meta: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      },
    });
  });
});
