// apps/web/src/components/shared/task-list-group.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { AddTaskDialog } from "@/components/shared/add-task-dialog";
import { formatDueDate } from "@/lib/format-date";
import { cn } from "@/lib/utils";
import type { components } from "@/lib/api/schema";

type Task = components["schemas"]["TaskResponseDto"];
type TaskStatus = components["schemas"]["TaskResponseDto"]["status"];

interface TaskListGroupProps {
  label: string;
  status: TaskStatus;
  projectId: string;
  tasks: Task[];
}

export function TaskListGroup({ label, status, projectId, tasks }: TaskListGroupProps) {
  const [open, setOpen] = useState(true);

  return (
    <div className="mb-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="mb-2 flex items-center gap-1 text-sm font-medium text-foreground"
      >
        <ChevronDown className={cn("h-4 w-4 transition-transform", !open && "-rotate-90")} />
        {label}
      </button>

      {open && (
        <div className="overflow-x-auto rounded-md border border-border">
          {/* table-fixed: switches from the browser default
              (table-layout: auto, which sizes each table's columns off
              its own content) to fixed layout, which reads column widths
              once from the header row below and applies them uniformly.
              This is what makes all three separate <table>s (one per
              status group) line up instead of drifting independently. */}
          <table className="w-full min-w-[640px] table-fixed text-sm">
            <thead>
              <tr className="h-12 bg-muted text-left font-medium text-primary">
                {/* Task: no explicit width — table-fixed gives it
                    whatever's left after the other four columns claim
                    their fixed widths below. */}
                <th className="px-4">Task</th>
                <th className="w-32 px-4">Priority</th>
                <th className="w-32 px-4">Members</th>
                <th className="w-28 px-4">Due Date</th>
                <th className="w-16 px-4" />
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id} className="h-12 border-t border-border">
                  <td className="truncate px-4">
                    <Link href={`/tasks/${task.id}`} className="font-medium text-foreground hover:underline">
                      {task.title}
                    </Link>
                  </td>
                  <td className="px-4">
                    <PriorityBadge priority={task.priority} />
                  </td>
                  <td className="px-4">
                    {task.assignees[0] ? (
                      <Avatar className="h-6 w-6 rounded-full">
                        {task.assignees[0].avatarUrl && (
                          <AvatarImage
                            src={task.assignees[0].avatarUrl}
                            alt={task.assignees[0].fullName}
                          />
                        )}
                        <AvatarFallback className="rounded-full bg-muted text-[10px]">
                          {task.assignees[0].fullName[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 text-muted-foreground">
                    {task.dueDate ? formatDueDate(task.dueDate) : "—"}
                  </td>
                  {/* Actions menu — not wired to anything yet, same
                      unwired state as the board columns' "..." button. */}
                  <td className="px-4" />
                </tr>
              ))}
              <tr className="h-10 border-t border-border">
                <td colSpan={5} className="px-4">
                  <AddTaskDialog defaultStatus={status} projectId={projectId} variant="row" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
