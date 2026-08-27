// apps/web/src/components/shared/draggable-task-card.tsx
"use client";

import { motion } from "motion/react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { TaskCard } from "@/components/shared/task-card";
import type { components } from "@/lib/api/schema";

type Task = components["schemas"]["TaskResponseDto"];

interface DraggableTaskCardProps {
  task: Task;
}

// Parent-orchestrated stagger variant — see task-column.tsx. This
// component only declares "hidden"/"show" states; the parent's
// staggerChildren timing decides *when* each card actually animates in.
const cardVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
};

export function DraggableTaskCard({ task }: DraggableTaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.4 : 1,
        touchAction: "none",
      }}
    >
      {/* Motion lives on this inner, non-draggable wrapper — the outer div
          above is fully owned by dnd-kit's real-time drag transform.
          Keeping the two on separate DOM nodes means neither fights the
          other over the same CSS property. `layout` makes this card
          animate smoothly to a new position whenever it moves for any
          reason — drag included, but also a status change from the Task
          Detail page's dropdown. */}
      <motion.div layout variants={cardVariants} transition={{ duration: 0.15 }}>
        <TaskCard task={task} />
      </motion.div>
    </div>
  );
}
