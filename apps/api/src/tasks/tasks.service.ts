import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WorkspaceContextService } from '../common/workspace-context/workspace-context.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ListTasksQueryDto } from './dto/list-tasks-query.dto';

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workspaceContext: WorkspaceContextService,
  ) {}

  async create(userId: string, dto: CreateTaskDto) {
    const workspaceId = await this.workspaceContext.getWorkspaceId(userId);

    // Confirm the target project actually belongs to the caller's
    // workspace BEFORE creating anything against it. Without this check,
    // a malicious client could pass any real projectId — including one
    // belonging to a completely different workspace — and silently
    // create a task inside someone else's project.
    const project = await this.prisma.project.findFirst({
      where: { id: dto.projectId, workspaceId },
      select: { id: true },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return this.prisma.task.create({
      data: {
        title: dto.title,
        status: dto.status,
        priority: dto.priority,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        projectId: dto.projectId,
        parentTaskId: dto.parentTaskId,
        reporterId: userId, // server-derived — same pattern as leadId on Project, never trust a client-supplied reporter
      },
    });
  }

  async findAllForUser(userId: string, query: ListTasksQueryDto) {
    const workspaceId = await this.workspaceContext.getWorkspaceId(userId);

    // Filtering through the relation (project: { workspaceId }) means a
    // task can only ever appear in results if its project genuinely
    // belongs to the caller's workspace — the same boundary as Projects,
    // just one relation deeper.
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
      }),
      this.prisma.task.count({ where }), // total count across ALL matching rows, ignoring skip/take — needed so the client knows how many pages exist
    ]);

    return {
      data,
      meta: { page: query.page, limit: query.limit, total },
    };
  }

  async findOneForUser(userId: string, taskId: string) {
    const workspaceId = await this.workspaceContext.getWorkspaceId(userId);
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, project: { workspaceId } },
    });
    if (!task) {
      throw new NotFoundException('Task not found'); // 404, not 403 — same reasoning as Projects
    }
    return task;
  }

  async update(userId: string, taskId: string, dto: UpdateTaskDto) {
    await this.findOneForUser(userId, taskId); // reuses the ownership check rather than duplicating it — throws 404 if not found or not owned

    return this.prisma.task.update({
      where: { id: taskId },
      data: {
        ...dto,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
    });
  }

  async remove(userId: string, taskId: string) {
    await this.findOneForUser(userId, taskId);
    await this.prisma.task.delete({ where: { id: taskId } });
  }
}
