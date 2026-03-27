/* eslint-disable @typescript-eslint/unbound-method, @typescript-eslint/no-unsafe-assignment */
import { BookCopyStatus } from '@prisma/client';

import type { PrismaService } from '../../database/prisma.service';
import { SearchService } from './search.service';

describe('SearchService', () => {
  it('returns paginated title-centric results with matched copies and total copy counts', async () => {
    const prisma = {
      bookTitle: {
        findMany: jest.fn(),
        count: jest.fn(),
      },
      bookCopy: {
        groupBy: jest.fn(),
      },
      $transaction: jest
        .fn()
        .mockImplementation(async (operations: Array<Promise<unknown>>) =>
          Promise.all(operations),
        ),
    } as unknown as PrismaService;

    const service = new SearchService(prisma);

    (prisma.bookTitle.findMany as jest.Mock).mockResolvedValue([
      {
        id: BigInt(1),
        code: 'DS001',
        name: 'Clean Code',
        publisher: 'Prentice Hall',
        pageCount: 464,
        size: '16x24 cm',
        author: 'Robert C. Martin',
        major: {
          code: 'CN001',
          name: 'Cong nghe thong tin',
        },
        copies: [
          {
            code: 'S001',
            status: BookCopyStatus.AVAILABLE,
          },
        ],
      },
    ]);
    (prisma.bookTitle.count as jest.Mock).mockResolvedValue(1);
    (prisma.bookCopy.groupBy as jest.Mock).mockResolvedValue([
      {
        bookTitleId: BigInt(1),
        _count: { _all: 3 },
      },
    ]);

    const result = await service.findBooks({
      ma_sach: 'S001',
      tinh_trang: BookCopyStatus.AVAILABLE,
      page: 1,
      limit: 10,
    });

    expect(prisma.bookTitle.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          deletedAt: null,
          copies: {
            some: {
              deletedAt: null,
              code: {
                contains: 'S001',
                mode: 'insensitive',
              },
              status: BookCopyStatus.AVAILABLE,
            },
          },
        }),
        skip: 0,
        take: 10,
      }),
    );
    expect(result).toEqual({
      items: [
        {
          ma_dau_sach: 'DS001',
          ten_dau_sach: 'Clean Code',
          nha_xuat_ban: 'Prentice Hall',
          so_trang: 464,
          kich_thuoc: '16x24 cm',
          tac_gia: 'Robert C. Martin',
          ma_chuyen_nganh: 'CN001',
          ten_chuyen_nganh: 'Cong nghe thong tin',
          so_luong_sach: 3,
          ban_sao_phu_hop: [
            {
              ma_sach: 'S001',
              tinh_trang: BookCopyStatus.AVAILABLE,
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

  it('returns an empty paginated result when no title matches', async () => {
    const prisma = {
      bookTitle: {
        findMany: jest.fn(),
        count: jest.fn(),
      },
      bookCopy: {
        groupBy: jest.fn(),
      },
      $transaction: jest
        .fn()
        .mockImplementation(async (operations: Array<Promise<unknown>>) =>
          Promise.all(operations),
        ),
    } as unknown as PrismaService;

    const service = new SearchService(prisma);

    (prisma.bookTitle.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.bookTitle.count as jest.Mock).mockResolvedValue(0);

    const result = await service.findBooks({});

    expect(prisma.bookCopy.groupBy).not.toHaveBeenCalled();
    expect(result).toEqual({
      items: [],
      meta: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 1,
      },
    });
  });

  it('applies major and author filters without requiring copy filters', async () => {
    const prisma = {
      bookTitle: {
        findMany: jest.fn(),
        count: jest.fn(),
      },
      bookCopy: {
        groupBy: jest.fn(),
      },
      $transaction: jest
        .fn()
        .mockImplementation(async (operations: Array<Promise<unknown>>) =>
          Promise.all(operations),
        ),
    } as unknown as PrismaService;

    const service = new SearchService(prisma);

    (prisma.bookTitle.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.bookTitle.count as jest.Mock).mockResolvedValue(0);

    await service.findBooks({
      tac_gia: 'Martin',
      ma_chuyen_nganh: 'CN',
    });

    expect(prisma.bookTitle.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          author: {
            contains: 'Martin',
            mode: 'insensitive',
          },
          major: {
            deletedAt: null,
            code: {
              contains: 'CN',
              mode: 'insensitive',
            },
          },
        }),
      }),
    );
  });
});
