// apps/web/src/components/shared/status-badge.tsx
import { cn } from "@/lib/utils";

type TaskStatus = "BACKLOG" | "TODO" | "IN_PROGRESS" | "ON_HOLD" | "DONE";

// None of these hex values are confirmed in design-tokens.md — only
// Backlog's dot was even visually spotted (amber/orange), and not
// Inspect-panel-verified. All five derived, same category of deviation as
// Urgent/No-Priority in PriorityBadge.
const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string }> = {
  BACKLOG: { label: "Backlog", color: "#F59E0B" },
  TODO: { label: "To Do", color: "#9CA3AF" },
  IN_PROGRESS: { label: "Doing", color: "#3B82F6" },
  ON_HOLD: { label: "On Hold", color: "#A855F7" },
  DONE: { label: "Completed", color: "#22C55E" },
};

interface StatusBadgeProps {
  status: TaskStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { label, color } = STATUS_CONFIG[status];

  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", className)}>
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}