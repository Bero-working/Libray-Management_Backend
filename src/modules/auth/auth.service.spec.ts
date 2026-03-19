import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AccountRole, AccountStatus, StaffStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../database/prisma.service';
import { AuthService } from './auth.service';

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('AuthService', () => {
  const createConfigService = () =>
    ({
      getOrThrow: jest.fn((key: string) => {
        const values: Record<string, string | number> = {
          'auth.accessTokenSecret': 'test-access-secret-test-access-secret',
          'auth.accessTokenTtl': '15m',
          'auth.refreshTokenSecret': 'test-refresh-secret-test-refresh-secret',
          'auth.refreshTokenTtl': '7d',
        };

        const value = values[key];
        if (value === undefined) {
          throw new Error(`Unexpected config lookup: ${key}`);
        }

        return value;
      }),
    }) as unknown as ConfigService;

  const createPrismaService = () =>
    ({
      staffAccount: {
        findFirst: jest.fn().mockResolvedValue(createAccount()),
        update: jest.fn(),
      },
    }) as unknown as PrismaService;

  const createJwtService = () =>
    ({
      signAsync: jest.fn().mockImplementation((payload: object) => {
        if ('tokenType' in payload && payload.tokenType === 'refresh') {
          return Promise.resolve('refresh-token');
        }

        return Promise.resolve('access-token');
      }),
      verifyAsync: jest.fn().mockResolvedValue({
        sub: '1',
        tokenType: 'refresh',
      }),
    }) as unknown as JwtService;

  const createAccount = () => ({
    id: BigInt(1),
    username: 'admin',
    passwordHash: 'hashed-password',
    role: AccountRole.ADMIN,
    status: AccountStatus.ACTIVE,
    refreshTokenHash: 'hashed-refresh-token',
    staffId: BigInt(1),
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    staff: {
      id: BigInt(1),
      code: 'NV001',
      fullName: 'Admin User',
      contactInfo: 'admin@example.com',
      status: StaffStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    },
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('stores a hashed refresh token when issuing auth tokens', async () => {
    const prismaService = createPrismaService();
    const authService = new AuthService(
      prismaService,
      createJwtService(),
      createConfigService(),
    );

    const hashMock = jest.mocked(bcrypt.hash);
    hashMock.mockResolvedValue('hashed-refresh-token' as never);

    const tokens = await authService.issueTokens(createAccount());

    expect(tokens).toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
    const updateCalls = (prismaService.staffAccount.update as jest.Mock).mock
      .calls;

    expect(updateCalls).toContainEqual([
      {
        where: { id: BigInt(1) },
        data: { refreshTokenHash: 'hashed-refresh-token' },
      },
    ]);
  });

  it('clears the stored refresh token on logout', async () => {
    const prismaService = createPrismaService();
    const authService = new AuthService(
      prismaService,
      createJwtService(),
      createConfigService(),
    );
    const compareMock = jest.mocked(bcrypt.compare);
    compareMock.mockResolvedValue(true as never);

    await authService.logout('refresh-token');

    const updateCalls = (prismaService.staffAccount.update as jest.Mock).mock
      .calls;

    expect(updateCalls).toContainEqual([
      {
        where: { id: BigInt(1) },
        data: { refreshTokenHash: null },
      },
    ]);
  });

  it('rejects logout when refresh token hash does not match', async () => {
    const prismaService = createPrismaService();
    const authService = new AuthService(
      prismaService,
      createJwtService(),
      createConfigService(),
    );
    const compareMock = jest.mocked(bcrypt.compare);
    compareMock.mockResolvedValue(false as never);

    await expect(authService.logout('refresh-token')).rejects.toThrow(
      'Refresh token is invalid',
    );
  });
});
