// apps/web/src/app/(app)/layout.tsx
import { AppSidebar } from "@/components/shared/app-sidebar";
import { MobileNav } from "@/components/shared/mobile-nav";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex">
        <AppSidebar />
      </div>

      <div className="flex flex-1 flex-col min-w-0">
        <header className="flex h-14 items-center border-b px-4 lg:hidden">
          <MobileNav />
        </header>

        <main className="flex-1 min-w-0 bg-background">{children}</main>
      </div>
    </div>
  );
}
