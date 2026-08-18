// apps/web/src/app/login/page.tsx
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/shared/logo";
import { LoginActions } from "./login-actions";

export default function LoginPage() {
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