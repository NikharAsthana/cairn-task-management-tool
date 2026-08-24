// apps/api/src/projects/projects.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { WorkspaceContextService } from '../common/workspace-context/workspace-context.service';
import type { Priority } from '../generated/prisma/enums';
import type { PublicUserDto } from '../auth/dto/public-user.dto';

interface ProjectWithLead {
  id: string;
  name: string;
  priority: Priority;
  dueDate: Date | null;
  workspaceId: string;
  leadId: string;
  createdAt: Date;
  updatedAt: Date;
  lead: {
    id: string;
    fullName: string;
    username: string;
    isGuest: boolean;
    avatarUrl: string | null;
  };
}

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workspaceContext: WorkspaceContextService,
  ) {}

  async create(userId: string, dto: CreateProjectDto) {
    const workspaceId = await this.workspaceContext.getWorkspaceId(userId);

    const project = await this.prisma.project.create({
      data: {
        name: dto.name,
        priority: dto.priority,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        workspaceId, // server-derived, never trust a client-supplied value here
        leadId: userId, // same — creator becomes lead by default
      },
      include: { lead: true },
    });

    return this.toResponseShape(project);
  }

  async findAllForUser(userId: string) {
    const workspaceId = await this.workspaceContext.getWorkspaceId(userId);
    const projects = await this.prisma.project.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
      include: { lead: true },
    });
    return projects.map((p) => this.toResponseShape(p));
  }

  async findOneForUser(userId: string, projectId: string) {
    const workspaceId = await this.workspaceContext.getWorkspaceId(userId);
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, workspaceId },
      include: { lead: true },
    });

    if (!project) {
      // 404, deliberately not 403. A 403 ("Forbidden") confirms the ID is
      // real but not yours — that's a small information leak about what
      // exists in other workspaces. A flat 404 reveals nothing either way.
      throw new NotFoundException('Project not found');
    }

    return this.toResponseShape(project);
  }

  private toResponseShape(project: ProjectWithLead) {
    return {
      id: project.id,
      name: project.name,
      priority: project.priority,
      dueDate: project.dueDate,
      workspaceId: project.workspaceId,
      leadId: project.leadId,
      lead: this.toPublicUser(project.lead),
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };
  }

  private toPublicUser(user: ProjectWithLead['lead']): PublicUserDto {
    return {
      id: user.id,
      fullName: user.fullName,
      username: user.username,
      isGuest: user.isGuest,
      avatarUrl: user.avatarUrl,
    };
  }
}
