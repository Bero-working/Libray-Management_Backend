import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly skipConnection: boolean;

  constructor(private readonly configService: ConfigService) {
    const connectionString = configService.getOrThrow<string>('database.url');

    super({
      adapter: new PrismaPg({ connectionString }),
      log:
        configService.get<string>('app.nodeEnv') === 'development'
          ? ['error', 'warn']
          : ['error'],
    });

    this.skipConnection =
      configService.get<boolean>('database.skipConnection') ?? false;
  }

  async onModuleInit(): Promise<void> {
    if (this.skipConnection) {
      return;
    }

    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    if (this.skipConnection) {
      return;
    }

    await this.$disconnect();
  }
}
