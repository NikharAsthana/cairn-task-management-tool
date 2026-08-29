// apps/web/src/components/shared/add-project-dialog.tsx
'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { MotionButton } from "@/components/shared/motion-button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { apiClient } from '@/lib/api/client';
import type { components } from '@/lib/api/schema';

type Priority = NonNullable<
  components['schemas']['CreateProjectDto']['priority']
>;

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: 'NO_PRIORITY', label: 'No Priority' },
  { value: 'URGENT', label: 'Urgent' },
  { value: 'HIGH', label: 'High' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LOW', label: 'Low' },
];

export function AddProjectDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [priority, setPriority] = useState<Priority>('NO_PRIORITY');
  const [dueDate, setDueDate] = useState('');
  const queryClient = useQueryClient();

  const createProject = useMutation({
    mutationFn: async () => {
      const { data, error } = await apiClient.POST('/projects', {
        body: {
          name,
          priority,
          ...(dueDate && { dueDate }),
        },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setOpen(false);
      setName('');
      setPriority('NO_PRIORITY');
      setDueDate('');
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <MotionButton
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.15 }}
          className="h-9 rounded-full bg-primary font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="mr-1 h-4 w-4" />
          Add Project
        </MotionButton>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>New project</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="project-name">Name</Label>
            <Input
              id="project-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Website Redesign"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="project-priority">Priority</Label>
            <Select
              value={priority}
              onValueChange={(v) => setPriority(v as Priority)}
            >
              <SelectTrigger id="project-priority">
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
            <Label htmlFor="project-due-date">Due date (optional)</Label>
            <input
              id="project-due-date"
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
            onClick={() => createProject.mutate()}
            disabled={!name || createProject.isPending}
            className="h-9 rounded-full bg-primary font-medium text-primary-foreground hover:bg-primary/90"
          >
            {createProject.isPending ? 'Creating…' : 'Create project'}
          </MotionButton>
        </DialogFooter>

        {createProject.isError && (
          <p className="text-sm text-destructive" role="alert">
            Something went wrong creating the project. Please try again.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
