// apps/web/src/components/shared/edit-project-dialog.tsx
'use client';

import { useState } from 'react';
import { MotionButton } from '@/components/shared/motion-button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUpdateProject } from '@/hooks/use-update-project';
import type { components } from '@/lib/api/schema';

type Project = components['schemas']['ProjectResponseDto'];
type Priority = NonNullable <
  components['schemas']['UpdateProjectDto']['priority']
>;

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: 'NO_PRIORITY', label: 'No Priority' },
  { value: 'URGENT', label: 'Urgent' },
  { value: 'HIGH', label: 'High' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LOW', label: 'Low' },
];

function toDateInputValue(dueDate: string | null): string {
  return dueDate ? dueDate.slice(0, 10) : '';
}

interface EditProjectDialogProps {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditProjectDialog({
  project,
  open,
  onOpenChange,
}: EditProjectDialogProps) {
  const [name, setName] = useState(project.name);
  const [priority, setPriority] = useState<Priority>(project.priority);
  const [dueDate, setDueDate] = useState(toDateInputValue(project.dueDate));
  // Tracks the open value from the *previous* render so we can detect the
  // false -> true transition below. This is the React-docs-recommended
  // replacement for "sync state from props in an effect"
  // (https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes).
  const [prevOpen, setPrevOpen] = useState(open);
  const updateProject = useUpdateProject(project.id);

  // Calling setState directly in the render body (not inside useEffect)
  // is explicitly safe here: it's gated behind a condition (`open !==
  // prevOpen`) that becomes false the instant it runs, since we
  // immediately update prevOpen to match. React detects the state change
  // mid-render, throws away this render, and re-renders instantly with
  // the corrected values — before anything reaches the screen. No extra
  // render commit, no effect, no lint violation, and the dialog opens
  // pre-filled with this project's real (not stale) values every time.
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setName(project.name);
      setPriority(project.priority);
      setDueDate(toDateInputValue(project.dueDate));
    }
  }

  const handleSave = () => {
    updateProject.mutate(
      {
        name,
        priority,
        ...(dueDate && { dueDate }),
      },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit project</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-project-name">Name</Label>
            <Input
              id="edit-project-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-project-priority">Priority</Label>
            <Select
              value={priority}
              onValueChange={(v) => setPriority(v as Priority)}
            >
              <SelectTrigger id="edit-project-priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIORITY_OPTIONS.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-project-due-date">Due date (optional)</Label>
            <input
              id="edit-project-due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            />
          </div>
        </div>

        <DialogFooter>
          <MotionButton
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.15 }}
            onClick={handleSave}
            disabled={!name || updateProject.isPending}
            className="h-9 rounded-full bg-primary font-medium text-primary-foreground hover:bg-primary/90"
          >
            {updateProject.isPending ? 'Saving…' : 'Save changes'}
          </MotionButton>
        </DialogFooter>

        {updateProject.isError && (
          <p className="text-sm text-destructive" role="alert">
            Something went wrong saving your changes. Please try again.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
