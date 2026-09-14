// apps/web/src/components/shared/task-card.tsx
import Link from "next/link";
import { Calendar, Tag } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { formatDueDate } from "@/lib/format-date";
import type { components } from "@/lib/api/schema";

type Task = components["schemas"]["TaskResponseDto"];

interface TaskCardProps {
  task: Task;
  // Not on the task object itself — TaskResponseDto only carries
  // `projectId`, not the project's name. The dashboard board spans every
  // project at once, so the caller resolves this (from the already-fetched
  // projects list) and passes it down. Optional: while that list is still
  // loading, the card just renders without the pill rather than blocking.
  projectName?: string;
}

const PROJECT_NAME_LIMIT = 6;

function truncateProjectName(name: string): string {
  return name.length > PROJECT_NAME_LIMIT
    ? `${name.slice(0, PROJECT_NAME_LIMIT)}…`
    : name;
}

export function TaskCard({ task, projectName }: TaskCardProps) {
  const primaryAssignee = task.assignees[0];

  return (
    <Link
      href={`/tasks/${task.id}`}
      className="flex flex-col gap-4 rounded-md border border-border bg-background p-3 transition-colors hover:border-foreground/20"
    >
      <p className="text-sm font-medium text-accent-foreground">{task.title}</p>

      {/* Project + assignee share the left side, due date stays pinned
          right via justify-between — this used to be two separate rows
          (assignee/date, then project on its own below), which put the
          project pill and due-date pill on opposite corners of the card
          with nothing visually tying them together. Grouping them into
          one row reads as a coherent pair instead of two floating badges,
          and it's one less gap-4 of dead vertical space per card. */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          {projectName && (
            <span className="inline-flex shrink-0 items-center rounded-3xl bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {truncateProjectName(projectName)}
            </span>
          )}

          {primaryAssignee && (
            <div className="flex min-w-0 items-center gap-1.5">
              <Avatar className="h-5 w-5 shrink-0 rounded-full">
                {primaryAssignee.avatarUrl && (
                  <AvatarImage src={primaryAssignee.avatarUrl} alt={primaryAssignee.fullName} />
                )}
                <AvatarFallback className="rounded-full bg-muted text-[10px]">
                  {primaryAssignee.fullName[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="truncate text-xs text-foreground">{primaryAssignee.fullName}</span>
            </div>
          )}
        </div>

        {task.dueDate && (
          <span
            className="inline-flex shrink-0 items-center gap-1 rounded-3xl px-2 py-0.5 text-xs"
            style={{ backgroundColor: "rgb(220 38 38 / 0.1)", color: "var(--destructive)" }}
          >
            {/* aria-hidden: the visible date text right after this icon
                already says the same thing — without this, some screen
                readers announce the icon separately as an unlabeled
                graphic, which is just noise on top of real information. */}
            <Calendar className="h-3 w-3" aria-hidden="true" />
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
              <Tag className="h-3 w-3 text-foreground" aria-hidden="true" />
              {label.name}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}