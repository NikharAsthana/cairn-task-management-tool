// apps/web/src/components/shared/delete-project-dialog.tsx
'use client';

import { MotionButton } from '@/components/shared/motion-button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useDeleteProject } from '@/hooks/use-delete-project';
import type { components } from '@/lib/api/schema';

type Project = components['schemas']['ProjectResponseDto'];

interface DeleteProjectDialogProps {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
}

export function DeleteProjectDialog({
  project,
  open,
  onOpenChange,
  onDeleted,
}: DeleteProjectDialogProps) {
  const deleteProject = useDeleteProject();

  const handleDelete = () => {
    deleteProject.mutate(project.id, {
      onSuccess: () => {
        onOpenChange(false);
        onDeleted?.();
      },
    });
  };

  // The backend blocks deletion with a 409 when the project still has
  // tasks (see projects.service.ts's remove()). This assumes your
  // AllExceptionsFilter returns errors as { message: string } — worth
  // confirming; if it's shaped differently this check silently falls
  // through to the generic message instead, which is still safe, just
  // less specific.
  const isBlockedByTasks =
    deleteProject.isError &&
    (deleteProject.error as { message?: string })?.message?.includes(
      'still has',
    );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete project</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &ldquo;{project.name}&rdquo;? This
            can&apos;t be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <MotionButton
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.15 }}
            onClick={handleDelete}
            disabled={deleteProject.isPending}
            className="h-9 rounded-full bg-destructive font-medium text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteProject.isPending ? 'Deleting…' : 'Delete project'}
          </MotionButton>
        </DialogFooter>

        {deleteProject.isError && (
          <p className="text-sm text-destructive" role="alert">
            {isBlockedByTasks
              ? 'This project still has tasks in it. Delete or move them first, then try again.'
              : 'Something went wrong deleting the project. Please try again.'}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
