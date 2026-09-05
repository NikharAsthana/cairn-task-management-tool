// apps/web/src/hooks/use-current-user.ts
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";

export function useCurrentUser() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/auth/me");
      if (error) throw error;
      return data;
    },
    // A 401 here means "not logged in" — a normal, expected, and final
    // answer, not a transient failure worth retrying. Without this,
    // TanStack Query's default of 3 retries with exponential backoff
    // would apply to every genuinely logged-out visit, meaning anyone
    // landing on /login for the first time would sit through several
    // seconds of silent retries before the page could confidently show
    // the login form.
    retry: false,
  });
}
