import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Ban, FileInput, Forward, RefreshCw, FileX, LoaderCircle } from "lucide-react";
import { APPLICATION_STATUSES, applicationRows } from "@/lib/workflow";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { EmptyState, StatusBadge } from "./ui-bits";

const icons = [Ban, FileInput, Forward, RefreshCw, FileX, LoaderCircle];
export function ApplicationSummary() {
  const { projects, approvals } = useStore();
  const [selected, setSelected] = useState<string>();
  const records = applicationRows(projects, approvals);
  const rows = records.filter((r) => !selected || r.status === selected);
  return (
    <section className="mb-6" aria-labelledby="approval-summary">
      <h2 id="approval-summary" className="mb-3 text-sm font-semibold">
        Approval workflow status
      </h2>
      <p className="mb-3 text-xs text-muted-foreground">
        Application records plus project-only tracking where no application exists. Counts are not
        government approval totals.
      </p>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        {APPLICATION_STATUSES.map((status, i) => {
          const Icon = icons[i] ?? LoaderCircle;
          return (
            <Button
              key={status}
              variant="outline"
              aria-pressed={selected === status}
              aria-label={`Filter ${status}`}
              onClick={() => setSelected(status)}
              className={`h-full min-h-32 flex-col items-start justify-between gap-2 whitespace-normal p-4 text-left ${selected === status ? "border-primary bg-accent ring-1 ring-primary" : "bg-card"}`}
            >
              <Icon
                className={`h-5 w-5 ${status.startsWith("Rejected") ? "text-destructive" : "text-primary"}`}
              />
              <span className="font-mono text-3xl font-semibold">
                {records.filter((r) => r.status === status).length}
              </span>
              <span className="text-xs">{status}</span>
            </Button>
          );
        })}
      </div>
      <div className="my-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          {selected ?? "All workflow records"} · {rows.length} records ·{" "}
          {records.filter((r) => r.status === "Unmapped").length} unmapped
        </p>
        <Button
          variant="ghost"
          size="sm"
          aria-pressed={selected === "Unmapped"}
          onClick={() => setSelected("Unmapped")}
        >
          Unmapped
        </Button>
        {selected && (
          <Button variant="ghost" size="sm" onClick={() => setSelected(undefined)}>
            Clear filter
          </Button>
        )}
      </div>
      {rows.length === 0 ? (
        <EmptyState title="No workflow records match this status" />
      ) : (
        <ul className="divide-y border-y">
          {rows.map((r) => (
            <li
              key={r.id}
              className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm"
            >
              <Link
                to="/projects/$projectId"
                params={{ projectId: r.projectId }}
                className="text-primary hover:underline"
              >
                {r.label}
                <span className="ml-2 text-xs text-muted-foreground">
                  {r.kind === "application"
                    ? projects.find((p) => p.id === r.projectId)?.name
                    : "Project tracking only"}
                </span>
              </Link>
              <StatusBadge
                value={r.status === "Unmapped" ? `${r.rawStatus} · Unmapped` : r.status}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
