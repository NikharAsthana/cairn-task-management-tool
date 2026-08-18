// apps/web/src/components/shared/logo.tsx
import { Mountain } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Mountain className="h-4 w-4" />
      </span>
      <span className="text-base font-semibold text-card-foreground">
        {siteConfig.name}
      </span>
    </div>
  );
}