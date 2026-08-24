// apps/web/src/lib/format-date.ts

// Matches the confirmed Figma display pattern: "29 Jul" — day + abbreviated
// month, no year.
export function formatDueDate(isoDate: string): string {
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
  }).format(date);
}