// apps/web/src/app/(app)/projects/page.tsx
'use client';

import Link from 'next/link';
import { PriorityBadge } from '@/components/shared/priority-badge';
import { AddProjectDialog } from '@/components/shared/add-project-dialog';
import { useProjects } from '@/hooks/use-projects';
import { formatDueDate } from '@/lib/format-date';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

export default function ProjectsPage() {
  const { data: projects, isLoading, isError } = useProjects();

  if (isLoading) {
    return (
      <div className="flex min-h-full items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Loading projects…</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-full items-center justify-center bg-background">
        <p className="text-sm text-destructive">
          Couldn&apos;t load projects. Try refreshing.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-background p-4 sm:p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-card-foreground">Projects</h1>
        <AddProjectDialog />
      </div>

      {/* overflow-x-auto (not overflow-hidden): the previous value
          clipped anything past the container's width with no way to
          reach it at all — the exact bug you found. overflow-x-auto lets
          the browser add a horizontal scrollbar/swipe instead, same
          pattern already used for the Kanban board. */}
      <div className="overflow-x-auto rounded-md border border-border">
        {/* min-w-[640px]: without an explicit minimum, a table with
            "auto" layout will let flexible browsers squash the columns
            down uncomfortably narrow to force a fit — Lead's avatar +
            name and Due Date get the worst of it. Setting a floor means
            the table always renders at a legible width, and lets the
            wrapper's overflow-x-auto do its job below that width instead
            of the browser silently cramming content together. */}
        <table className="w-full min-w-[640px] text-sm">
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
                  <Link href={`/projects/${project.id}`} className="hover:underline">
                    {project.name}
                  </Link>
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