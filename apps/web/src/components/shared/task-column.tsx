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

// The container's own "show" transition defines staggerChildren — each
// child (see DraggableTaskCard's matching "hidden"/"show" variant names)
// picks that timing up automatically from this parent, no per-card
// delay math needed.
const listVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.04 },
  },
};

export function TaskColumn({ title, status, tasks }: TaskColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div className="flex w-72 shrink-0 flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">{title}</span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <AddTaskDialog defaultStatus={status} />
          <button type="button" className="rounded p-1 hover:bg-accent" disabled>
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