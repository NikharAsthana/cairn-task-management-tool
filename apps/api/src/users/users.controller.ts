// apps/api/src/users/users.controller.ts
import { Controller, Patch, Body, UseGuards, Req } from '@nestjs/common';
import type { Request } from 'express';
import { ApiOkResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { PublicUserDto } from '../auth/dto/public-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  @ApiOkResponse({ type: PublicUserDto })
  async updateMe(
    @Req() req: Request & { user: { userId: string } },
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.updateProfile(req.user.userId, dto);
  }
}
