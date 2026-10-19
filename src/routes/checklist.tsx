import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "@/lib/store";
import type { ReqStatus } from "@/lib/demo-data";
import { PageHeader, VerificationNotice, EmptyState } from "@/components/app/ui-bits";
import { RequirementsTable } from "@/components/app/requirements-table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STATUSES: ReqStatus[] = ["Not started", "In progress", "Submitted", "Changes requested", "Approved", "Not applicable", "Needs verification"];

export const Route = createFileRoute("/checklist")({
  head: () => ({
    meta: [
      { title: "Compliance checklist — ClearTrack demo" },
      { name: "description", content: "Illustrative requirement checklist with status, evidence and source references." },
      { property: "og:title", content: "Compliance checklist — ClearTrack demo" },
      { property: "og:description", content: "Illustrative requirement checklist with evidence and verification." },
    ],
  }),
  component: Checklist,
});

function Checklist() {
  const { requirements, projects } = useStore();
  const [project, setProject] = useState("all");
  const [status, setStatus] = useState("all");
  const rows = requirements.filter((r) => (project === "all" || r.projectId === project) && (status === "all" || r.status === status));

  return (
    <>
      <PageHeader title="Compliance checklist" description="Illustrative example requirements — not actual legal requirements." />
      <div className="mb-4"><VerificationNotice /></div>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <Select value={project} onValueChange={setProject}>
          <SelectTrigger className="sm:w-64"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All projects</SelectItem>
            {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="sm:w-56"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      {rows.length === 0 ? <EmptyState title="No requirements match these filters" /> : <RequirementsTable rows={rows} showProject />}
      <p className="mt-3 text-xs text-muted-foreground">"Approved" reflects a recorded workflow status only. No item is automatically treated as legally satisfied.</p>
    </>
  );
}
