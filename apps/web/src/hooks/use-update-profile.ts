// apps/web/src/hooks/use-update-profile.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";

type UpdateUserBody = components["schemas"]["UpdateUserDto"];

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: UpdateUserBody) => {
      const { data, error } = await apiClient.PATCH("/users/me", { body });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
}