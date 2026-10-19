import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { LayoutDashboard, FolderKanban, ListChecks, FileText, CalendarClock, Stamp, BarChart3, Menu, ShieldCheck } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/checklist", label: "Compliance checklist", icon: ListChecks },
  { to: "/documents", label: "Document register", icon: FileText },
  { to: "/tasks", label: "Tasks & deadlines", icon: CalendarClock },
  { to: "/approvals", label: "Approvals tracker", icon: Stamp },
  { to: "/reports", label: "Reports", icon: BarChart3 },
] as const;

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex flex-col gap-1 p-3">
      {nav.map((n) => {
        const active = n.to === "/" ? path === "/" : path.startsWith(n.to);
        return (
          <Link
            key={n.to}
            to={n.to}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm text-nav-muted transition-colors hover:bg-nav-active hover:text-nav-foreground",
              active && "bg-nav-active text-nav-foreground",
            )}
          >
            <n.icon className="h-4 w-4" />
            {n.label}
          </Link>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2 px-6 py-5">
      <ShieldCheck className="h-6 w-6 text-primary-foreground" />
      <div>
        <p className="text-sm font-semibold text-nav-foreground">ClearTrack</p>
        <p className="text-[11px] text-nav-muted">Demo workspace</p>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-h-screen w-full">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-nav lg:flex">
        <Brand />
        <NavList />
        <p className="mt-auto px-6 py-4 text-[11px] text-nav-muted">Prototype · fictional data · changes reset on reload</p>
      </aside>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-64 border-0 bg-nav p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <Brand />
          <NavList onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b bg-card px-4 lg:px-8">
          <button aria-label="Open navigation" onClick={() => setOpen(true)} className="rounded-md p-2 hover:bg-muted lg:hidden">
            <Menu className="h-5 w-5" />
          </button>
          <span className="rounded-full bg-warning-soft px-2.5 py-0.5 text-xs font-medium text-warning">Demonstration workspace</span>
          <span className="ml-auto hidden text-xs text-muted-foreground sm:block">Signed in as Demo User (simulated)</span>
        </header>
        <main className="mx-auto w-full max-w-7xl flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
