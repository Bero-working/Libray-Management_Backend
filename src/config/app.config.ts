import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  apiPrefix: 'api',
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number.parseInt(process.env.PORT ?? '3000', 10),
}));
