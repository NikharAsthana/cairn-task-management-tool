"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Lazy initializer: the function only runs once, on first render of THIS
  // component instance — not once globally. That's what keeps each user's
  // cache isolated from every other user's, on the server.
  const [queryClient] = useState(() => new QueryClient());

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
