import type { ReactNode } from "react";
import { Info, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "success" | "warning" | "danger" | "info" | "neutral";

const toneClass: Record<Tone, string> = {
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-destructive",
  info: "bg-info-soft text-info",
  neutral: "bg-neutral-soft text-muted-foreground",
};

const toneMap: Record<string, Tone> = {
  Approved: "success", Completed: "success", Received: "success", Uploaded: "success", "Granted (recorded)": "success", Applicable: "neutral",
  "In progress": "info", Submitted: "info", "Under review": "info", Active: "info",
  "Changes requested": "danger", Expired: "danger", "Query raised": "danger", High: "danger", Overdue: "danger",
  "Needs verification": "warning", "Needs review": "warning", Pending: "warning", Draft: "warning", Medium: "warning", "On hold": "warning",
};

export function StatusBadge({ value, className }: { value: string; className?: string }) {
  const tone = toneMap[value] ?? "neutral";
  return (
    <span className={cn("inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium", toneClass[tone], className)}>
      {value}
    </span>
  );
}

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ label, value, hint, tone }: { label: string; value: ReactNode; hint?: string; tone?: Tone }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={cn("mt-2 font-mono text-3xl font-semibold", tone === "danger" && "text-destructive", tone === "warning" && "text-warning")}>{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function Panel({ title, children, action, className }: { title: string; children: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-lg border bg-card", className)}>
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="text-sm font-semibold">{title}</h2>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-10 text-center">
      <Inbox className="h-8 w-8 text-muted-foreground" />
      <p className="mt-2 text-sm font-medium">{title}</p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function VerificationNotice() {
  return (
    <div className="flex gap-2 rounded-md border bg-warning-soft px-3 py-2 text-xs text-warning">
      <Info className="mt-0.5 h-4 w-4 shrink-0" />
      <p>
        Fictional example data. Requirements must be verified against applicable official sources and reviewed by a qualified
        professional. This tool tracks workflow only and does not provide legal advice.
      </p>
    </div>
  );
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-full rounded-full bg-muted">
        <div className="h-1.5 rounded-full bg-primary" style={{ width: `${value}%` }} />
      </div>
      <span className="w-9 text-right font-mono text-xs text-muted-foreground">{value}%</span>
    </div>
  );
}

export function SimulatedTag() {
  return <span className="rounded border border-dashed px-1.5 py-0.5 text-[10px] font-medium uppercase text-muted-foreground">Simulated</span>;
}
