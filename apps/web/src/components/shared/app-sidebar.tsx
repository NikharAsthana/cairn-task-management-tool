// apps/web/src/components/shared/app-sidebar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  ChevronsUpDown,
  ChevronDown,
  LayoutDashboard,
  Briefcase,
  Sun,
  Moon,
  Palette,
  Settings as SettingsIcon,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useColorMode, type ColorMode } from "@/providers/color-mode-provider";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Tasks", href: "/dashboard", icon: LayoutDashboard },
  { label: "Projects", href: "/projects", icon: Briefcase },
];

const COLOR_MODES: { value: ColorMode; label: string; swatch: string }[] = [
  { value: "amber", label: "Amber", swatch: "#D97706" },
  { value: "blue", label: "Blue", swatch: "#2563EB" },
  { value: "pink", label: "Pink", swatch: "#DB2777" },
  { value: "rose", label: "Rose", swatch: "#E11D48" },
  { value: "emerald", label: "Emerald", swatch: "#059669" },
  { value: "black", label: "Black", swatch: "#171717" },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [workspaceOpen, setWorkspaceOpen] = useState(true);
  const { theme, setTheme } = useTheme();
  const { colorMode, setColorMode } = useColorMode();
  const { data: user } = useCurrentUser();

  const initial = user?.fullName?.[0]?.toUpperCase() ?? "?";

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex h-16 items-center p-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex h-12 w-full items-center gap-2 rounded-xl px-3 py-2 text-left hover:bg-sidebar-accent"
            >
              <Avatar className="h-8 w-8 rounded-2xl">
                <AvatarFallback className="rounded-2xl bg-muted text-xs">
                  {initial}
                </AvatarFallback>
              </Avatar>
              {/* Trigger label: text-sm/leading-none/semibold — a compact
                  nav-header treatment, deliberately distinct from the
                  dropdown's profile-card name below. */}
              <span className="flex-1 truncate text-sm font-semibold leading-none text-sidebar-foreground">
                {user?.fullName ?? "…"}
              </span>
              <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="start" className="w-64">
            {/* Vertical, centered identity block — avatar 40x40
                rounded-full, gap-4 (16px) to the name/email block.
                Name: text-xs/leading-normal/medium.
                Username: text-xs/leading-normal/medium, literal Tailwind
                gray-500 (#6B7280) — distinct from our --muted-foreground
                token (#737373). */}
            <div className="flex flex-col items-center gap-4 px-2 py-4">
              <Avatar className="h-10 w-10 rounded-full">
                <AvatarFallback className="rounded-full bg-muted text-xs">
                  {initial}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-center text-center">
                <span className="text-xs font-medium leading-normal text-foreground">
                  {user?.fullName ?? "…"}
                </span>
                {/* Deferred, documented gap: Figma shows email here, but
                    /auth/me doesn't return one yet — showing username
                    instead until the backend DTO grows an email field. */}
                <span
                  className="text-xs font-medium leading-normal"
                  style={{ color: "#6B7280" }}
                >
                  {user?.username ?? ""}
                </span>
              </div>
            </div>

            <DropdownMenuSeparator />

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Sun className="mr-2 h-4 w-4" />
                Change Theme
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
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
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Palette className="mr-2 h-4 w-4" />
                Color Mode
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
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
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>

            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <Link href="/settings">
                <SettingsIcon className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex-1 p-2">
        <button
          type="button"
          onClick={() => setWorkspaceOpen((open) => !open)}
          className="flex w-full items-center justify-between px-2 py-1 text-sm font-medium text-foreground"
        >
          Workspace
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              !workspaceOpen && "-rotate-90",
            )}
          />
        </button>

        {workspaceOpen && (
          <nav className="mt-1 flex flex-col gap-1">
            {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex h-9 items-center gap-2 rounded-xl px-3 text-sm font-medium leading-none",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-muted-foreground hover:bg-sidebar-accent/50",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
        )}
      </div>
    </aside>
  );
}