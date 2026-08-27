// apps/web/src/hooks/use-update-task-status.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";

type TaskStatus = components["schemas"]["TaskResponseDto"]["status"];
type Task = components["schemas"]["TaskResponseDto"];
type TaskListResponse = components["schemas"]["TaskListResponseDto"];

interface UpdateTaskStatusVars {
  taskId: string;
  status: TaskStatus;
}

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, status }: UpdateTaskStatusVars) => {
      const { data, error } = await apiClient.PATCH("/tasks/{id}", {
        params: { path: { id: taskId } },
        body: { status },
      });
      if (error) throw error;
      return data;
    },
    onMutate: async ({ taskId, status }) => {
      const previous = queryClient.getQueryData<TaskListResponse>(["tasks"]);

      // Apply the optimistic update FIRST, synchronously, before touching
      // anything else. dnd-kit resets its own drag transform the instant
      // a card is dropped, independent of React Query entirely — if
      // there's any gap between that reset and this update landing, the
      // card visibly snaps back to its old slot for a frame before
      // jumping to the new one. Doing this first, with nothing awaited
      // above it, closes that gap.
      queryClient.setQueryData<TaskListResponse>(["tasks"], (old) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((task: Task) =>
            task.id === taskId ? { ...task, status } : task,
          ),
        };
      });

      // Cancelling in-flight queries now, after the update above rather
      // than before it — still prevents a stale background refetch from
      // later overwriting this change, just without gating the visible
      // part of the update behind an await first.
      await queryClient.cancelQueries({ queryKey: ["tasks"] });

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["tasks"], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}