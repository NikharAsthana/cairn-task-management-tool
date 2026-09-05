// apps/web/src/app/auth/callback/page.tsx
"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/api/client";

function OAuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Read directly at render time — this is plain, synchronous derived
  // data from the URL, not something that needs an effect to detect.
  const token = searchParams.get("token");
  const [exchangeFailed, setExchangeFailed] = useState(false);
  // Guards against this effect running twice (React StrictMode
  // double-invokes effects in dev). The token is single-use — see
  // verifyExchangeToken in auth.service.ts — so calling /auth/exchange
  // with it a second time would just fail with a confusing error
  // rather than being harmless.
  const exchanged = useRef(false);

  useEffect(() => {
    // No token to act on — nothing for this effect to do. The "missing
    // token" case is rendered below directly from `token`, not from
    // state set here.
    if (!token) return;
    if (exchanged.current) return;
    exchanged.current = true;

    apiClient
      .POST("/auth/exchange", { body: { token } })
      .then(({ error: apiError }) => {
        if (apiError) {
          setExchangeFailed(true);
          return;
        }
        router.replace("/dashboard");
      })
      .catch(() => setExchangeFailed(true));
  }, [token, router]);

  if (!token || exchangeFailed) {
    return (
      <div className="flex min-h-full items-center justify-center bg-background">
        <div className="text-center">
          <p className="mb-4 text-sm text-destructive">
            Something went wrong signing you in with Google. Please try again.
          </p>
          <a
            href="/login"
            className="text-sm text-primary underline underline-offset-2"
          >
            Back to login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-full items-center justify-center bg-background">
      <p className="text-sm text-muted-foreground">Signing you in…</p>
    </div>
  );
}

// useSearchParams needs a Suspense boundary in the App Router — without
// it, Next.js errors during build because this page can't be statically
// prerendered (its content genuinely depends on the URL's query string).
export default function OAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-full items-center justify-center bg-background">
          <p className="text-sm text-muted-foreground">Signing you in…</p>
        </div>
      }
    >
      <OAuthCallbackInner />
    </Suspense>
  );
}