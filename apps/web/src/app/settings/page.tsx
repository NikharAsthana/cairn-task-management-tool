// apps/web/src/app/settings/page.tsx
"use client";

import { Pencil } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/use-current-user";
import { ProfileForm } from "./profile-form";

export default function SettingsPage() {
  const { data: user, isLoading } = useCurrentUser();

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading profile…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl p-8">
      <h1 className="mb-6 text-2xl font-semibold text-card-foreground">Profile</h1>

      <div className="flex flex-col divide-y divide-border rounded-md border border-border">
        <div className="flex items-center justify-between p-4">
          <span className="text-sm text-foreground">Profile picture</span>
          <Avatar className="h-10 w-10 rounded-full">
            {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.fullName} />}
            <AvatarFallback className="rounded-full bg-muted text-sm">
              {user.fullName[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="flex items-center justify-between p-4">
          <span className="text-sm text-foreground">Email</span>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{user.isGuest ? "No email (guest account)" : "—"}</span>
            <Pencil className="h-3.5 w-3.5" />
          </div>
        </div>

        {/* key={user.id}: defensive, not strictly required by this app's
            current usage (there's no path where this component stays
            mounted across a different user's data arriving) — but it's
            the correct, cheap safeguard React's docs recommend for
            exactly this pattern, so a future change can't silently
            reintroduce stale form state. */}
        <ProfileForm user={user} key={user.id} />
      </div>

      <h2 className="mb-2 mt-8 text-sm font-medium text-foreground">Workspace access</h2>
      <div className="flex items-center justify-between rounded-md border border-border p-4">
        <p className="text-sm text-muted-foreground">Remove yourself from the workspace</p>
        <Button
          variant="outline"
          disabled
          className="h-9 rounded-full border-destructive text-destructive hover:bg-destructive/10"
        >
          Leave Workspace
        </Button>
      </div>
    </div>
  );
}
