import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { PrismaService } from '../prisma/prisma.service';
import { WorkspaceContextService } from '../common/workspace-context/workspace-context.service';
import { TaskStatus } from '../generated/prisma/enums';

describe('TasksService', () => {
  let service: TasksService;
  let prisma: {
    project: Record<string, jest.Mock>;
    task: Record<string, jest.Mock>;
  };
  let workspaceContext: { getWorkspaceId: jest.Mock };

  const userId = 'user-1';
  const workspaceId = 'workspace-1';
  const projectId = 'project-1';

  // Same reasoning as projects.service.spec.ts's fakeLead — already
  // shaped exactly like TasksService's private toPublicUser() output.
  const fakeReporter = {
    id: userId,
    fullName: 'Test User',
    username: 'test-user',
    isGuest: true,
    avatarUrl: null,
    title: null,
  };

  // A realistic stand-in for what Prisma returns once the service's
  // `include: { assignees: {...}, labels: {...}, reporter: true }` is in
  // play. The old fixtures here were bare { id, title } objects, which
  // crashed once the service started reading task.reporter.id — added
  // when TaskResponseDto grew reporter/assignees/labels back in Phase 8,
  // without these tests being updated to match.
  function buildRawTask(overrides: Record<string, unknown> = {}) {
    return {
      id: 'task-1',
      title: 'Do the thing',
      status: TaskStatus.TODO,
      priority: 'NO_PRIORITY',
      dueDate: null,
      projectId,
      parentTaskId: null,
      reporterId: userId,
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
      reporter: fakeReporter,
      assignees: [],
      labels: [],
      ...overrides,
    };
  }

  beforeEach(async () => {
    prisma = {
      project: { findFirst: jest.fn() },
      task: {
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    workspaceContext = {
      getWorkspaceId: jest.fn().mockResolvedValue(workspaceId),
    };

    const module = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: PrismaService, useValue: prisma },
        { provide: WorkspaceContextService, useValue: workspaceContext },
      ],
    }).compile();

    service = module.get(TasksService);
  });

  describe('create', () => {
    it('creates the task, deriving reporterId server-side, when the project is owned', async () => {
      prisma.project.findFirst.mockResolvedValue({ id: projectId });
      const created = buildRawTask({ title: 'Do the thing' });
      prisma.task.create.mockResolvedValue(created);

      const result = await service.create(userId, {
        title: 'Do the thing',
        projectId,
      });

      // the ownership check must run BEFORE the write
      expect(prisma.project.findFirst).toHaveBeenCalledWith({
        where: { id: projectId, workspaceId },
        select: { id: true },
      });
      expect(prisma.task.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: 'Do the thing',
          projectId,
          reporterId: userId,
        }),
        include: {
          assignees: { include: { user: true } },
          labels: { include: { label: true } },
          reporter: true,
        },
      });
      expect(result).toEqual(created);
    });

    it('throws NotFoundException and never writes, when the project belongs to another workspace', async () => {
      prisma.project.findFirst.mockResolvedValue(null);

      await expect(
        service.create(userId, { title: 'Sneaky task', projectId }),
      ).rejects.toThrow(NotFoundException);

      expect(prisma.task.create).not.toHaveBeenCalled();
    });
  });

  describe('findAllForUser', () => {
    it('returns paginated data plus a total count', async () => {
      const tasks = [
        buildRawTask({ id: 'task-1' }),
        buildRawTask({ id: 'task-2' }),
      ];
      prisma.task.findMany.mockResolvedValue(tasks);
      prisma.task.count.mockResolvedValue(2);

      const result = await service.findAllForUser(userId, {
        page: 1,
        limit: 20,
      });

      expect(result).toEqual({
        data: tasks,
        meta: { page: 1, limit: 20, total: 2 },
      });
    });

    it('applies status/projectId filters and correct skip/take math for page 2', async () => {
      prisma.task.findMany.mockResolvedValue([]);
      prisma.task.count.mockResolvedValue(0);

      await service.findAllForUser(userId, {
        page: 2,
        limit: 10,
        status: TaskStatus.DONE,
        projectId,
      });

      expect(prisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            project: { workspaceId },
            projectId,
            status: 'DONE',
          },
          skip: 10, // (page 2 - 1) * limit 10
          take: 10,
        }),
      );
    });
  });

  describe('findOneForUser', () => {
    it('throws NotFoundException when the task is missing or not owned', async () => {
      prisma.task.findFirst.mockResolvedValue(null);

      await expect(
        service.findOneForUser(userId, 'not-my-task'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('checks ownership before deleting', async () => {
      prisma.task.findFirst.mockResolvedValue(buildRawTask({ id: 'task-1' }));
      prisma.task.delete.mockResolvedValue(undefined);

      await service.remove(userId, 'task-1');

      expect(prisma.task.delete).toHaveBeenCalledWith({
        where: { id: 'task-1' },
      });
    });

    it('never deletes when ownership check fails', async () => {
      prisma.task.findFirst.mockResolvedValue(null);

      await expect(service.remove(userId, 'not-my-task')).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.task.delete).not.toHaveBeenCalled();
    });
  });
});
