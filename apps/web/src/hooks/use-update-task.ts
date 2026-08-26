// apps/web/src/hooks/use-update-task.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";

type UpdateTaskBody = components["schemas"]["UpdateTaskDto"];

export function useUpdateTask(taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: UpdateTaskBody) => {
      const { data, error } = await apiClient.PATCH("/tasks/{id}", {
        params: { path: { id: taskId } },
        body,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate both this task's detail cache AND the board's list
      // cache — a status change here needs to move the card to a
      // different column back on /dashboard, not just update this page.
      queryClient.invalidateQueries({ queryKey: ["tasks", taskId] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}