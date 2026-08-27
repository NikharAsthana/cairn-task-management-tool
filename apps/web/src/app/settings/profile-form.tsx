// apps/web/src/app/settings/profile-form.tsx
'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// import { Button } from '@/components/ui/button';
import { MotionButton } from "@/components/shared/motion-button";
import { useUpdateProfile } from '@/hooks/use-update-profile';
import type { components } from '@/lib/api/schema';

type User = components['schemas']['PublicUserDto'];

interface ProfileFormProps {
  user: User;
}

export function ProfileForm({ user }: ProfileFormProps) {
  // Initialized directly from `user`, no effect needed. The parent page
  // only ever mounts this component once `user` is guaranteed defined
  // (after its own loading gate), and useState's initializer runs exactly
  // once on mount — so this correctly picks up the real fetched values
  // with no synchronization code at all. This is the pattern React's docs
  // recommend instead of "sync via effect" for this exact situation:
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  const [fullName, setFullName] = useState(user.fullName);
  const [title, setTitle] = useState(user.title ?? '');
  const [username, setUsername] = useState(user.username);

  const updateProfile = useUpdateProfile();

  return (
    <>
      <div className="flex items-center justify-between p-4">
        <Label htmlFor="settings-fullname" className="text-sm text-foreground">
          Full name
        </Label>
        <Input
          id="settings-fullname"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-64"
        />
      </div>

      <div className="flex items-center justify-between p-4">
        <div>
          <Label htmlFor="settings-title" className="text-sm text-foreground">
            Title
          </Label>
          <p className="text-xs text-muted-foreground">
            Your job title or role
          </p>
        </div>
        <Input
          id="settings-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Designer"
          className="w-64"
        />
      </div>

      <div className="flex items-center justify-between p-4">
        <div>
          <Label
            htmlFor="settings-username"
            className="text-sm text-foreground"
          >
            Username
          </Label>
          <p className="text-xs text-muted-foreground">
            One word, like a nickname or first name
          </p>
        </div>
        <Input
          id="settings-username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-64"
        />
      </div>

      <div className="flex items-center justify-end gap-2 p-4">
        {updateProfile.isError && (
          <p className="text-sm text-destructive" role="alert">
            Couldn&apos;t save — that username might already be taken.
          </p>
        )}
        {/* <Button
          onClick={() => updateProfile.mutate({ fullName, title, username })}
          disabled={updateProfile.isPending}
          className="h-9 rounded-full bg-primary font-medium text-primary-foreground hover:bg-primary/90"
        >
          {updateProfile.isPending ? "Saving…" : "Save changes"}
        </Button> */}
        <MotionButton
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.15 }}
          onClick={() => updateProfile.mutate({ fullName, title, username })}
          disabled={updateProfile.isPending}
          className="h-9 rounded-full bg-primary font-medium text-primary-foreground hover:bg-primary/90"
        >
          {updateProfile.isPending ? 'Saving…' : 'Save changes'}
        </MotionButton>
      </div>
    </>
  );
}
