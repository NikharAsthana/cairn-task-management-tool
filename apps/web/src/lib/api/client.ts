// apps/web/src/lib/api/client.ts
import createClient from "openapi-fetch";
import type { paths } from "./schema";

// A single shared client instance — created once when this module first
// loads, reused everywhere. `paths` (from our generated schema.d.ts) is
// what makes every call below fully typed: real endpoint autocomplete,
// correct request body shapes, correct response shapes, all derived
// straight from your NestJS controllers.
export const apiClient = createClient<paths>({
  // Relative, not the full Render URL — see next.config.ts's rewrites.
  // The browser only ever talks to this Next.js app; Next.js proxies the
  // actual network hop to Render server-to-server. That keeps every
  // request same-origin from the browser's point of view, which is what
  // makes the session cookie first-party instead of third-party — the
  // fix for the iOS login loop (guest login and Google OAuth both
  // affected, on every browser on iPhone, not just Safari).
  baseUrl: "/api",

  // Our auth is an httpOnly cookie (Phase 4). Requests are same-origin
  // now, so the browser would attach the cookie by default anyway —
  // `credentials: "include"` is kept as an explicit, defensive statement
  // of intent rather than relying on that default.
  credentials: "include",
});