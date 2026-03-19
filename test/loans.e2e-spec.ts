import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL =
  'postgresql://postgres:postgres@localhost:5432/backend?schema=public';
process.env.DIRECT_URL =
  'postgresql://postgres:postgres@localhost:5432/backend?schema=public';
process.env.SKIP_DB_CONNECTION = 'true';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-test-access-secret';
process.env.JWT_ACCESS_TTL = '15m';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-test-refresh-secret';
process.env.JWT_REFRESH_TTL = '7d';

import { AppModule } from './../src/app.module';
import { configureApp } from './../src/setup-app';

describe('Loans (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('/api/v1/loans (GET) rejects requests without bearer token', () => {
    return request(app.getHttpServer())
      .get('/api/v1/loans')
      .expect(401)
      .expect((response: { body: unknown }) => {
        if (typeof response.body !== 'object' || response.body === null) {
          throw new Error('Expected JSON response body');
        }

        const body = response.body as {
          success?: unknown;
          error?: {
            code?: unknown;
            message?: unknown;
          };
        };

        expect(body.success).toBe(false);
        expect(body.error?.code).toBe('UNAUTHORIZED');
      });
  });
});
