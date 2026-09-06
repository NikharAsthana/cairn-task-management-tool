// apps/web/src/app/(app)/layout.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/shared/app-sidebar";
import { MobileNav } from "@/components/shared/mobile-nav";
import { useCurrentUser } from "@/hooks/use-current-user";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { data: user, isLoading, isError } = useCurrentUser();

  // Mirrors the login page's redirect logic in reverse: that page sends
  // an already-logged-in visitor away from /login, this one sends a
  // not-logged-in visitor away from every page under (app). This is a
  // UX redirect, not a security boundary — the real protection is
  // JwtAuthGuard on every backend endpoint (tasks, projects, users),
  // which runs regardless of what this layout does.
  useEffect(() => {
    if (!isLoading && (isError || !user)) {
      router.replace("/login");
    }
  }, [isLoading, isError, user, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  // No session — the redirect above is already underway. Render nothing
  // rather than flashing the app shell for a frame.
  if (isError || !user) {
    return null;
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex">
        <AppSidebar />
      </div>

      <div className="flex flex-1 flex-col min-w-0">
        <header className="flex h-14 items-center border-b px-4 lg:hidden">
          <MobileNav />
        </header>

        <main className="flex-1 min-w-0 bg-background">{children}</main>
      </div>
    </div>
  );
}
