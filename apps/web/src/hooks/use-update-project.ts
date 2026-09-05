// apps/web/src/hooks/use-update-project.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";

type UpdateProjectBody = components["schemas"]["UpdateProjectDto"];

export function useUpdateProject(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: UpdateProjectBody) => {
      const { data, error } = await apiClient.PATCH("/projects/{id}", {
        params: { path: { id: projectId } },
        body,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Same two-cache pattern as useUpdateTask: the detail page reads
      // ["projects", projectId], the list page reads ["projects"] — a
      // renamed project needs to update in both places. NOTE: confirm
      // use-project.ts actually uses the key ["projects", projectId] —
      // I'm assuming it mirrors useUpdateTask's ["tasks", taskId], but
      // haven't seen that file.
      queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}