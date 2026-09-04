// apps/web/src/components/shared/task-description.tsx
'use client';

import { useState, useRef, type KeyboardEvent } from 'react';
import { Pencil } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

// Mirrors CreateTaskDto's @MaxLength(2000) in
// apps/api/src/tasks/dto/create-task.dto.ts — no shared constant between
// the two apps, so keep these two in sync by hand if it ever changes.
const MAX_LENGTH = 2000;

interface TaskDescriptionProps {
  value: string | null;
  onSave: (next: string) => void;
  disabled?: boolean;
}

// Maps markdown elements to the app's own design tokens instead of pulling
// in the @tailwindcss/typography plugin — one fewer dependency, and it
// stays visually consistent with the rest of the app's palette.
const markdownComponents = {
  p: (props: React.ComponentProps<'p'>) => (
    <p
      className="mb-2 text-sm leading-relaxed text-foreground last:mb-0"
      {...props}
    />
  ),
  h1: (props: React.ComponentProps<'h1'>) => (
    <h1 className="mb-2 text-base font-semibold text-foreground" {...props} />
  ),
  h2: (props: React.ComponentProps<'h2'>) => (
    <h2 className="mb-2 text-sm font-semibold text-foreground" {...props} />
  ),
  h3: (props: React.ComponentProps<'h3'>) => (
    <h3 className="mb-2 text-sm font-medium text-foreground" {...props} />
  ),
  ul: (props: React.ComponentProps<'ul'>) => (
    <ul
      className="mb-2 list-disc space-y-1 pl-5 text-sm text-foreground last:mb-0"
      {...props}
    />
  ),
  ol: (props: React.ComponentProps<'ol'>) => (
    <ol
      className="mb-2 list-decimal space-y-1 pl-5 text-sm text-foreground last:mb-0"
      {...props}
    />
  ),
  a: (props: React.ComponentProps<'a'>) => (
    <a
      className="text-primary underline underline-offset-2 hover:text-primary/80"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),
  code: (props: React.ComponentProps<'code'>) => (
    <code
      className="rounded bg-muted px-1 py-0.5 text-xs text-foreground"
      {...props}
    />
  ),
  strong: (props: React.ComponentProps<'strong'>) => (
    <strong className="font-semibold text-foreground" {...props} />
  ),
  blockquote: (props: React.ComponentProps<'blockquote'>) => (
    <blockquote
      className="mb-2 border-l-2 border-border pl-3 text-sm text-muted-foreground last:mb-0"
      {...props}
    />
  ),
};

export function TaskDescription({
  value,
  onSave,
  disabled,
}: TaskDescriptionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function startEditing() {
    setDraft(value ?? '');
    setIsEditing(true);
    requestAnimationFrame(() => textareaRef.current?.focus());
  }

  function commit() {
    setIsEditing(false);
    const trimmed = draft.trim();
    if (trimmed !== (value ?? '')) {
      onSave(trimmed);
    }
  }

  function cancel() {
    setDraft(value ?? '');
    setIsEditing(false);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Escape') {
      e.preventDefault();
      cancel();
    }
    // Cmd/Ctrl+Enter saves without needing to click away — the same
    // shortcut most chat and note-taking tools use for "submit."
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      textareaRef.current?.blur();
    }
  }

  if (isEditing) {
    return (
      <div className="mb-6">
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value.slice(0, MAX_LENGTH))}
          onBlur={commit}
          onKeyDown={handleKeyDown}
          rows={6}
          placeholder="Add a description, notes, or a link… (Markdown supported)"
          className="w-full resize-y rounded-md border border-input bg-transparent p-2 text-sm text-foreground outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
        <div className="mt-1 text-right text-xs text-muted-foreground">
          {draft.length}/{MAX_LENGTH}
        </div>
      </div>
    );
  }

  if (!value) {
    return (
      <button
        type="button"
        onClick={startEditing}
        disabled={disabled}
        className={cn(
          'mb-6 text-sm text-muted-foreground hover:text-foreground',
          disabled && 'pointer-events-none opacity-50',
        )}
      >
        Add a description, notes, or a link…
      </button>
    );
  }

  return (
    <div className="group relative -m-2 mb-6 rounded-md p-2 hover:bg-muted/50">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={markdownComponents}
      >
        {value}
      </ReactMarkdown>
      <button
        type="button"
        onClick={startEditing}
        disabled={disabled}
        aria-label="Edit description"
        className="absolute right-2 top-2 rounded p-1 text-muted-foreground hover:bg-background hover:text-foreground"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
