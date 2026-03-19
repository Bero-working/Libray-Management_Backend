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

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  it('/api/v1/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1/health')
      .expect(200)
      .expect((response: { body: unknown }) => {
        if (typeof response.body !== 'object' || response.body === null) {
          throw new Error('Expected JSON response body');
        }

        const body = response.body as {
          success?: unknown;
          data?: {
            status?: unknown;
            service?: unknown;
            timestamp?: unknown;
          };
        };

        expect(body.success).toBe(true);
        expect(body.data?.status).toBe('ok');
        expect(body.data?.service).toBe('backend');
        expect(body.data?.timestamp).toEqual(expect.any(String));
      });
  });

  it('/health (GET) returns normalized 404', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(404)
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
        expect(body.error?.code).toBe('NOT_FOUND');
        expect(body.error?.message).toEqual(expect.any(String));
      });
  });

  it('/api/v1/staff (GET) rejects requests without bearer token', () => {
    return request(app.getHttpServer())
      .get('/api/v1/staff')
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

  it('/api/v1/auth/login (POST) validates request payload', () => {
    return request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ username: 'admin' })
      .expect(400)
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
        expect(body.error?.code).toBe('BAD_REQUEST');
      });
  });
});
