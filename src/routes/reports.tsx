import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { summarize } from "@/lib/metrics";
import {
  PageHeader,
  StatCard,
  Panel,
  ProgressBar,
  VerificationNotice,
} from "@/components/app/ui-bits";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Reports — Realtify demo" },
      {
        name: "description",
        content: "Project summary of completed, outstanding, overdue and unverified items.",
      },
      { property: "og:title", content: "Reports — Realtify demo" },
      {
        property: "og:description",
        content: "Completed, outstanding, overdue and unverified items per project.",
      },
    ],
  }),
  component: Reports,
});

function Reports() {
  const { projects, requirements, tasks } = useStore();
  const [pid, setPid] = useState("all");
  const reqs = requirements.filter((r) => pid === "all" || r.projectId === pid);
  const s = summarize(
    reqs,
    tasks.filter((t) => pid === "all" || t.projectId === pid),
  );
  const verified = reqs.filter((r) => r.lastVerified && r.status === "Approved").length;

  return (
    <>
      <PageHeader
        title="Reports"
        description="Project summary based on fictional data."
        action={
          <Select value={pid} onValueChange={setPid}>
            <SelectTrigger className="sm:w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All projects</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Completed" value={s.complete} hint="Approved or not applicable" />
        <StatCard label="Outstanding" value={s.outstanding} />
        <StatCard label="Overdue" value={s.overdueReqs} tone="danger" />
        <StatCard
          label="Unverified"
          value={s.unverified}
          tone="warning"
          hint="No verification date or under review"
        />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Workflow progress">
          <ProgressBar value={s.progress} />
          <p className="mt-3 text-sm text-muted-foreground">
            How far the team has moved items through the internal workflow. This is a tracking
            measure, not a statement of compliance.
          </p>
        </Panel>
        <Panel title="Human-verified items">
          <p className="font-mono text-3xl font-semibold">
            {verified} <span className="text-base text-muted-foreground">/ {s.total}</span>
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Items recorded as approved and with a verification date entered by a person. Legal
            compliance can only be confirmed by a qualified professional against official sources.
          </p>
        </Panel>
      </div>
      <div className="mt-6">
        <VerificationNotice />
      </div>
    </>
  );
}
