// apps/api/src/projects/projects.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
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
    title: string | null;
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
        workspaceId,
        leadId: userId,
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
      throw new NotFoundException('Project not found');
    }

    return this.toResponseShape(project);
  }

  async update(userId: string, projectId: string, dto: UpdateProjectDto) {
    const workspaceId = await this.workspaceContext.getWorkspaceId(userId);

    // findFirst scoped to workspaceId doubles as "does this exist" AND
    // "does the caller actually own it" in one query — same pattern as
    // findOneForUser. A project in a different workspace 404s instead of
    // leaking a 403; you don't confirm the existence of things a caller
    // can't access.
    const existing = await this.prisma.project.findFirst({
      where: { id: projectId, workspaceId },
    });
    if (!existing) {
      throw new NotFoundException('Project not found');
    }

    const project = await this.prisma.project.update({
      where: { id: projectId },
      data: {
        name: dto.name,
        priority: dto.priority,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
      include: { lead: true },
    });

    return this.toResponseShape(project);
  }

  async remove(userId: string, projectId: string) {
    const workspaceId = await this.workspaceContext.getWorkspaceId(userId);

    const existing = await this.prisma.project.findFirst({
      where: { id: projectId, workspaceId },
      include: { _count: { select: { tasks: true } } },
    });
    if (!existing) {
      throw new NotFoundException('Project not found');
    }

    // Deliberately blocking rather than cascading: silently deleting
    // every task in a project alongside it is a much bigger, harder-to-
    // undo action than a "delete project" button implies, and there's
    // currently no "move task to another project" flow to escape it with
    // (UpdateTaskDto explicitly omits projectId). If this should cascade
    // instead, this is the one method to change.
    if (existing._count.tasks > 0) {
      throw new ConflictException(
        `Cannot delete project: it still has ${existing._count.tasks} task(s). Delete or reassign them first.`,
      );
    }

    await this.prisma.project.delete({ where: { id: projectId } });
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
      title: user.title,
    };
  }
}
