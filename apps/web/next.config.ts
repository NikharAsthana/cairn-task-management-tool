// apps/web/next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Proxies every browser request to /api/* through this Next.js app to
  // the actual NestJS backend. Frontend (vercel.app) and backend
  // (onrender.com) are different domains — without this, every fetch to
  // the backend is a genuine cross-site request, and iOS blocks ALL
  // cross-site cookies by default. That's not a Safari-only quirk: Apple
  // requires every browser on iOS to run on WebKit, so Brave, Chrome, and
  // Firefox on iPhone all inherit the exact same restriction — which is
  // why guest login and Google OAuth both failed on iPhone regardless of
  // which browser was used.
  //
  // With this rewrite, the browser only ever talks to this Next.js app;
  // the actual hop to Render happens server-to-server, invisible to the
  // browser's cookie policy. The `Set-Cookie` response is forwarded back
  // through unchanged, but as far as the browser can tell it came from
  // its own origin — first-party, not third-party — so iOS stops
  // blocking it. This is why `apiClient`'s baseUrl (lib/api/client.ts)
  // changed from the full Render URL to the relative "/api" below:
  // that's what routes its requests through this rewrite instead of
  // going straight to Render.
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;