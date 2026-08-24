// apps/web/src/app/(app)/dashboard/page.tsx
"use client";

import { TaskColumn } from "@/components/shared/task-column";
import { useTasks } from "@/hooks/use-tasks";
import type { components } from "@/lib/api/schema";

type TaskStatus = components["schemas"]["TaskResponseDto"]["status"];

const COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: "TODO", label: "To Do" },
  { status: "IN_PROGRESS", label: "Doing" },
  { status: "DONE", label: "Completed" },
  { status: "ON_HOLD", label: "On Hold" },
];

export default function DashboardPage() {
  const { data, isLoading, isError } = useTasks();

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

  const tasks = data?.data ?? [];

  return (
    <div className="flex h-screen flex-col bg-background p-6">
      <h1 className="mb-6 text-lg font-semibold text-card-foreground">Tasks</h1>

      <div className="flex flex-1 gap-4 overflow-x-auto">
        {COLUMNS.map(({ status, label }) => (
          <TaskColumn
            key={status}
            title={label}
            status={status}
            tasks={tasks.filter((task) => task.status === status)}
          />
        ))}
      </div>
    </div>
  );
}