// apps/web/src/hooks/use-delete-project.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectId: string) => {
      const { error } = await apiClient.DELETE("/projects/{id}", {
        params: { path: { id: projectId } },
      });
      if (error) throw error;
    },
    onSuccess: (_data, projectId) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      // Drops the now-deleted project's own cache entry outright rather
      // than just invalidating it — invalidate would trigger a refetch
      // of a project that no longer exists, which would just 404.
      queryClient.removeQueries({ queryKey: ["projects", projectId] });
    },
  });
}