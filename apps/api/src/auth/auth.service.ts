// apps/api/src/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
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

    // Nested create: Prisma creates the Workspace and the User that points at
    // it in one atomic write. Adjust the relation field name below (`workspace`)
    // if yours is spelled differently in schema.prisma.
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

  // Guest usernames (adjective-animal-number) are virtually collision-free by
  // construction. Real names aren't — two different Google accounts can both
  // be "John Smith" — so this checks the database and appends a number until
  // it finds one that's free, instead of assuming a slugified name is safe.
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
