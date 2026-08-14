// apps/api/src/auth/auth.controller.ts
import { Controller, Post, Get, UseGuards, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  @Post('guest')
  async guestLogin(@Res({ passthrough: true }) res: Response) {
    const user = await this.authService.createGuestUser();
    const token = this.authService.issueToken(user.id);
    const isProd = this.config.get<string>('NODE_ENV') === 'production';

    res.cookie('access_token', token, {
      httpOnly: true, // invisible to page JavaScript — blocks XSS token theft
      secure: isProd, // cookie only sent over HTTPS in prod; localhost isn't HTTPS
      sameSite: isProd ? 'none' : 'lax', // 'none' is required for cross-domain (Vercel <-> Render)
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
      path: '/',
    });

    // Only ever hand back safe, public fields — never the raw DB row.
    return {
      id: user.id,
      fullName: user.fullName,
      username: user.username,
      isGuest: user.isGuest,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: Request & { user: { userId: string } }) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: req.user.userId },
    });
    return {
      id: user.id,
      fullName: user.fullName,
      username: user.username,
      isGuest: user.isGuest,
    };
  }
}
