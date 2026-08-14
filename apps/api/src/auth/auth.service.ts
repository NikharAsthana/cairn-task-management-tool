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
}
