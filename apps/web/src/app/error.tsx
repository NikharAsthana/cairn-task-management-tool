"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Natural place to wire up real error tracking (e.g. Sentry) later —
    // for now, just make sure it's visible somewhere during development.
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="text-muted-foreground">
        An unexpected error occurred. You can try again, or come back later.
      </p>
      <button
        onClick={() => reset()}
        className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent"
      >
        Try again
      </button>
    </div>
  );
}
