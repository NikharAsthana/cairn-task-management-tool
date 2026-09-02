// apps/api/test/tasks.e2e-spec.ts
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { createTestApp } from './utils/test-app';
import { getSetCookie } from './utils/get-cookie';
import { PrismaService } from '../src/prisma/prisma.service';
import { PublicUserDto } from '../src/auth/dto/public-user.dto';
import { ProjectResponseDto } from '../src/projects/dto/project-response.dto';
import { TaskResponseDto } from '../src/tasks/dto/task-response.dto';

describe('Tasks (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let cookie: string[];
  let userId: string;
  let projectId: string;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);

    const guestRes = await request(app.getHttpServer())
      .post('/auth/guest')
      .expect(201);
    const guestBody = guestRes.body as PublicUserDto;
    cookie = getSetCookie(guestRes);
    userId = guestBody.id;

    const projectRes = await request(app.getHttpServer())
      .post('/projects')
      .set('Cookie', cookie)
      .send({ name: 'e2e Test Project' })
      .expect(201);
    const projectBody = projectRes.body as ProjectResponseDto;
    projectId = projectBody.id;
  });

  afterAll(async () => {
    await prisma.task.deleteMany({});
    await prisma.project.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.workspace.deleteMany({});
    await app.close();
  });

  it('POST /tasks is rejected with 401 when no cookie is sent', async () => {
    await request(app.getHttpServer())
      .post('/tasks')
      .send({ title: 'Should be rejected', projectId })
      .expect(401);
  });

  it('POST /tasks with a missing required field is rejected with 400', async () => {
    await request(app.getHttpServer())
      .post('/tasks')
      .set('Cookie', cookie)
      .send({ projectId })
      .expect(400);
  });

  it('POST /tasks rejects an unknown field in the body (forbidNonWhitelisted)', async () => {
    await request(app.getHttpServer())
      .post('/tasks')
      .set('Cookie', cookie)
      .send({ title: 'x', projectId, reporterId: 'someone-elses-id' })
      .expect(400);
  });

  it('POST /tasks creates a task, deriving reporterId from the authenticated user', async () => {
    const res = await request(app.getHttpServer())
      .post('/tasks')
      .set('Cookie', cookie)
      .send({ title: 'Write the e2e tests', projectId })
      .expect(201);
    const body = res.body as TaskResponseDto;

    expect(body.title).toBe('Write the e2e tests');
    expect(body.projectId).toBe(projectId);

    const stored = await prisma.task.findUniqueOrThrow({
      where: { id: body.id },
    });
    expect(stored.reporterId).toBe(userId);
  });
});
