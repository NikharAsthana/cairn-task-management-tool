// apps/web/src/components/shared/task-column.tsx
"use client";

import { motion } from "motion/react";
import { useDroppable } from "@dnd-kit/core";
import { GripVertical, MoreHorizontal } from "lucide-react";
import { DraggableTaskCard } from "@/components/shared/draggable-task-card";
import { AddTaskDialog } from "@/components/shared/add-task-dialog";
import { cn } from "@/lib/utils";
import type { components } from "@/lib/api/schema";

type Task = components["schemas"]["TaskResponseDto"];
type TaskStatus = components["schemas"]["TaskResponseDto"]["status"];

interface TaskColumnProps {
  title: string;
  status: TaskStatus;
  tasks: Task[];
}

const listVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.04 },
  },
};

export function TaskColumn({ title, status, tasks }: TaskColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div className="flex w-72 shrink-0 snap-start flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* GripVertical: purely decorative here — not an interactive
              drag handle (column reordering isn't implemented), just
              visual next to the visible column title. No aria treatment
              needed since it's not actionable and sits beside real text. */}
          <GripVertical className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">{title}</span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <AddTaskDialog defaultStatus={status} />
          {/* aria-label added even though this button is disabled — it's
              a real placeholder for a future column-actions menu (per the
              deviations list), and labeling it now means it's already
              correct the moment it gets wired up, instead of being
              another thing to remember later. */}
          <button
            type="button"
            aria-label="More options"
            className="rounded p-1 hover:bg-accent"
            disabled
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      <motion.div
        ref={setNodeRef}
        variants={listVariants}
        initial="hidden"
        animate="show"
        className={cn(
          "flex min-h-16 flex-col gap-2 rounded-md transition-colors",
          isOver && "bg-accent/50",
        )}
      >
        {tasks.length === 0 ? (
          <p className="rounded-md border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
            No tasks
          </p>
        ) : (
          tasks.map((task) => <DraggableTaskCard key={task.id} task={task} />)
        )}
      </motion.div>
    </div>
  );
}