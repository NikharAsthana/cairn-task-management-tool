// apps/web/src/app/(app)/tasks/[taskId]/page.tsx
"use client";

import { useParams } from "next/navigation";
import { Calendar, Paperclip, Tag } from "lucide-react";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTask } from "@/hooks/use-task";
import { useUpdateTask } from "@/hooks/use-update-task";
import { formatDueDate } from "@/lib/format-date";
import type { components } from "@/lib/api/schema";

type Priority = components["schemas"]["TaskResponseDto"]["priority"];
type TaskStatus = components["schemas"]["TaskResponseDto"]["status"];

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: "NO_PRIORITY", label: "No Priority" },
  { value: "URGENT", label: "Urgent" },
  { value: "HIGH", label: "High" },
  { value: "MEDIUM", label: "Medium" },
  { value: "LOW", label: "Low" },
];

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: "BACKLOG", label: "Backlog" },
  { value: "TODO", label: "To Do" },
  { value: "IN_PROGRESS", label: "Doing" },
  { value: "ON_HOLD", label: "On Hold" },
  { value: "DONE", label: "Completed" },
];

export default function TaskDetailPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const { data: task, isLoading, isError } = useTask(taskId);
  const updateTask = useUpdateTask(taskId);

  if (isLoading) {
    // min-h-full (not min-h-screen): same fix as the main content below —
    // min-h-screen ignores the 56px mobile header eaten out of the
    // viewport by (app)/layout.tsx and overshoots by that much.
    return (
      <div className="flex min-h-full items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Loading task…</p>
      </div>
    );
  }

  if (isError || !task) {
    return (
      <div className="flex min-h-full items-center justify-center bg-background">
        <p className="text-sm text-destructive">
          Couldn&apos;t load this task. It may not exist, or you may not have access.
        </p>
      </div>
    );
  }

  return (
    // Mobile (below lg): flex-col, single continuous scroll for the whole
    // page — content and the Details panel stack as one vertical flow.
    // Desktop (lg+): flex-row, back to the original side-by-side layout,
    // overflow-hidden so only the inner panels scroll independently.
    // h-full (not h-screen): fills whatever height (app)/layout.tsx's
    // <main> actually gives it, correctly accounting for the mobile
    // header's 56px — same reasoning as the dashboard page fix.
    <div className="flex h-full flex-col overflow-y-auto bg-background lg:flex-row lg:overflow-hidden">
      {/* p-4 on mobile, back to the original p-8 at lg+. overflow-y-auto
          only applies at lg+ now — on mobile the *whole page* scrolls
          together (see the root div above), so this panel scrolling
          independently too would just create a confusing nested scrollbar. */}
      <div className="flex-1 p-4 lg:overflow-y-auto lg:p-8">
        <h1 className="mb-4 text-2xl font-semibold text-card-foreground">
          {task.title}
        </h1>

        {/* Description intentionally omitted — Task doesn't have a
            description field yet. Real, small migration if you want it
            (see chat); not blocking. */}

        {task.labels.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-1.5">
            {task.labels.map((label) => (
              <span
                key={label.id}
                className="inline-flex items-center gap-1 rounded-3xl bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
              >
                <Tag className="h-3 w-3 text-foreground" />
                {label.name}
              </span>
            ))}
          </div>
        )}

        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Paperclip className="h-4 w-4" />
          {/* Static — no attach-document functionality built, matches
              current real scope, not wired to anything. */}
          Add document or link…
        </div>

        {/* Subtasks table deferred — the API doesn't support filtering
            tasks by parentTaskId yet (see chat), so this can't be built
            against real data without another backend change first. */}
      </div>

      {/* w-full on mobile (full-width section below content), lg:w-80
          restores the original fixed 320px side panel. border-t on
          mobile (it's now a divider above this section); lg:border-t-0
          lg:border-l swaps that to the original left-edge divider once
          it's a side panel again. */}
      <aside className="w-full border-t border-border p-4 lg:w-80 lg:shrink-0 lg:border-t-0 lg:border-l lg:p-6">
        <h2 className="mb-4 text-sm font-medium text-foreground">Details</h2>

        <div className="flex flex-col gap-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Status</span>
            <Select
              value={task.status}
              onValueChange={(value) => updateTask.mutate({ status: value as TaskStatus })}
            >
              <SelectTrigger className="h-8 w-32 border-none shadow-none">
                <SelectValue>
                  <StatusBadge status={task.status} />
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Priority</span>
            <Select
              value={task.priority}
              onValueChange={(value) => updateTask.mutate({ priority: value as Priority })}
            >
              <SelectTrigger className="h-8 w-32 border-none shadow-none">
                <SelectValue>
                  <PriorityBadge priority={task.priority} />
                </SelectValue>
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

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Members</span>
            {task.assignees.length > 0 ? (
              <div className="flex -space-x-1.5">
                {task.assignees.map((assignee) => (
                  <Avatar key={assignee.id} className="h-6 w-6 rounded-full ring-2 ring-background">
                    {assignee.avatarUrl && (
                      <AvatarImage src={assignee.avatarUrl} alt={assignee.fullName} />
                    )}
                    <AvatarFallback className="rounded-full bg-muted text-[10px]">
                      {assignee.fullName[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
            ) : (
              // Read-only — assigning members needs UpdateTaskDto to
              // accept assigneeIds, which it doesn't yet.
              <span className="text-muted-foreground">—</span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Due Date</span>
            <span className="flex items-center gap-1 text-foreground">
              <Calendar className="h-3.5 w-3.5" />
              {task.dueDate ? formatDueDate(task.dueDate) : "—"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Labels</span>
            <span className="text-foreground">
              {task.labels.length > 0 ? task.labels.length : "—"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Reporter</span>
            <div className="flex items-center gap-1.5">
              <Avatar className="h-6 w-6 rounded-full">
                {task.reporter.avatarUrl && (
                  <AvatarImage src={task.reporter.avatarUrl} alt={task.reporter.fullName} />
                )}
                <AvatarFallback className="rounded-full bg-muted text-[10px]">
                  {task.reporter.fullName[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-foreground">{task.reporter.fullName}</span>
            </div>
          </div>
        </div>

        {updateTask.isError && (
          <p className="mt-4 text-xs text-destructive" role="alert">
            Couldn&apos;t save that change. Please try again.
          </p>
        )}
      </aside>
    </div>
  );
}
