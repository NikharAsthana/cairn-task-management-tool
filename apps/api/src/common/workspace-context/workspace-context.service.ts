import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WorkspaceContextService {
  constructor(private readonly prisma: PrismaService) {}

  async getWorkspaceId(userId: string): Promise<string> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { workspaceId: true },
    });
    return user.workspaceId;
  }
}
