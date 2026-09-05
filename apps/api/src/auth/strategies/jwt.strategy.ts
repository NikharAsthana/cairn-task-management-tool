// apps/api/src/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

function cookieExtractor(req: Request): string | null {
  const cookies = req.cookies as Record<string, string | undefined> | undefined;
  return cookies?.['access_token'] ?? null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: cookieExtractor,
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  validate(payload: { sub: string; purpose?: string }): { userId: string } {
    // Exchange tokens (see auth.service.ts's issueExchangeToken) carry a
    // `purpose` claim and are meant to be spent exactly once, against
    // POST /auth/exchange — never used directly as a session credential.
    // Rejecting anything with that claim here means even a leaked exchange
    // token (it briefly sits in a URL, so browser history is a real path)
    // can't be replayed as a real session — a stronger guarantee than its
    // 60-second expiry alone would give.
    if (payload.purpose) {
      throw new UnauthorizedException('Invalid token');
    }
    return { userId: payload.sub };
  }
}
