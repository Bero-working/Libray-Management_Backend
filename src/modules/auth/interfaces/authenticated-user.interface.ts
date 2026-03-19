import { AccountRole } from '@prisma/client';

export type AuthenticatedUser = {
  accountId: string;
  roles: AccountRole[];
  staffCode: string;
  staffId: string;
  tokenId: string;
  username: string;
};

export type JwtTokenPayload = {
  jti: string;
  roles: AccountRole[];
  staffCode: string;
  staffId: string;
  sub: string;
  tokenType: 'access' | 'refresh';
  username: string;
};
