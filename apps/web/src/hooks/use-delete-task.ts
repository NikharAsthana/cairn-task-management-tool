// apps/web/src/hooks/use-delete-task.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await apiClient.DELETE("/tasks/{id}", {
        params: { path: { id: taskId } },
      });
      if (error) throw error;
    },
    onSuccess: (_data, taskId) => {
      // Tasks are cached under at least two shapes: useTasks' ["tasks"]
      // for the main board, and presumably a project-scoped key in
      // use-project-tasks.ts for Project Detail's grouped view (that
      // hook's exact key isn't confirmed yet). A predicate matching any
      // cached query whose key includes "tasks" anywhere catches both
      // without hand-enumerating every consumer, at the small cost of
      // possibly invalidating one or two unrelated caches too — a
      // reasonable trade for not leaving stale data behind silently.
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.includes("tasks"),
      });
      queryClient.removeQueries({ queryKey: ["tasks", taskId] });
    },
  });
}