// apps/api/test/app.e2e-spec.ts
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { createTestApp } from './utils/test-app';

interface HealthResponse {
  status: string;
  timestamp: string;
}

describe('App (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/health (GET) confirms the app booted and is responding', async () => {
    const res = await request(app.getHttpServer()).get('/health').expect(200);
    const body = res.body as HealthResponse;
    expect(body.status).toBe('ok');
  });
});
