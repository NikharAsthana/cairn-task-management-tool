// apps/web/src/providers/query-provider.tsx
"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Lazy initializer: the function only runs once, on first render of THIS
  // component instance — not once globally. That's what keeps each user's
  // cache isolated from every other user's, on the server.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Previously unset, which defaults to 0 — every remount (e.g.
            // clicking Projects -> a project -> back to Projects) and every
            // window refocus counted data as instantly stale and re-fetched
            // over the network, even for data fetched seconds ago. That's
            // pure waste on its own, and it's especially costly here
            // because Render (API) and Neon (DB) sit in different regions
            // — every one of those avoidable round-trips carries real,
            // measured multi-second latency on top. 30s means moving
            // around the app within a normal browsing session reuses the
            // cache instead of re-fetching; data still refreshes itself
            // automatically once it's actually 30s old.
            staleTime: 30_000,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Guarded manually — I checked, and this package doesn't strip
          itself out of production automatically. Without this check,
          the devtools panel (and its code) would ship to your live demo. */}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
