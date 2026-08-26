// apps/web/src/components/shared/add-task-dialog.tsx
"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api/client";
import { useProjects } from "@/hooks/use-projects";
import type { components } from "@/lib/api/schema";

// NonNullable strips the `| undefined` that comes from these being
// *optional* fields on CreateTaskDto — a request-schema artifact, not a
// real runtime possibility. Every value below is a fixed, always-present
// literal.
type Priority = NonNullable<components["schemas"]["CreateTaskDto"]["priority"]>;
type TaskStatus = NonNullable<components["schemas"]["CreateTaskDto"]["status"]>;

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: "NO_PRIORITY", label: "No Priority" },
  { value: "URGENT", label: "Urgent" },
  { value: "HIGH", label: "High" },
  { value: "MEDIUM", label: "Medium" },
  { value: "LOW", label: "Low" },
];

interface AddTaskDialogProps {
  defaultStatus: TaskStatus;
  projectId?: string;
  variant?: "icon" | "row";
}

export function AddTaskDialog({
  defaultStatus,
  projectId,
  variant = "icon",
}: AddTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [priority, setPriority] = useState<Priority>("NO_PRIORITY");
  const [dueDate, setDueDate] = useState("");
  const queryClient = useQueryClient();
  const { data: projects } = useProjects();

  const effectiveProjectId = projectId ?? selectedProjectId;

  const createTask = useMutation({
    mutationFn: async () => {
      const { data, error } = await apiClient.POST("/tasks", {
        body: {
          title,
          projectId: effectiveProjectId,
          status: defaultStatus,
          priority,
          ...(dueDate && { dueDate }),
        },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setOpen(false);
      setTitle("");
      setSelectedProjectId("");
      setPriority("NO_PRIORITY");
      setDueDate("");
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {variant === "row" ? (
          <button
            type="button"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <Plus className="h-4 w-4" />
            Add Task
          </button>
        ) : (
          <button type="button" className="rounded p-1 hover:bg-accent">
            <Plus className="h-4 w-4" />
          </button>
        )}
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>New task</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="task-title">Title</Label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Write API documentation"
            />
          </div>

          {!projectId && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="task-project">Project</Label>
              <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                <SelectTrigger id="task-project">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects?.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {projects?.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No projects yet — create one on the Projects page first.
                </p>
              )}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="task-priority">Priority</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
              <SelectTrigger id="task-priority">
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
            <Label htmlFor="task-due-date">Due date (optional)</Label>
            <input
              id="task-due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={() => createTask.mutate()}
            disabled={!title || !effectiveProjectId || createTask.isPending}
            className="h-9 rounded-full bg-primary font-medium text-primary-foreground hover:bg-primary/90"
          >
            {createTask.isPending ? "Creating…" : "Create task"}
          </Button>
        </DialogFooter>

        {createTask.isError && (
          <p className="text-sm text-destructive" role="alert">
            Something went wrong creating the task. Please try again.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}