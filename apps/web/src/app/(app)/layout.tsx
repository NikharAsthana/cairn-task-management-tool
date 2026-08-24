// apps/web/src/app/(app)/layout.tsx
import { AppSidebar } from "@/components/shared/app-sidebar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <main className="flex-1 bg-background">{children}</main>
    </div>
  );
}