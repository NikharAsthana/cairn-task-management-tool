// apps/web/src/hooks/use-update-task.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";

type UpdateTaskBody = components["schemas"]["UpdateTaskDto"];
type Task = components["schemas"]["TaskResponseDto"];
type TaskListResponse = components["schemas"]["TaskListResponseDto"];

// Matches any cached tasks LIST (board's ["tasks"], or a project-scoped
// ["tasks", { projectId }]) — but not this hook's own single-task cache
// entry (["tasks", taskId], where the second slot is a string, not an
// object). Reused across onMutate/onError/onSuccess so all three stay
// in sync about exactly which caches are "list" caches.
function isTaskListQuery(queryKey: readonly unknown[]): boolean {
  return queryKey[0] === "tasks" && typeof queryKey[1] === "object";
}

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
    onMutate: async (body) => {
      // Apply the optimistic patch FIRST, synchronously, before anything
      // else — same reasoning as useUpdateTaskStatus's board-drag fix:
      // any gap between the user's action and the visible update is
      // exactly the "reverts back for a moment" flicker we're fixing.
      const previousTask = queryClient.getQueryData<Task>(["tasks", taskId]);
      const previousLists = queryClient.getQueriesData<TaskListResponse>({
        predicate: (q) => isTaskListQuery(q.queryKey),
      });

      const patched = previousTask ? { ...previousTask, ...body } : undefined;
      if (patched) {
        queryClient.setQueryData<Task>(["tasks", taskId], patched);
      }
      queryClient.setQueriesData<TaskListResponse>(
        { predicate: (q) => isTaskListQuery(q.queryKey) },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((task) =>
              task.id === taskId ? { ...task, ...body } : task,
            ),
          };
        },
      );

      // Cancelling now, after the visible update above — stops a
      // straggling background refetch from overwriting the optimistic
      // value with stale data, without gating the UI change behind an
      // await first.
      await queryClient.cancelQueries({
        predicate: (q) => q.queryKey[0] === "tasks",
      });

      return { previousTask, previousLists };
    },
    onError: (_err, _vars, context) => {
      // The real PATCH failed — put back exactly what was there before,
      // in every cache we touched. Without this, a failed save would
      // leave the optimistic (wrong) value on screen permanently.
      if (context?.previousTask) {
        queryClient.setQueryData(["tasks", taskId], context.previousTask);
      }
      context?.previousLists?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSuccess: (updatedTask) => {
      if (!updatedTask) return;
      // Reconcile with the server's authoritative response — e.g. the
      // description you sent was already trimmed client-side, but this
      // covers any future field the server might normalize differently
      // than the optimistic guess assumed.
      queryClient.setQueryData<Task>(["tasks", taskId], updatedTask);
      queryClient.setQueriesData<TaskListResponse>(
        { predicate: (q) => isTaskListQuery(q.queryKey) },
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
