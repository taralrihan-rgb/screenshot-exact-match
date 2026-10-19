import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { summarize, isOverdue, daysFromToday, formatDate } from "@/lib/metrics";
import { COMPLETE_STATUSES } from "@/lib/demo-data";
import { PageHeader, StatCard, Panel, StatusBadge, VerificationNotice, EmptyState } from "@/components/app/ui-bits";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — ClearTrack demo" },
      { name: "description", content: "Overview of active projects, outstanding requirements, overdue tasks and upcoming deadlines." },
      { property: "og:title", content: "Dashboard — ClearTrack demo" },
      { property: "og:description", content: "Overview of active projects, outstanding requirements and deadlines." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { projects, requirements, tasks, activity } = useStore();
  const s = summarize(requirements, tasks);
  const active = projects.filter((p) => p.status === "Active").length;
  const pname = (id: string) => projects.find((p) => p.id === id)?.name ?? "—";

  const upcoming = tasks
    .filter((t) => t.status !== "Completed" && daysFromToday(t.dueDate) >= 0 && daysFromToday(t.dueDate) <= 14)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const attention = [
    ...tasks.filter((t) => isOverdue(t.dueDate, t.status === "Completed")).map((t) => ({ id: t.id, label: t.title, projectId: t.projectId, reason: "Overdue", date: t.dueDate, rank: 0 })),
    ...requirements.filter((r) => r.status === "Changes requested").map((r) => ({ id: r.id, label: r.name, projectId: r.projectId, reason: "Changes requested", date: r.dueDate, rank: 1 })),
    ...requirements.filter((r) => r.status === "Needs verification" && !COMPLETE_STATUSES.includes(r.status)).map((r) => ({ id: r.id, label: r.name, projectId: r.projectId, reason: "Needs verification", date: r.dueDate, rank: 2 })),
  ].sort((a, b) => a.rank - b.rank || a.date.localeCompare(b.date));

  return (
    <>
      <PageHeader title="Dashboard" description="Demonstration workspace — all figures are fictional." />
      <div className="mb-6"><VerificationNotice /></div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Active projects" value={active} />
        <StatCard label="Requirements complete" value={s.complete} hint={`of ${s.total} (workflow)`} />
        <StatCard label="Outstanding" value={s.outstanding} />
        <StatCard label="Overdue tasks" value={s.overdueTasks} tone="danger" />
        <StatCard label="Due in 14 days" value={upcoming.length} tone="warning" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Panel title="Needs attention" className="lg:col-span-2">
          {attention.length === 0 ? <EmptyState title="Nothing needs attention" /> : (
            <ul className="divide-y">
              {attention.map((a) => (
                <li key={a.reason + a.id} className="flex flex-wrap items-center gap-3 py-3">
                  <StatusBadge value={a.reason} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{a.label}</p>
                    <Link to="/projects/$projectId" params={{ projectId: a.projectId }} className="text-xs text-primary hover:underline">{pname(a.projectId)}</Link>
                  </div>
                  <span className="font-mono text-xs text-muted-foreground">{formatDate(a.date)}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel title="Upcoming deadlines">
          {upcoming.length === 0 ? <EmptyState title="No deadlines in the next 14 days" /> : (
            <ul className="space-y-3">
              {upcoming.map((t) => (
                <li key={t.id} className="text-sm">
                  <p className="font-medium">{t.title}</p>
                  <p className="text-xs text-muted-foreground">{t.responsible} · {formatDate(t.dueDate)} · in {daysFromToday(t.dueDate)}d</p>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Panel title="Recent activity" className="mt-6">
        <ul className="divide-y">
          {activity.slice(0, 6).map((a) => (
            <li key={a.id} className="flex flex-wrap justify-between gap-2 py-2 text-sm">
              <span>{a.text} <span className="text-muted-foreground">— {pname(a.projectId)}</span></span>
              <span className="text-xs text-muted-foreground">{a.who} · {formatDate(a.when)}</span>
            </li>
          ))}
        </ul>
      </Panel>
    </>
  );
}
