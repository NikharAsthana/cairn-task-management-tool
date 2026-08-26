// apps/web/src/app/settings/layout.tsx
import Link from "next/link";
import { ArrowLeft, Search, User, Sun, Palette } from "lucide-react";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="flex w-64 shrink-0 flex-col gap-4 border-r border-sidebar-border bg-sidebar p-2">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to app
        </Link>

        {/* Decorative — no search functionality needed for one static
            settings page, not wired to anything. */}
        <div className="flex items-center gap-2 rounded-md border border-input px-3 py-2 text-sm text-muted-foreground">
          <Search className="h-4 w-4" />
          Search
        </div>

        <nav className="flex flex-col gap-1">
          <div className="flex items-center gap-2 rounded-xl bg-sidebar-accent px-3 py-2 text-sm font-medium text-sidebar-accent-foreground">
            <User className="h-4 w-4" />
            Profile
          </div>
          {/* Per design-tokens.md: Figma's own Theme/Color nav items are
              placeholders with no distinct content pane in the source
              file. Reusing the account dropdown's real, already-working
              Theme/Color controls instead of building a second, redundant
              set here — visually present, not separately wired. */}
          <div className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted-foreground">
            <Sun className="h-4 w-4" />
            Theme
          </div>
          <div className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted-foreground">
            <Palette className="h-4 w-4" />
            Color
          </div>
        </nav>
      </aside>

      <main className="flex-1 bg-background">{children}</main>
    </div>
  );
}