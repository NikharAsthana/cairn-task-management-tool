// apps/web/src/components/shared/task-column.tsx
import { GripVertical, MoreHorizontal } from "lucide-react";
import { TaskCard } from "@/components/shared/task-card";
import { AddTaskDialog } from "@/components/shared/add-task-dialog";
import type { components } from "@/lib/api/schema";

type Task = components["schemas"]["TaskResponseDto"];
type TaskStatus = components["schemas"]["TaskResponseDto"]["status"];

interface TaskColumnProps {
  title: string;
  status: TaskStatus;
  tasks: Task[];
}

export function TaskColumn({ title, status, tasks }: TaskColumnProps) {
  return (
    <div className="flex w-72 shrink-0 flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">{title}</span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <AddTaskDialog defaultStatus={status} />
          {/* Column menu (rename/delete/reorder) — no functionality behind
              it yet, not in scope right now. */}
          <button type="button" className="rounded p-1 hover:bg-accent" disabled>
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {tasks.length === 0 ? (
          <p className="rounded-md border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
            No tasks
          </p>
        ) : (
          tasks.map((task) => <TaskCard key={task.id} task={task} />)
        )}
      </div>
    </div>
  );
}