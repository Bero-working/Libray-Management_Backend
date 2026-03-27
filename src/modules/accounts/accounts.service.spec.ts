import { ConflictException } from '@nestjs/common';
import { AccountRole, AccountStatus, StaffStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../database/prisma.service';
import { AccountsService } from './accounts.service';

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
}));

describe('AccountsService', () => {
  const createStaff = () => ({
    id: BigInt(10),
    code: 'NV001',
    fullName: 'Tran Thi B',
    contactInfo: 'tranb@example.com',
    status: StaffStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  });

  const createAccount = (overrides: Partial<Record<string, unknown>> = {}) => ({
    id: BigInt(11),
    username: 'librarian01',
    passwordHash: 'hashed-password',
    role: AccountRole.LIBRARIAN,
    status: AccountStatus.ACTIVE,
    staffId: BigInt(10),
    refreshTokenHash: 'refresh-hash',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    staff: createStaff(),
    ...overrides,
  });

  const createPrismaService = () =>
    ({
      staff: {
        findFirst: jest.fn().mockResolvedValue(createStaff()),
      },
      staffAccount: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
      },
    }) as unknown as PrismaService;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('restores a soft-deleted account for the same staff instead of creating a new row', async () => {
    const prismaService = createPrismaService();
    const accountsService = new AccountsService(prismaService);
    const hashMock = jest.mocked(bcrypt.hash);
    hashMock.mockResolvedValue('new-hash' as never);

    (prismaService.staffAccount.findFirst as jest.Mock)
      .mockResolvedValueOnce(
        createAccount({
          deletedAt: new Date('2026-03-19T03:05:33.150Z'),
        }),
      )
      .mockResolvedValueOnce(null);

    (prismaService.staffAccount.update as jest.Mock).mockResolvedValue(
      createAccount({
        username: 'librarian02',
        passwordHash: 'new-hash',
        refreshTokenHash: null,
        deletedAt: null,
      }),
    );

    const response = await accountsService.create({
      username: 'librarian02',
      password: '12345678',
      role: AccountRole.LIBRARIAN,
      staffCode: 'NV001',
      status: AccountStatus.ACTIVE,
    });

    expect(prismaService.staffAccount.create).not.toHaveBeenCalled();
    expect(prismaService.staffAccount.update).toHaveBeenCalledWith({
      where: {
        id: BigInt(11),
      },
      data: {
        username: 'librarian02',
        passwordHash: 'new-hash',
        role: AccountRole.LIBRARIAN,
        staffId: BigInt(10),
        status: AccountStatus.ACTIVE,
        deletedAt: null,
        refreshTokenHash: null,
      },
      include: {
        staff: true,
      },
    });
    expect(response).toMatchObject({
      username: 'librarian02',
      staffId: '10',
      deletedAt: null,
    });
  });

  it('rejects create when an active account already exists for the staff or username', async () => {
    const prismaService = createPrismaService();
    const accountsService = new AccountsService(prismaService);
    const hashMock = jest.mocked(bcrypt.hash);
    hashMock.mockResolvedValue('new-hash' as never);

    (prismaService.staffAccount.findFirst as jest.Mock)
      .mockResolvedValueOnce(createAccount())
      .mockResolvedValueOnce(null);

    await expect(
      accountsService.create({
        username: 'another-user',
        password: '12345678',
        role: AccountRole.LIBRARIAN,
        staffCode: 'NV001',
        status: AccountStatus.ACTIVE,
      }),
    ).rejects.toThrow(ConflictException);
  });
});
