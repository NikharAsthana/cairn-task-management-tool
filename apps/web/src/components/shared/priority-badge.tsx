// apps/web/src/components/shared/priority-badge.tsx
import { SignalHigh, SignalLow, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

type Priority = "NO_PRIORITY" | "LOW" | "MEDIUM" | "HIGH" | "URGENT";

const PRIORITY_CONFIG: Record<
  Priority,
  { label: string; color: string; icon: typeof SignalHigh }
> = {
  NO_PRIORITY: { label: "No Priority", color: "var(--muted-foreground)", icon: Minus },
  LOW: { label: "Low", color: "#9CA3AF", icon: SignalLow },
  MEDIUM: { label: "Medium", color: "#F97316", icon: SignalHigh },
  HIGH: { label: "High", color: "#EF4444", icon: SignalHigh },
  URGENT: { label: "Urgent", color: "var(--destructive)", icon: SignalHigh },
};

interface PriorityBadgeProps {
  priority: Priority;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const { label, color, icon: Icon } = PRIORITY_CONFIG[priority];

  return (
    <span
      className={cn("inline-flex h-4 w-fit items-center gap-1 text-xs font-medium", className)}
      style={{ color }}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}