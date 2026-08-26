// apps/api/src/users/users.service.ts
import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import type { PublicUserDto } from '../auth/dto/public-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async updateProfile(
    userId: string,
    dto: UpdateUserDto,
  ): Promise<PublicUserDto> {
    // `username` is @unique in the schema. Rather than attempt the update
    // and catch Prisma's P2002 constraint-violation error — which would
    // need importing Prisma's error class from this project's custom v7
    // generator output, a path I haven't directly confirmed — a proactive
    // check sidesteps that uncertainty entirely and is just as correct.
    if (dto.username) {
      const existing = await this.prisma.user.findUnique({
        where: { username: dto.username },
        select: { id: true },
      });
      if (existing && existing.id !== userId) {
        throw new ConflictException('That username is already taken');
      }
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
    });

    return this.toPublicUser(user);
  }

  private toPublicUser(user: {
    id: string;
    fullName: string;
    username: string;
    isGuest: boolean;
    avatarUrl: string | null;
    title: string | null;
  }): PublicUserDto {
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
