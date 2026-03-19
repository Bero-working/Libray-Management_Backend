import { registerAs } from '@nestjs/config';

export const databaseConfig = registerAs('database', () => ({
  directUrl: process.env.DIRECT_URL ?? '',
  skipConnection: process.env.SKIP_DB_CONNECTION === 'true',
  url: process.env.DATABASE_URL ?? '',
}));
