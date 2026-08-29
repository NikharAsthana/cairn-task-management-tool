// apps/web/src/components/shared/mobile-nav.tsx
"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { AppSidebar } from "@/components/shared/app-sidebar";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Open navigation menu">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>

      <SheetContent
        side="left"
        showCloseButton={false}
        // The data-[side=left]: prefix here matters — it must match the
        // exact modifier the base component uses (see explanation above),
        // otherwise this silently loses the same tiebreak as before.
        // sm:max-w-none cancels the 384px cap so w-64 (256px) actually
        // takes effect at every screen size, not just below the sm breakpoint.
        className="w-64 p-0 data-[side=left]:w-64 data-[side=left]:sm:max-w-none"
      >
        {/* sr-only: present for screen readers (satisfies Radix's a11y
            requirement), invisible on screen — AppSidebar's own header
            already provides the visible heading. */}
        <SheetTitle className="sr-only">Navigation menu</SheetTitle>
        <AppSidebar onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}