// apps/web/src/app/settings/layout.tsx
"use client";

import Link from "next/link";
import { ArrowLeft, Search, User, Sun, Moon, Palette } from "lucide-react";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { useColorMode, type ColorMode } from "@/providers/color-mode-provider";

const COLOR_MODES: { value: ColorMode; label: string; swatch: string }[] = [
  { value: "amber", label: "Amber", swatch: "#D97706" },
  { value: "blue", label: "Blue", swatch: "#2563EB" },
  { value: "pink", label: "Pink", swatch: "#DB2777" },
  { value: "rose", label: "Rose", swatch: "#E11D48" },
  { value: "emerald", label: "Emerald", swatch: "#059669" },
  { value: "black", label: "Black", swatch: "#171717" },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useTheme();
  const { colorMode, setColorMode } = useColorMode();

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

          {/* Previously static, unwired placeholders (Figma's own
              Theme/Color nav items had no distinct content pane behind
              them). Now wired to the SAME useTheme/useColorMode state
              AppSidebar already controls, via the identical dropdown
              primitives — one shared source of truth, not a second
              parallel implementation. Closes a real dead end: landing on
              /settings directly previously meant no way to change
              theme/color without clicking "Back to app" first. */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-sidebar-accent"
              >
                <Sun className="h-4 w-4" />
                Theme
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuCheckboxItem
                checked={theme === "light"}
                onCheckedChange={() => setTheme("light")}
              >
                <Sun className="mr-2 h-4 w-4" />
                Light
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={theme === "dark"}
                onCheckedChange={() => setTheme("dark")}
              >
                <Moon className="mr-2 h-4 w-4" />
                Dark
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-sidebar-accent"
              >
                <Palette className="h-4 w-4" />
                Color
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {COLOR_MODES.map(({ value, label, swatch }) => (
                <DropdownMenuCheckboxItem
                  key={value}
                  checked={colorMode === value}
                  onCheckedChange={() => setColorMode(value)}
                >
                  <span
                    className="mr-2 h-3.5 w-3.5 rounded-sm"
                    style={{ backgroundColor: swatch }}
                  />
                  {label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </aside>

      <main className="flex-1 bg-background">{children}</main>
    </div>
  );
}