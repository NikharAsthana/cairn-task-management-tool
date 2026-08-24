// apps/web/src/hooks/use-tasks.ts
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";

// Single fetch for the whole board, grouped into columns client-side.
// Known simplification: no per-column pagination — fine at
// assessment scale, would need revisiting for a workspace with hundreds
// of tasks. Flagged, not silently assumed.
export function useTasks() {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/tasks", {
        params: { query: { limit: 100 } },
      });
      if (error) throw error;
      return data;
    },
  });
}