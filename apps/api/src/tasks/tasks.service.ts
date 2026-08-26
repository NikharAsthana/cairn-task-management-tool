// apps/api/src/tasks/tasks.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WorkspaceContextService } from '../common/workspace-context/workspace-context.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ListTasksQueryDto } from './dto/list-tasks-query.dto';
import type { TaskStatus, Priority } from '../generated/prisma/enums';
import type { PublicUserDto } from '../auth/dto/public-user.dto';
import type { LabelDto } from './dto/task-response.dto';

interface TaskUser {
  id: string;
  fullName: string;
  username: string;
  isGuest: boolean;
  avatarUrl: string | null;
  title: string | null;
}

interface TaskWithRelations {
  id: string;
  title: string;
  status: TaskStatus;
  priority: Priority;
  dueDate: Date | null;
  projectId: string;
  parentTaskId: string | null;
  reporterId: string;
  createdAt: Date;
  updatedAt: Date;
  reporter: TaskUser;
  assignees: { user: TaskUser }[];
  labels: { label: { id: string; name: string; color: string } }[];
}

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workspaceContext: WorkspaceContextService,
  ) {}

  async create(userId: string, dto: CreateTaskDto) {
    const workspaceId = await this.workspaceContext.getWorkspaceId(userId);

    const project = await this.prisma.project.findFirst({
      where: { id: dto.projectId, workspaceId },
      select: { id: true },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const task = await this.prisma.task.create({
      data: {
        title: dto.title,
        status: dto.status,
        priority: dto.priority,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        projectId: dto.projectId,
        parentTaskId: dto.parentTaskId,
        reporterId: userId,
      },
      include: {
        assignees: { include: { user: true } },
        labels: { include: { label: true } },
        reporter: true,
      },
    });

    return this.toResponseShape(task);
  }

  async findAllForUser(userId: string, query: ListTasksQueryDto) {
    const workspaceId = await this.workspaceContext.getWorkspaceId(userId);

    const where = {
      project: { workspaceId },
      ...(query.projectId && { projectId: query.projectId }),
      ...(query.status && { status: query.status }),
    };

    const [data, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        include: {
          assignees: { include: { user: true } },
          labels: { include: { label: true } },
          reporter: true,
        },
      }),
      this.prisma.task.count({ where }),
    ]);

    return {
      data: data.map((task) => this.toResponseShape(task)),
      meta: { page: query.page, limit: query.limit, total },
    };
  }

  async findOneForUser(userId: string, taskId: string) {
    const workspaceId = await this.workspaceContext.getWorkspaceId(userId);
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, project: { workspaceId } },
      include: {
        assignees: { include: { user: true } },
        labels: { include: { label: true } },
        reporter: true,
      },
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return this.toResponseShape(task);
  }

  async update(userId: string, taskId: string, dto: UpdateTaskDto) {
    await this.findOneForUser(userId, taskId);

    const task = await this.prisma.task.update({
      where: { id: taskId },
      data: {
        ...dto,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
      include: {
        assignees: { include: { user: true } },
        labels: { include: { label: true } },
        reporter: true,
      },
    });

    return this.toResponseShape(task);
  }

  async remove(userId: string, taskId: string) {
    await this.findOneForUser(userId, taskId);
    await this.prisma.task.delete({ where: { id: taskId } });
  }

  private toResponseShape(task: TaskWithRelations) {
    return {
      id: task.id,
      title: task.title,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      projectId: task.projectId,
      parentTaskId: task.parentTaskId,
      reporterId: task.reporterId,
      reporter: this.toPublicUser(task.reporter),
      assignees: task.assignees.map((a) => this.toPublicUser(a.user)),
      labels: task.labels.map((l): LabelDto => l.label),
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  }

  private toPublicUser(user: TaskUser): PublicUserDto {
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
