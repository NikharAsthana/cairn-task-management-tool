// apps/web/src/hooks/use-project.ts
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";

export function useProject(projectId: string) {
  return useQuery({
    queryKey: ["projects", projectId],
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/projects/{id}", {
        params: { path: { id: projectId } },
      });
      if (error) throw error;
      return data;
    },
    enabled: !!projectId,
  });
}