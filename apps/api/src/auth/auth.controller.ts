// apps/api/src/auth/auth.controller.ts
import { Controller, Post, Get, UseGuards, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import type { GoogleProfile } from './strategies/google.strategy';

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
    this.setAuthCookie(res, user.id);
    return this.publicUser(user);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin() {
    // Passport intercepts the request before this body ever runs — it
    // redirects the browser straight to Google's sign-in page. This method
    // exists only so Nest has a route to attach the guard to.
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(
    @Req() req: Request & { user: GoogleProfile },
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.findOrCreateGoogleUser(req.user);
    this.setAuthCookie(res, user.id);
    res.redirect(this.config.getOrThrow<string>('FRONTEND_URL'));
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: Request & { user: { userId: string } }) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: req.user.userId },
    });
    return this.publicUser(user);
  }

  private setAuthCookie(res: Response, userId: string): void {
    const token = this.authService.issueToken(userId);
    const isProd = this.config.get<string>('NODE_ENV') === 'production';

    res.cookie('access_token', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: this.config.getOrThrow<number>('JWT_EXPIRES_IN') * 1000, // seconds -> ms
      path: '/',
    });
  }

  private publicUser(user: {
    id: string;
    fullName: string;
    username: string;
    isGuest: boolean;
  }) {
    return {
      id: user.id,
      fullName: user.fullName,
      username: user.username,
      isGuest: user.isGuest,
    };
  }
}
