// apps/web/src/hooks/use-project-tasks.ts
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";

export function useProjectTasks(projectId: string) {
  return useQuery({
    queryKey: ["tasks", { projectId }],
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/tasks", {
        params: { query: { projectId, limit: 100 } },
      });
      if (error) throw error;
      return data;
    },
    enabled: !!projectId,
  });
}
