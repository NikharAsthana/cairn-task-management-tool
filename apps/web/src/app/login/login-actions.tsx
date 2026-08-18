// apps/web/src/app/login/login-actions.tsx
"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { GoogleIcon } from "@/components/shared/google-icon";
import { apiClient } from "@/lib/api/client";

export function LoginActions() {
  const router = useRouter();

  const guestLogin = useMutation({
    mutationFn: async () => {
      const { data, error } = await apiClient.POST("/auth/guest", {});
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      router.push("/dashboard");
    },
  });

  return (
    <div className="flex flex-col gap-3">
      <Button
        onClick={() => guestLogin.mutate()}
        disabled={guestLogin.isPending}
        className="h-9 rounded-full bg-primary font-medium text-primary-foreground hover:bg-primary/90"
      >
        {guestLogin.isPending ? "Signing in…" : "Continue as Guest"}
      </Button>

      <Button
        asChild
        variant="outline"
        className="h-9 rounded-full border-input font-medium"
      >
        <a href={`${process.env.NEXT_PUBLIC_API_URL}/auth/google`}>
          <GoogleIcon className="mr-2 h-4 w-4" />
          Login with Google
        </a>
      </Button>

      {guestLogin.isError && (
        <p className="text-sm text-destructive" role="alert">
          Something went wrong signing you in. Please try again.
        </p>
      )}
    </div>
  );
}