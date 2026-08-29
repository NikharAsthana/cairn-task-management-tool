// apps/web/src/app/(app)/dashboard/page.tsx
"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { TaskColumn } from "@/components/shared/task-column";
import { TaskCard } from "@/components/shared/task-card";
import { useTasks } from "@/hooks/use-tasks";
import { useUpdateTaskStatus } from "@/hooks/use-update-task-status";
import type { components } from "@/lib/api/schema";

type TaskStatus = components["schemas"]["TaskResponseDto"]["status"];

const COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: "TODO", label: "To Do" },
  { status: "IN_PROGRESS", label: "Doing" },
  { status: "DONE", label: "Completed" },
  { status: "ON_HOLD", label: "On Hold" },
];

const COLUMN_STATUSES = new Set<string>(COLUMNS.map((c) => c.status));

export default function DashboardPage() {
  const { data, isLoading, isError } = useTasks();
  const updateStatus = useUpdateTaskStatus();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor),
  );

  const tasks = data?.data ?? [];
  const activeTask = tasks.find((t) => t.id === activeId);

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return; // dropped outside any column — no-op

    const taskId = String(active.id);
    const newStatus = String(over.id);
    if (!COLUMN_STATUSES.has(newStatus)) return;

    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return; // no real change, skip the request

    updateStatus.mutate({ taskId, status: newStatus as TaskStatus });
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Loading tasks…</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-destructive">
          Couldn&apos;t load tasks. Try refreshing.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-background p-4 sm:p-6">
      <h1 className="mb-6 text-lg font-semibold text-card-foreground">Tasks</h1>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        // dnd-kit's default threshold (0.2 = 20% of the scrollable
        // container's width from each edge) assumes a wide desktop board.
        // At a 375px viewport with ~1.3 columns visible, 20% is most of
        // the visible screen, so autoscroll hit max speed almost
        // instantly and blew straight past the middle columns.
        // 0.08 shrinks that hot zone to right at the true edge, so you
        // have to actually drag near the boundary before it kicks in.
        // acceleration is dnd-kit's default (10) roughly halved, for a
        // slower ramp once it does start — trades top speed for control.
        // y: 0 disables vertical autoscroll entirely: this board only
        // scrolls horizontally, so a drag has no reason to also trigger
        // page-level vertical scrolling.
        autoScroll={{
          threshold: { x: 0.08, y: 0 },
          acceleration: 4,
        }}
      >
        <div className="flex flex-1 gap-4 overflow-x-auto snap-x snap-mandatory">
          {COLUMNS.map(({ status, label }) => (
            <TaskColumn
              key={status}
              title={label}
              status={status}
              tasks={tasks.filter((task) => task.status === status)}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask && (
            <div className="w-72 rotate-2 opacity-90 shadow-lg">
              <TaskCard task={activeTask} />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}