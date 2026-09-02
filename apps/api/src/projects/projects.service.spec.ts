import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { PrismaService } from '../prisma/prisma.service';
import { WorkspaceContextService } from '../common/workspace-context/workspace-context.service';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let prisma: { project: Record<string, jest.Mock> };
  let workspaceContext: { getWorkspaceId: jest.Mock };

  const userId = 'user-1';
  const workspaceId = 'workspace-1';

  // Matches the shape ProjectsService's private toPublicUser() produces —
  // since it's already exactly that shape, the transform is a no-op for
  // this fixture, which is what lets buildRawProject() below double as the
  // *expected* response shape too, not just the mocked input.
  const fakeLead = {
    id: userId,
    fullName: 'Test User',
    username: 'test-user',
    isGuest: true,
    avatarUrl: null,
    title: null,
  };

  // A realistic stand-in for what Prisma returns once
  // `include: { lead: true }` is in play. The old fixtures here were a bare
  // { id, name } object, which crashed once the service started reading
  // project.lead.id — added when ProjectResponseDto grew a full `lead`
  // object back in Phase 8, without these tests being updated to match.
  function buildRawProject(overrides: Record<string, unknown> = {}) {
    return {
      id: 'project-1',
      name: 'Test Project',
      priority: 'NO_PRIORITY',
      dueDate: null,
      workspaceId,
      leadId: userId,
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
      lead: fakeLead,
      ...overrides,
    };
  }

  beforeEach(async () => {
    prisma = {
      project: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
      },
    };
    workspaceContext = {
      getWorkspaceId: jest.fn().mockResolvedValue(workspaceId),
    };

    const module = await Test.createTestingModule({
      providers: [
        ProjectsService,
        { provide: PrismaService, useValue: prisma },
        { provide: WorkspaceContextService, useValue: workspaceContext },
      ],
    }).compile();

    service = module.get(ProjectsService);
  });

  describe('create', () => {
    it('derives workspaceId and leadId server-side, never from the DTO', async () => {
      const created = buildRawProject();
      prisma.project.create.mockResolvedValue(created);

      const result = await service.create(userId, { name: 'Test Project' });

      expect(workspaceContext.getWorkspaceId).toHaveBeenCalledWith(userId);
      expect(prisma.project.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'Test Project',
          workspaceId,
          leadId: userId,
        }),
        include: { lead: true },
      });
      // toResponseShape() builds a new object rather than returning the
      // same reference Prisma resolved with, so this checks the
      // transformed *shape*, not object identity — unlike the old
      // `toBe(created)` assertion, which no longer applies here.
      expect(result).toEqual(created);
    });
  });

  describe('findAllForUser', () => {
    it('scopes the query to the caller workspace', async () => {
      prisma.project.findMany.mockResolvedValue([]);

      await service.findAllForUser(userId);

      expect(prisma.project.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { workspaceId } }),
      );
    });
  });

  describe('findOneForUser', () => {
    it('returns the project when it belongs to the caller workspace', async () => {
      const project = buildRawProject();
      prisma.project.findFirst.mockResolvedValue(project);

      const result = await service.findOneForUser(userId, 'project-1');

      expect(result).toEqual(project);
    });

    it('throws NotFoundException when the project is missing or belongs to another workspace', async () => {
      prisma.project.findFirst.mockResolvedValue(null);

      await expect(
        service.findOneForUser(userId, 'someone-elses-project'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
