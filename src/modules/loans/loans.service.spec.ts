/* eslint-disable @typescript-eslint/unbound-method, @typescript-eslint/no-unsafe-assignment */
import { BookCopyStatus, LoanStatus } from '@prisma/client';

import type { PrismaService } from '../../database/prisma.service';
import { LoansService } from './loans.service';

describe('LoansService', () => {
  it('creates a loan and updates copy status when reader and copy are valid and available', async () => {
    const prisma = {
      loan: {
        findMany: jest.fn(),
        count: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      reader: {
        findFirst: jest.fn(),
      },
      bookCopy: {
        findFirst: jest.fn(),
        updateMany: jest.fn(),
        update: jest.fn(),
      },
      $transaction: jest
        .fn()
        .mockImplementation(
          async (operations: (tx: PrismaService) => Promise<unknown>) =>
            operations(prisma as unknown as PrismaService),
        ),
    } as unknown as PrismaService;

    const service = new LoansService(prisma);

    (prisma.reader.findFirst as jest.Mock).mockResolvedValue({
      id: BigInt(1),
      code: 'DG001',
      deletedAt: null,
    });

    (prisma.bookCopy.findFirst as jest.Mock).mockResolvedValue({
      id: BigInt(10),
      code: 'S001',
      status: BookCopyStatus.AVAILABLE,
      deletedAt: null,
    });

    (prisma.loan.findFirst as jest.Mock).mockResolvedValue(null);

    (prisma.bookCopy.updateMany as jest.Mock).mockResolvedValue({
      count: 1,
    });

    (prisma.loan.create as jest.Mock).mockResolvedValue({
      id: BigInt(100),
      loanedAt: new Date('2026-03-19'),
      returnedAt: null,
      status: LoanStatus.BORROWED,
      returnNote: null,
      reader: { code: 'DG001' },
      bookCopy: { code: 'S001' },
      staff: { code: 'NV_LIB_001' },
    });

    await service.create(
      {
        ma_doc_gia: 'DG001',
        ma_sach: 'S001',
        ngay_muon: '2026-03-19',
      },
      {
        id: '1',
        role: 'LIBRARIAN',
        staffCode: 'NV_LIB_001',
        staffId: '1',
        username: 'librarian',
      },
    );

    expect(prisma.bookCopy.updateMany).toHaveBeenCalledWith({
      where: {
        id: BigInt(10),
        deletedAt: null,
        status: BookCopyStatus.AVAILABLE,
      },
      data: { status: BookCopyStatus.BORROWED },
    });

    expect(prisma.loan.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        readerId: BigInt(1),
        bookCopyId: BigInt(10),
        staffId: BigInt(1),
        status: LoanStatus.BORROWED,
      }),
      include: { reader: true, bookCopy: true, staff: true },
    });
  });
});
