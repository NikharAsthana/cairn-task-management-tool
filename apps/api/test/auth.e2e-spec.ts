// apps/api/test/auth.e2e-spec.ts
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { createTestApp } from './utils/test-app';
import { getSetCookie } from './utils/get-cookie';
import { PrismaService } from '../src/prisma/prisma.service';
import { PublicUserDto } from '../src/auth/dto/public-user.dto';

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await prisma.task.deleteMany({});
    await prisma.project.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.workspace.deleteMany({});
    await app.close();
  });

  it('POST /auth/guest creates a guest user and sets an httpOnly auth cookie', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/guest')
      .expect(201);
    const body = res.body as PublicUserDto;

    expect(body).toMatchObject({ isGuest: true });
    expect(body.id).toEqual(expect.any(String));

    const cookies = getSetCookie(res);
    expect(cookies).toBeDefined();
    expect(cookies[0]).toMatch(/^access_token=/);
    expect(cookies[0]).toMatch(/HttpOnly/);
  });

  it('GET /auth/me is rejected with 401 when no cookie is sent', async () => {
    await request(app.getHttpServer()).get('/auth/me').expect(401);
  });

  it('GET /auth/me returns the same user when the guest-login cookie is sent back', async () => {
    const guestRes = await request(app.getHttpServer())
      .post('/auth/guest')
      .expect(201);
    const guestBody = guestRes.body as PublicUserDto;
    const cookie = getSetCookie(guestRes);

    const meRes = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Cookie', cookie)
      .expect(200);
    const meBody = meRes.body as PublicUserDto;

    expect(meBody.id).toBe(guestBody.id);
    expect(meBody.isGuest).toBe(true);
  });
});
