// apps/web/src/hooks/use-task.ts
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";

export function useTask(taskId: string) {
  return useQuery({
    queryKey: ["tasks", taskId],
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/tasks/{id}", {
        params: { path: { id: taskId } },
      });
      if (error) throw error;
      return data;
    },
    enabled: !!taskId,
  });
}
