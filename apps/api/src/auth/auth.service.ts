// apps/api/src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

const ADJECTIVES = [
  'Swift',
  'Quiet',
  'Bright',
  'Bold',
  'Calm',
  'Sharp',
  'Clever',
  'Steady',
];
const ANIMALS = [
  'Falcon',
  'Otter',
  'Lynx',
  'Heron',
  'Fox',
  'Wren',
  'Badger',
  'Ibex',
];

function randomGuestName(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  const suffix = Math.floor(Math.random() * 900) + 100; // 3-digit tail, cuts collision odds
  return `${adj} ${animal} ${suffix}`;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async createGuestUser() {
    const displayName = randomGuestName();

    return this.prisma.user.create({
      data: {
        fullName: displayName,
        username: displayName.toLowerCase().replace(/\s+/g, '-'),
        isGuest: true,
        workspace: {
          create: { name: `${displayName}'s Workspace` },
        },
      },
    });
  }

  issueToken(userId: string): string {
    // "sub" (subject) is a standard JWT claim — it just means "who this token
    // is about." We keep the payload deliberately thin: anything else about
    // the user gets looked up fresh from the DB via /auth/me, never trusted
    // blindly from an old token.
    return this.jwt.sign({ sub: userId });
  }

  // Issues a short-lived (60s), single-purpose token used ONLY to carry
  // "this user just authenticated with Google" across one redirect hop, from
  // the OAuth callback (on our API's domain) to a page on our frontend's own
  // domain — never set as a cookie itself. This exists because Brave/Firefox's
  // bounce-tracking protections silently discard cookies set mid-redirect-chain
  // (site A -> our API -> Google -> our API again -> site A), even when
  // legitimate. Spending this token via POST /auth/exchange happens from a
  // plain fetch() on a page the user is genuinely on — the same mechanism
  // guest login already uses successfully — which isn't part of any redirect
  // chain and so isn't caught by that protection.
  //
  // The `purpose` claim is what makes this safe to put in a URL at all: even
  // if it leaked (e.g. sitting briefly in browser history), JwtStrategy
  // explicitly refuses any token carrying that claim, so it can never be
  // replayed as a real session credential — only spent once, here.
  issueExchangeToken(userId: string): string {
    return this.jwt.sign(
      { sub: userId, purpose: 'oauth_exchange' },
      { expiresIn: 60 },
    );
  }

  verifyExchangeToken(token: string): string {
    let payload: { sub: string; purpose?: string };
    try {
      payload = this.jwt.verify<{ sub: string; purpose?: string }>(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
    if (payload.purpose !== 'oauth_exchange') {
      throw new UnauthorizedException('Invalid token');
    }
    return payload.sub;
  }

  async findOrCreateGoogleUser(profile: {
    googleId: string;
    email?: string;
    fullName: string;
    avatarUrl?: string;
  }) {
    const existing = await this.prisma.user.findUnique({
      where: { googleId: profile.googleId },
    });
    if (existing) return existing;

    const username = await this.generateUniqueUsername(profile.fullName);

    return this.prisma.user.create({
      data: {
        googleId: profile.googleId,
        email: profile.email,
        fullName: profile.fullName,
        username,
        avatarUrl: profile.avatarUrl,
        isGuest: false,
        workspace: {
          create: { name: `${profile.fullName}'s Workspace` },
        },
      },
    });
  }

  private async generateUniqueUsername(fullName: string): Promise<string> {
    const base = fullName.toLowerCase().trim().replace(/\s+/g, '-');
    let candidate = base;
    let attempt = 0;

    while (
      await this.prisma.user.findUnique({ where: { username: candidate } })
    ) {
      attempt += 1;
      candidate = `${base}-${attempt}`;
    }

    return candidate;
  }
}
