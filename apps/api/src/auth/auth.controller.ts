// apps/api/src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import type { GoogleProfile } from './strategies/google.strategy';
import { PublicUserDto } from './dto/public-user.dto';
import { ExchangeTokenDto } from './dto/exchange-token.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  @Post('guest')
  @ApiCreatedResponse({ type: PublicUserDto })
  async guestLogin(@Res({ passthrough: true }) res: Response) {
    const user = await this.authService.createGuestUser();
    this.setAuthCookie(res, user.id);
    return this.publicUser(user);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin() {
    // Passport intercepts the request before this body ever runs.
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(
    @Req() req: Request & { user: GoogleProfile },
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.findOrCreateGoogleUser(req.user);

    // Deliberately NOT setting the session cookie here — see the long
    // comment on issueExchangeToken() in auth.service.ts for why. Short
    // version: this callback is the last hop of a cross-site redirect
    // chain, and Brave/Firefox silently discard cookies set at exactly
    // that point. Instead, hand off a short-lived token and let the
    // frontend spend it via a normal fetch() once it's back on its own
    // domain, which is invisible to that protection.
    const exchangeToken = this.authService.issueExchangeToken(user.id);
    const frontendUrl = this.config.getOrThrow<string>('FRONTEND_URL');
    res.redirect(
      `${frontendUrl}/auth/callback?token=${encodeURIComponent(exchangeToken)}`,
    );
  }

  @Post('exchange')
  @ApiCreatedResponse({
    type: PublicUserDto,
    description: 'Session cookie set',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired exchange token',
  })
  async exchange(
    @Body() dto: ExchangeTokenDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userId = this.authService.verifyExchangeToken(dto.token);
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });
    this.setAuthCookie(res, user.id);
    return this.publicUser(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOkResponse({ type: PublicUserDto })
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
      maxAge: this.config.getOrThrow<number>('JWT_EXPIRES_IN') * 1000,
      path: '/',
    });
  }

  private publicUser(user: {
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
