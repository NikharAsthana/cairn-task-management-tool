// apps/web/src/components/shared/delete-task-dialog.tsx
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
import { useDeleteTask } from '@/hooks/use-delete-task';
import type { components } from '@/lib/api/schema';

type Task = components['schemas']['TaskResponseDto'];

interface DeleteTaskDialogProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
}

export function DeleteTaskDialog({
  task,
  open,
  onOpenChange,
  onDeleted,
}: DeleteTaskDialogProps) {
  const deleteTask = useDeleteTask();

  const handleDelete = () => {
    deleteTask.mutate(task.id, {
      onSuccess: () => {
        onOpenChange(false);
        onDeleted?.();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete task</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &ldquo;{task.title}&rdquo;? This
            can&apos;t be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <MotionButton
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.15 }}
            onClick={handleDelete}
            disabled={deleteTask.isPending}
            className="h-9 rounded-full bg-destructive font-medium text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteTask.isPending ? 'Deleting…' : 'Delete task'}
          </MotionButton>
        </DialogFooter>

        {deleteTask.isError && (
          <p className="text-sm text-destructive" role="alert">
            Something went wrong deleting the task. Please try again.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}