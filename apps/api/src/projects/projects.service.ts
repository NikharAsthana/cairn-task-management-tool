import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateProjectDto) {
    const workspaceId = await this.getWorkspaceId(userId);

    return this.prisma.project.create({
      data: {
        name: dto.name,
        priority: dto.priority,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        workspaceId, // server-derived, never trust a client-supplied value here
        leadId: userId, // same — creator becomes lead by default
      },
    });
  }

  async findAllForUser(userId: string) {
    const workspaceId = await this.getWorkspaceId(userId);
    return this.prisma.project.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneForUser(userId: string, projectId: string) {
    const workspaceId = await this.getWorkspaceId(userId);
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, workspaceId },
    });

    if (!project) {
      // 404, deliberately not 403. A 403 ("Forbidden") confirms the ID is
      // real but not yours — that's a small information leak about what
      // exists in other workspaces. A flat 404 reveals nothing either way.
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  private async getWorkspaceId(userId: string): Promise<string> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { workspaceId: true },
    });
    return user.workspaceId;
  }
}
