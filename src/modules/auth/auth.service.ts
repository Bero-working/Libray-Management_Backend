import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  AccountStatus,
  StaffStatus,
  type StaffAccount,
  type Staff,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import type { StringValue } from 'ms';
import { PrismaService } from '../../database/prisma.service';
import type { JwtTokenPayload } from './interfaces/authenticated-user.interface';

type AccountWithStaff = StaffAccount & {
  staff: Staff;
};

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(
    username: string,
    password: string,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      role: AccountWithStaff['role'];
      staffCode: string;
      staffId: string;
      username: string;
    };
  }> {
    const account = await this.prismaService.staffAccount.findFirst({
      where: {
        username,
        deletedAt: null,
      },
      include: {
        staff: true,
      },
    });

    if (!account || !(await bcrypt.compare(password, account.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    this.ensureAccountIsActive(account);

    const tokens = await this.issueTokens(account);

    return {
      ...tokens,
      user: {
        id: account.id.toString(),
        role: account.role,
        staffCode: account.staff.code,
        staffId: account.staff.id.toString(),
        username: account.username,
      },
    };
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    const account = await this.validateRefreshToken(refreshToken);

    return this.issueTokens(account);
  }

  async logout(refreshToken: string): Promise<void> {
    const account = await this.validateRefreshToken(refreshToken);

    await this.clearRefreshToken(account.id);
  }

  async issueTokens(account: AccountWithStaff): Promise<AuthTokens> {
    const payload = this.buildPayload(account);
    const accessTokenTtl = this.configService.getOrThrow<string>(
      'auth.accessTokenTtl',
    ) as StringValue;
    const refreshTokenTtl = this.configService.getOrThrow<string>(
      'auth.refreshTokenTtl',
    ) as StringValue;

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow<string>('auth.accessTokenSecret'),
        expiresIn: accessTokenTtl,
      }),
      this.jwtService.signAsync(
        { ...payload, tokenType: 'refresh' as const, jti: randomUUID() },
        {
          secret: this.configService.getOrThrow<string>(
            'auth.refreshTokenSecret',
          ),
          expiresIn: refreshTokenTtl,
        },
      ),
    ]);

    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

    await this.prismaService.staffAccount.update({
      where: { id: account.id },
      data: { refreshTokenHash },
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async clearRefreshToken(accountId: bigint): Promise<void> {
    await this.prismaService.staffAccount.update({
      where: { id: accountId },
      data: { refreshTokenHash: null },
    });
  }

  private async validateRefreshToken(
    refreshToken: string,
  ): Promise<AccountWithStaff> {
    let payload: JwtTokenPayload;

    try {
      payload = await this.jwtService.verifyAsync<JwtTokenPayload>(
        refreshToken,
        {
          secret: this.configService.getOrThrow<string>(
            'auth.refreshTokenSecret',
          ),
        },
      );
    } catch {
      throw new UnauthorizedException('Refresh token is invalid');
    }

    if (payload.tokenType !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }

    const account = await this.prismaService.staffAccount.findFirst({
      where: {
        id: BigInt(payload.sub),
        deletedAt: null,
      },
      include: {
        staff: true,
      },
    });

    if (!account?.refreshTokenHash) {
      throw new UnauthorizedException('Refresh token is invalid');
    }

    this.ensureAccountIsActive(account);

    const isValidRefreshToken = await bcrypt.compare(
      refreshToken,
      account.refreshTokenHash,
    );

    if (!isValidRefreshToken) {
      throw new UnauthorizedException('Refresh token is invalid');
    }

    return account;
  }

  private buildPayload(account: AccountWithStaff): JwtTokenPayload {
    return {
      sub: account.id.toString(),
      jti: randomUUID(),
      roles: [account.role],
      staffCode: account.staff.code,
      staffId: account.staff.id.toString(),
      tokenType: 'access',
      username: account.username,
    };
  }

  private ensureAccountIsActive(account: AccountWithStaff): void {
    if (
      account.status !== AccountStatus.ACTIVE ||
      account.staff.status !== StaffStatus.ACTIVE ||
      account.staff.deletedAt !== null
    ) {
      throw new ForbiddenException('Account is inactive');
    }
  }
}
