import createClient from "openapi-fetch";
import type { paths } from "./schema";

// A single shared client instance — created once when this module first
// loads, reused everywhere. `paths` (from our generated schema.d.ts) is
// what makes every call below fully typed: real endpoint autocomplete,
// correct request body shapes, correct response shapes, all derived
// straight from your NestJS controllers.
export const apiClient = createClient<paths>({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,

  // Our auth is an httpOnly cookie (Phase 4), and frontend/backend live
  // on different domains in production. `credentials: "include"` tells
  // the browser to send that cookie along with every request regardless —
  // without this, every authenticated call would silently fail with 401
  // even though we're logged in, because the cookie just wouldn't be sent.
  // The matching backend half of this (CORS `credentials: true` + an exact
  // origin allow-list) is already done in Phase 4.
  credentials: "include",
});

