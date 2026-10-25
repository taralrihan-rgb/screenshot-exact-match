import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useStore } from "@/lib/store";
import { summarize, formatDate, isOverdue } from "@/lib/metrics";
import { PageHeader, Panel, StatCard, StatusBadge, ProgressBar, EmptyState, VerificationNotice } from "@/components/app/ui-bits";
import { RequirementsTable } from "@/components/app/requirements-table";
import { PreApprovalWorkflow } from "@/components/app/pre-approval-workflow";
import { EditProjectLocation } from "@/components/app/edit-project-location";
import { locationNames } from "@/lib/locations";
import { APPLICATION_STATUSES, applicationRows } from "@/lib/workflow";
import { CHECKLIST_TEMPLATES, type Approval } from "@/lib/demo-data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/projects/$projectId")({
  head: () => ({
    meta: [
      { title: "Project details — ClearTrack demo" },
      { name: "description", content: "Project overview, requirements summary, outstanding actions and activity." },
      { property: "og:title", content: "Project details — ClearTrack demo" },
      { property: "og:description", content: "Project overview, requirements and outstanding actions." },
    ],
  }),
  component: ProjectDetail,
});

function ProjectDetail() {
  const { projectId } = Route.useParams();
  const { projects, requirements, tasks, activity, approvals, setApplicationStatus } = useStore();
  const p = projects.find((x) => x.id === projectId);

  if (!p) {
    return (
      <div className="py-10">
        <EmptyState title="Project not found" hint="It may have been created in an earlier session (demo data resets on reload)." />
        <Link to="/projects" className="mt-4 block text-center text-sm text-primary hover:underline">Back to projects</Link>
      </div>
    );
  }

  const reqs = requirements.filter((r) => r.projectId === p.id);
  const ptasks = tasks.filter((t) => t.projectId === p.id);
  const open = ptasks.filter((t) => t.status !== "Completed");
  const s = summarize(reqs, ptasks);

  return (
    <>
      <Link to="/projects" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />Projects</Link>
      <PageHeader title={p.name} description={`${p.location} · ${p.type}`} action={<div className="flex gap-1"><StatusBadge value={p.stage} /><StatusBadge value={p.status} /></div>} />

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Overview" className="lg:col-span-2">
          <p className="text-sm text-muted-foreground">{p.description}</p>
          <dl className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            <div><dt className="text-xs text-muted-foreground">Location</dt><dd>{p.location}</dd></div>
            <div><dt className="text-xs text-muted-foreground">Type</dt><dd>{p.type}</dd></div>
            <div><dt className="text-xs text-muted-foreground">Stage</dt><dd>{p.stage}</dd></div>
            <div><dt className="text-xs text-muted-foreground">Team</dt><dd>{p.team.join(", ")}</dd></div>
            <div><dt className="text-xs text-muted-foreground">Taluka</dt><dd>{locationNames(p.talukaId, p.villageId).taluka}</dd></div>
            <div><dt className="text-xs text-muted-foreground">Village</dt><dd>{locationNames(p.talukaId, p.villageId).village}</dd></div>
            <div><dt className="text-xs text-muted-foreground">District (from selection)</dt><dd>{locationNames(p.talukaId, p.villageId).district}</dd></div>
          </dl>
          <div className="mt-3"><EditProjectLocation project={p} /></div>
          <div className="mt-4"><p className="mb-1 text-xs text-muted-foreground">Workflow progress (not legal compliance)</p><ProgressBar value={s.progress} /></div>
        </Panel>
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Complete" value={s.complete} />
          <StatCard label="Outstanding" value={s.outstanding} />
          <StatCard label="Overdue" value={s.overdueReqs} tone="danger" />
          <StatCard label="Unverified" value={s.unverified} tone="warning" />
        </div>
      </div>

      <section className="mt-6">
        <h2 className="mb-2 text-sm font-semibold">Application workflow tracking</h2>
        {applicationRows(projects, approvals).filter((r) => r.projectId === p.id).map((r) => <div key={r.id} className="mb-2 flex flex-wrap items-center gap-3 text-sm">
          <span>{r.kind === "application" ? r.label : "Project tracking only — no application reference"}</span>
          <Select value={r.rawStatus} onValueChange={(v) => setApplicationStatus(r.id, v as Approval["status"])}><SelectTrigger className="w-60" aria-label={`Application status for ${r.label}`}><SelectValue /></SelectTrigger><SelectContent>{[...new Set([r.rawStatus, ...APPLICATION_STATUSES])].map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent></Select>
        </div>)}
      </section>
      {p.stage === "Pre-approval" && <PreApprovalWorkflow projectId={p.id} />}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Outstanding actions">
          {open.length === 0 ? <EmptyState title="No open actions" /> : (
            <ul className="divide-y">
              {open.map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                  <span>{t.title}<span className="block text-xs text-muted-foreground">{t.responsible}</span></span>
                  <span className="flex items-center gap-2">
                    {t.status === "Blocked" && <StatusBadge value="Blocked" />}
                    {isOverdue(t.dueDate, false) && <StatusBadge value="Overdue" />}
                    <span className="font-mono text-xs">{formatDate(t.dueDate)}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel title="Recent activity">
          {activity.filter((a) => a.projectId === p.id).length === 0 ? <EmptyState title="No activity yet" /> : (
            <ul className="divide-y">
              {activity.filter((a) => a.projectId === p.id).map((a) => (
                <li key={a.id} className="py-2 text-sm">{a.text}<span className="block text-xs text-muted-foreground">{a.who} · {formatDate(a.when)}</span></li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <section className="mt-6">
        <h2 className="mb-3 text-sm font-semibold">Requirements</h2>
        <div className="mb-3"><VerificationNotice /></div>
        {reqs.length === 0 ? <EmptyState title={CHECKLIST_TEMPLATES[p.type] ? "No requirements added" : "Checklist needs configuration"} hint={CHECKLIST_TEMPLATES[p.type] ? "Existing records are not regenerated. Requirements need professional review." : `No checklist template is configured for ${p.type}. No requirements have been invented.`} /> : <RequirementsTable rows={reqs} />}
      </section>
    </>
  );
}
