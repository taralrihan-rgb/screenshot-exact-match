import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useStore } from "@/lib/store";
import { summarize, formatDate, isOverdue } from "@/lib/metrics";
import { PageHeader, Panel, StatCard, StatusBadge, ProgressBar, EmptyState, VerificationNotice } from "@/components/app/ui-bits";
import { RequirementsTable } from "@/components/app/requirements-table";

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
  const { projects, requirements, tasks, activity } = useStore();
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
          </dl>
          <div className="mt-4"><p className="mb-1 text-xs text-muted-foreground">Workflow progress (not legal compliance)</p><ProgressBar value={s.progress} /></div>
        </Panel>
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Complete" value={s.complete} />
          <StatCard label="Outstanding" value={s.outstanding} />
          <StatCard label="Overdue" value={s.overdueReqs} tone="danger" />
          <StatCard label="Unverified" value={s.unverified} tone="warning" />
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Outstanding actions">
          {open.length === 0 ? <EmptyState title="No open actions" /> : (
            <ul className="divide-y">
              {open.map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                  <span>{t.title}<span className="block text-xs text-muted-foreground">{t.responsible}</span></span>
                  <span className="flex items-center gap-2">
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
        {reqs.length === 0 ? <EmptyState title="No requirements added" hint="Applicability is never inferred automatically — add requirements after professional review." /> : <RequirementsTable rows={reqs} />}
      </section>
    </>
  );
}
