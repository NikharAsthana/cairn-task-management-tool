// apps/web/src/app/(app)/projects/page.tsx
'use client';

import { PriorityBadge } from '@/components/shared/priority-badge';
import { AddProjectDialog } from '@/components/shared/add-project-dialog';
import { useProjects } from '@/hooks/use-projects';
import { formatDueDate } from '@/lib/format-date';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

export default function ProjectsPage() {
  const { data: projects, isLoading, isError } = useProjects();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Loading projects…</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-destructive">
          Couldn&apos;t load projects. Try refreshing.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-card-foreground">Projects</h1>
        <AddProjectDialog />
      </div>

      <div className="overflow-hidden rounded-md border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="h-12 bg-muted text-left font-medium text-primary">
              <th className="px-4">Projects</th>
              <th className="px-4">Priority</th>
              <th className="px-4">Lead</th>
              <th className="px-4">Due Date</th>
              <th className="w-16 px-4" />
            </tr>
          </thead>
          <tbody>
            {(!projects || projects.length === 0) && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-muted-foreground">
                  No projects yet — create one to get started.
                </td>
              </tr>
            )}
            {projects?.map((project) => (
              <tr key={project.id} className="h-12 border-t border-border">
                <td className="px-4 font-medium text-foreground">
                  {project.name}
                </td>
                <td className="px-4">
                  <PriorityBadge priority={project.priority} />
                </td>
                <td className="px-4">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6 rounded-full">
                      {project.lead.avatarUrl && (
                        <AvatarImage
                          src={project.lead.avatarUrl}
                          alt={project.lead.fullName}
                        />
                      )}
                      <AvatarFallback className="rounded-full bg-muted text-[10px]">
                        {project.lead.fullName[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-foreground">
                      {project.lead.fullName}
                    </span>
                  </div>
                </td>
                <td className="px-4 text-muted-foreground">
                  {project.dueDate ? formatDueDate(project.dueDate) : '—'}
                </td>
                <td className="px-4" />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}