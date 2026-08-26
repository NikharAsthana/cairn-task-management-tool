// apps/web/src/components/shared/task-card.tsx
import Link from "next/link";
import { Calendar, Tag } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { formatDueDate } from "@/lib/format-date";
import type { components } from "@/lib/api/schema";

type Task = components["schemas"]["TaskResponseDto"];

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const primaryAssignee = task.assignees[0];

  return (
    <Link
      href={`/tasks/${task.id}`}
      className="flex flex-col gap-4 rounded-md border border-border bg-background p-3 transition-colors hover:border-foreground/20"
    >
      <p className="text-sm font-medium text-accent-foreground">{task.title}</p>

      <div className="flex items-center justify-between">
        {primaryAssignee ? (
          <div className="flex items-center gap-1.5">
            <Avatar className="h-5 w-5 rounded-full">
              {primaryAssignee.avatarUrl && (
                <AvatarImage src={primaryAssignee.avatarUrl} alt={primaryAssignee.fullName} />
              )}
              <AvatarFallback className="rounded-full bg-muted text-[10px]">
                {primaryAssignee.fullName[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-foreground">{primaryAssignee.fullName}</span>
          </div>
        ) : (
          <span />
        )}

        {task.dueDate && (
          <span
            className="inline-flex items-center gap-1 rounded-3xl px-2 py-0.5 text-xs"
            style={{ backgroundColor: "rgb(220 38 38 / 0.1)", color: "var(--destructive)" }}
          >
            <Calendar className="h-3 w-3" />
            {formatDueDate(task.dueDate)}
          </span>
        )}
      </div>

      {task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
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
    </Link>
  );
}
