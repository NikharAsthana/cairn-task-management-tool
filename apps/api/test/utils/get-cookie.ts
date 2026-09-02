// apps/api/test/utils/get-cookie.ts
import type { Response } from 'supertest';

// supertest's types declare `res.headers['set-cookie']` as a plain string,
// but Node's HTTP layer always keeps a repeatable header like Set-Cookie as
// an array at runtime, even with just one value — the type definition
// hasn't caught up. This narrows it back to what it actually is, in one
// documented place instead of an inline cast in every test.
export function getSetCookie(res: Response): string[] {
  return res.headers['set-cookie'] as unknown as string[];
}
