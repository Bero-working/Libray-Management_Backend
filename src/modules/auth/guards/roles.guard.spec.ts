import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AccountRole } from '@prisma/client';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  const createExecutionContext = (roles: AccountRole[]) =>
    ({
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({
          user: { roles },
        }),
      }),
    }) as unknown as ExecutionContext;

  it('allows requests when no roles are required', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(undefined),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    expect(guard.canActivate(createExecutionContext([AccountRole.ADMIN]))).toBe(
      true,
    );
  });

  it('allows requests when the user has a required role', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue([AccountRole.ADMIN]),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    expect(guard.canActivate(createExecutionContext([AccountRole.ADMIN]))).toBe(
      true,
    );
  });

  it('rejects requests when the user lacks the required role', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue([AccountRole.ADMIN]),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    expect(
      guard.canActivate(createExecutionContext([AccountRole.LIBRARIAN])),
    ).toBe(false);
  });
});
