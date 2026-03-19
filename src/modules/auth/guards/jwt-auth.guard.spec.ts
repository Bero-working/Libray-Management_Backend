import { UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AccountRole } from '@prisma/client';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  const createReflector = (isPublic = false) =>
    ({
      getAllAndOverride: jest.fn().mockReturnValue(isPublic),
    }) as unknown as Reflector;

  const createJwtService = () =>
    ({
      verifyAsync: jest.fn().mockResolvedValue({
        sub: '1',
        jti: 'token-id',
        roles: [AccountRole.ADMIN],
        staffCode: 'NV001',
        staffId: '1',
        tokenType: 'access',
        username: 'admin',
      }),
    }) as unknown as JwtService;

  const createConfigService = () =>
    ({
      getOrThrow: jest
        .fn()
        .mockReturnValue('test-access-secret-test-access-secret'),
    }) as unknown as ConfigService;

  const createContext = (authorization?: string) => {
    const request = {
      headers: { authorization },
    } as {
      headers: { authorization?: string };
      user?: unknown;
    };

    return {
      context: {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: () => ({
          getRequest: () => request,
        }),
      },
      request,
    };
  };

  it('allows public routes without a token', async () => {
    const guard = new JwtAuthGuard(
      createReflector(true),
      createJwtService(),
      createConfigService(),
    );
    const { context } = createContext();

    await expect(guard.canActivate(context as never)).resolves.toBe(true);
  });

  it('rejects requests without a bearer token', async () => {
    const guard = new JwtAuthGuard(
      createReflector(false),
      createJwtService(),
      createConfigService(),
    );
    const { context } = createContext();

    await expect(guard.canActivate(context as never)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('attaches the authenticated user to the request', async () => {
    const guard = new JwtAuthGuard(
      createReflector(false),
      createJwtService(),
      createConfigService(),
    );
    const { context, request } = createContext('Bearer valid-token');

    await expect(guard.canActivate(context as never)).resolves.toBe(true);
    expect(request.user).toEqual({
      accountId: '1',
      roles: [AccountRole.ADMIN],
      staffCode: 'NV001',
      staffId: '1',
      tokenId: 'token-id',
      username: 'admin',
    });
  });
});
