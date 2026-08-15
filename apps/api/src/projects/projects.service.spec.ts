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
      const created = { id: 'project-1', name: 'Test Project' };
      prisma.project.create.mockResolvedValue(created);

      const result = await service.create(userId, { name: 'Test Project' });

      expect(workspaceContext.getWorkspaceId).toHaveBeenCalledWith(userId);
      expect(prisma.project.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'Test Project',
          workspaceId,
          leadId: userId,
        }),
      });
      expect(result).toBe(created);
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
      const project = { id: 'project-1', workspaceId };
      prisma.project.findFirst.mockResolvedValue(project);

      const result = await service.findOneForUser(userId, 'project-1');

      expect(result).toBe(project);
    });

    it('throws NotFoundException when the project is missing or belongs to another workspace', async () => {
      prisma.project.findFirst.mockResolvedValue(null);

      await expect(
        service.findOneForUser(userId, 'someone-elses-project'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
