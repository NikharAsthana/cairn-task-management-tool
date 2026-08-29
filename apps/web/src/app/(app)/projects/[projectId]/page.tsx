// apps/web/src/app/(app)/projects/[projectId]/page.tsx
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { TaskListGroup } from "@/components/shared/task-list-group";
import { useProject } from "@/hooks/use-project";
import { useProjectTasks } from "@/hooks/use-project-tasks";
import type { components } from "@/lib/api/schema";

type TaskStatus = components["schemas"]["TaskResponseDto"]["status"];

// Matches this specific Figma screen exactly — three groups, not the main
// board's four. This screen's source design never shows an On Hold
// section, even though the main Tasks board does. Real inconsistency in
// the source file, documented rather than "fixed" to match the other screen.
const GROUPS: { status: TaskStatus; label: string }[] = [
  { status: "TODO", label: "To Do" },
  { status: "IN_PROGRESS", label: "Doing" },
  { status: "DONE", label: "Completed" },
];

export default function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: project, isLoading: projectLoading, isError: projectError } = useProject(projectId);
  const { data: tasksData, isLoading: tasksLoading } = useProjectTasks(projectId);

  if (projectLoading || tasksLoading) {
    return (
      <div className="flex min-h-full items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Loading project…</p>
      </div>
    );
  }

  if (projectError || !project) {
    return (
      <div className="flex min-h-full items-center justify-center bg-background">
        <p className="text-sm text-destructive">
          Couldn&apos;t load this project. It may not exist, or you may not have access.
        </p>
      </div>
    );
  }

  const tasks = tasksData?.data ?? [];

  return (
    <div className="flex h-full flex-col bg-background p-4 sm:p-6">
      <div className="mb-6 flex items-center gap-1 text-sm">
        <Link href="/projects" className="text-muted-foreground hover:text-foreground">
          Projects
        </Link>
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        {/* truncate: a long project name would previously wrap the
            breadcrumb across two lines or push it off-screen with no
            graceful handling. truncate + min-w-0 lets it cut off with an
            ellipsis instead — small, but worth doing while touching this
            file rather than leaving another untested edge case behind. */}
        <span className="min-w-0 truncate font-medium text-foreground">
          {project.name}
        </span>
      </div>

      {/* flex-1: this is the actual fix. Without it, this div had no
          bounded height to measure "overflow" against — see explanation
          above — so overflow-y-auto was silently doing nothing. */}
      <div className="flex-1 overflow-y-auto">
        {GROUPS.map(({ status, label }) => (
          <TaskListGroup
            key={status}
            label={label}
            status={status}
            projectId={projectId}
            tasks={tasks.filter((task) => task.status === status)}
          />
        ))}
      </div>
    </div>
  );
}