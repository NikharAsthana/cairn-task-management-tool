// apps/web/src/hooks/use-update-task.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";

type UpdateTaskBody = components["schemas"]["UpdateTaskDto"];
type Task = components["schemas"]["TaskResponseDto"];
type TaskListResponse = components["schemas"]["TaskListResponseDto"];

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
    onSuccess: (updatedTask) => {
      if (!updatedTask) return;

      // Write the PATCH response directly into every cache that holds
      // this task, instead of invalidateQueries — which only marks
      // things stale and fires a SECOND network request to refetch. The
      // response we already have IS the fresh data; asking the server
      // for it again a moment later was the real cause of the lag, not
      // infra speed alone.

      // The task detail page's own single-task cache entry.
      queryClient.setQueryData<Task>(["tasks", taskId], updatedTask);

      // The plain board list (useTasks' key: ["tasks"]).
      queryClient.setQueryData<TaskListResponse>(["tasks"], (old) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((task) =>
            task.id === updatedTask.id ? updatedTask : task,
          ),
        };
      });

      // Any project-scoped list (use-project-tasks.ts's key:
      // ["tasks", { projectId }]) — a predicate catches all of these in
      // one pass rather than needing to know which project this task
      // belongs to.
      queryClient.setQueriesData<TaskListResponse>(
        {
          predicate: (query) =>
            query.queryKey[0] === "tasks" &&
            typeof query.queryKey[1] === "object",
        },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((task) =>
              task.id === updatedTask.id ? updatedTask : task,
            ),
          };
        },
      );
    },
  });
}
