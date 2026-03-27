import { randomUUID } from 'crypto';

import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { AccountRole } from '@prisma/client';
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

function createAccessToken(role: AccountRole) {
  const jwtService = new JwtService();

  return jwtService.sign(
    {
      sub: '1',
      jti: randomUUID(),
      roles: [role],
      staffCode: 'NV001',
      staffId: '1',
      tokenType: 'access',
      username: `${role.toLowerCase()}-user`,
    },
    {
      secret: process.env.JWT_ACCESS_SECRET,
    },
  );
}

describe('Reports API (e2e)', () => {
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

  it('/api/v1/reports/top-borrowed-titles (GET) rejects requests without bearer token', () => {
    return request(app.getHttpServer())
      .get('/api/v1/reports/top-borrowed-titles')
      .expect(401)
      .expect((response: { body: unknown }) => {
        if (typeof response.body !== 'object' || response.body === null) {
          throw new Error('Expected JSON response body');
        }

        const body = response.body as {
          success?: unknown;
          error?: { code?: unknown };
        };

        expect(body.success).toBe(false);
        expect(body.error?.code).toBe('UNAUTHORIZED');
      });
  });

  it('/api/v1/reports/unreturned-readers (GET) rejects requests without bearer token', () => {
    return request(app.getHttpServer())
      .get('/api/v1/reports/unreturned-readers')
      .expect(401)
      .expect((response: { body: unknown }) => {
        if (typeof response.body !== 'object' || response.body === null) {
          throw new Error('Expected JSON response body');
        }

        const body = response.body as {
          success?: unknown;
          error?: { code?: unknown };
        };

        expect(body.success).toBe(false);
        expect(body.error?.code).toBe('UNAUTHORIZED');
      });
  });

  it('/api/v1/reports/top-borrowed-titles (GET) rejects unsupported role', () => {
    const token = createAccessToken(AccountRole.ADMIN);

    return request(app.getHttpServer())
      .get('/api/v1/reports/top-borrowed-titles')
      .query({ from: '2026-03-01', to: '2026-03-31' })
      .set('Authorization', `Bearer ${token}`)
      .expect(403)
      .expect((response: { body: unknown }) => {
        if (typeof response.body !== 'object' || response.body === null) {
          throw new Error('Expected JSON response body');
        }

        const body = response.body as {
          success?: unknown;
          error?: { code?: unknown };
        };

        expect(body.success).toBe(false);
        expect(body.error?.code).toBe('FORBIDDEN');
      });
  });

  it('/api/v1/reports/top-borrowed-titles (GET) validates query parameters before hitting services', () => {
    const token = createAccessToken(AccountRole.LEADER);

    return request(app.getHttpServer())
      .get('/api/v1/reports/top-borrowed-titles')
      .query({ from: 'invalid-date', to: '2026-03-31' })
      .set('Authorization', `Bearer ${token}`)
      .expect(400)
      .expect((response: { body: unknown }) => {
        if (typeof response.body !== 'object' || response.body === null) {
          throw new Error('Expected JSON response body');
        }

        const body = response.body as {
          success?: unknown;
          error?: { code?: unknown };
        };

        expect(body.success).toBe(false);
        expect(body.error?.code).toBe('BAD_REQUEST');
      });
  });

  it('/api/v1/reports/top-borrowed-titles (GET) rejects page values beyond the supported ceiling', () => {
    const token = createAccessToken(AccountRole.LEADER);

    return request(app.getHttpServer())
      .get('/api/v1/reports/top-borrowed-titles')
      .query({ from: '2026-03-01', to: '2026-03-31', page: 1001 })
      .set('Authorization', `Bearer ${token}`)
      .expect(400)
      .expect((response: { body: unknown }) => {
        if (typeof response.body !== 'object' || response.body === null) {
          throw new Error('Expected JSON response body');
        }

        const body = response.body as {
          success?: unknown;
          error?: { code?: unknown };
        };

        expect(body.success).toBe(false);
        expect(body.error?.code).toBe('BAD_REQUEST');
      });
  });

  it('/api/v1/reports/top-borrowed-titles (GET) rejects date ranges longer than 366 days', () => {
    const token = createAccessToken(AccountRole.LEADER);

    return request(app.getHttpServer())
      .get('/api/v1/reports/top-borrowed-titles')
      .query({ from: '2025-01-01', to: '2026-12-31' })
      .set('Authorization', `Bearer ${token}`)
      .expect(400)
      .expect((response: { body: unknown }) => {
        if (typeof response.body !== 'object' || response.body === null) {
          throw new Error('Expected JSON response body');
        }

        const body = response.body as {
          success?: unknown;
          error?: { code?: unknown };
        };

        expect(body.success).toBe(false);
        expect(body.error?.code).toBe('BAD_REQUEST');
      });
  });

  it('/api/v1/reports/unreturned-readers (GET) rejects page values beyond the supported ceiling', () => {
    const token = createAccessToken(AccountRole.LEADER);

    return request(app.getHttpServer())
      .get('/api/v1/reports/unreturned-readers')
      .query({ page: 1001 })
      .set('Authorization', `Bearer ${token}`)
      .expect(400)
      .expect((response: { body: unknown }) => {
        if (typeof response.body !== 'object' || response.body === null) {
          throw new Error('Expected JSON response body');
        }

        const body = response.body as {
          success?: unknown;
          error?: { code?: unknown };
        };

        expect(body.success).toBe(false);
        expect(body.error?.code).toBe('BAD_REQUEST');
      });
  });
});
