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
  });
}
