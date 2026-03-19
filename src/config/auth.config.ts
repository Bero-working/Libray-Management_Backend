import { registerAs } from '@nestjs/config';

export const authConfig = registerAs('auth', () => ({
  accessTokenSecret: process.env.JWT_ACCESS_SECRET ?? '',
  accessTokenTtl: process.env.JWT_ACCESS_TTL ?? '15m',
  refreshTokenSecret: process.env.JWT_REFRESH_SECRET ?? '',
  refreshTokenTtl: process.env.JWT_REFRESH_TTL ?? '7d',
}));
