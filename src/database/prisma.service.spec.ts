import { ConfigService } from '@nestjs/config';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  const createConfigService = (skipConnection: boolean) =>
    ({
      getOrThrow: jest.fn((key: string) => {
        if (key === 'database.url') {
          return 'postgresql://postgres:postgres@localhost:5432/backend?schema=public';
        }

        throw new Error(`Unexpected config lookup: ${key}`);
      }),
      get: jest.fn((key: string) => {
        if (key === 'app.nodeEnv') {
          return 'test';
        }

        if (key === 'database.skipConnection') {
          return skipConnection;
        }

        return undefined;
      }),
    }) as unknown as ConfigService;

  it('connects on module init when connections are enabled', async () => {
    const service = new PrismaService(createConfigService(false));
    const connectSpy = jest.spyOn(service, '$connect').mockResolvedValue();

    await service.onModuleInit();

    expect(connectSpy).toHaveBeenCalledTimes(1);
  });

  it('skips connecting on module init when configured to do so', async () => {
    const service = new PrismaService(createConfigService(true));
    const connectSpy = jest.spyOn(service, '$connect').mockResolvedValue();

    await service.onModuleInit();

    expect(connectSpy).not.toHaveBeenCalled();
  });

  it('disconnects on module destroy when connections are enabled', async () => {
    const service = new PrismaService(createConfigService(false));
    const disconnectSpy = jest
      .spyOn(service, '$disconnect')
      .mockResolvedValue();

    await service.onModuleDestroy();

    expect(disconnectSpy).toHaveBeenCalledTimes(1);
  });
});
