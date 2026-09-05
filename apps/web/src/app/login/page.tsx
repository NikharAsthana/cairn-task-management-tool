// apps/web/src/app/login/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/shared/logo";
import { useCurrentUser } from "@/hooks/use-current-user";
import { LoginActions } from "./login-actions";

export default function LoginPage() {
  const router = useRouter();
  const { data: user, isLoading } = useCurrentUser();

  // If a valid session already exists (guest or Google), never let this
  // page render its buttons at all. guestLogin in auth.controller.ts
  // unconditionally mints a brand-new guest and overwrites the cookie on
  // every call — it has no concept of "you're already logged in, do
  // nothing." Rather than teach that endpoint to second-guess itself,
  // the fix belongs here: don't let someone reach the button while
  // already authenticated.
  useEffect(() => {
    if (user) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  // While we don't yet know whether a session exists, show a brief
  // loading state rather than flashing the login card first — same
  // "Loading…" convention used on the task/project detail pages.
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  // A session exists — the redirect above is already underway. Render
  // nothing further rather than showing the login card for a frame.
  if (user) {
    return null;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4">
      <Logo />

      <Card className="flex w-full max-w-sm flex-col gap-6 border-border p-10">
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-xl font-semibold leading-none text-card-foreground">
            Let&apos;s get back on track
          </h1>
          <p className="text-sm text-muted-foreground">
            Continue as a guest, or sign in with Google.
          </p>
        </div>

        <LoginActions />
      </Card>

      {/* Terms/Privacy routes don't exist yet — placeholder links for now,
          revisit before final QA (Phase 15) so they aren't dead ends. */}
      <p className="max-w-sm text-center text-sm text-muted-foreground">
        By clicking continue, you agree to our{" "}
        <Link href="/terms" className="underline underline-offset-2">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="underline underline-offset-2">
          Privacy Policy
        </Link>
        .
      </p>
    </main>
  );
}