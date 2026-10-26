import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { TEAM } from "@/lib/demo-data";
import { formatDate, isOverdue } from "@/lib/metrics";
import { PageHeader, StatusBadge, EmptyState } from "@/components/app/ui-bits";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "Tasks & deadlines — ClearTrack demo" },
      { name: "description", content: "Who needs to act and by when — tasks linked to projects and requirements." },
      { property: "og:title", content: "Tasks & deadlines — ClearTrack demo" },
      { property: "og:description", content: "Tasks linked to projects and requirements, with deadlines." },
    ],
  }),
  component: Tasks,
});

function Tasks() {
  const { tasks, projects, requirements, setTaskStatus, setTaskResponsible } = useStore();
  const [status, setStatus] = useState("open");
  const [person, setPerson] = useState("all");
  const [priority, setPriority] = useState("all");
  const [project, setProject] = useState("all");

  const rows = tasks
    .filter((t) =>
      (status === "all" || (status === "open" ? t.status !== "Completed" : status === "overdue" ? isOverdue(t.dueDate, t.status === "Completed") : t.status === "Completed")) &&
      (person === "all" || t.responsible === person) &&
      (priority === "all" || t.priority === priority) &&
      (project === "all" || t.projectId === project),
    )
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const toggle = (id: string, done: boolean) => {
    setTaskStatus(id, done ? "Completed" : "Open");
    toast.success(done ? "Task marked complete (demo session only)." : "Task reopened (demo session only).");
  };

  const reassign = (id: string, who: string) => {
    setTaskResponsible(id, who);
    toast.success("Task reassigned (demo session only).");
  };

  return (
    <>
      <PageHeader title="Tasks & deadlines" description="Tick a task to mark it complete. Changes last until you reload." />
      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="sm:w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="done">Completed</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
        <Select value={person} onValueChange={setPerson}>
          <SelectTrigger className="sm:w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Everyone</SelectItem>
            {TEAM.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={priority} onValueChange={setPriority}>
          <SelectTrigger className="sm:w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any priority</SelectItem>
            <SelectItem value="High">High</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select value={project} onValueChange={setProject}>
          <SelectTrigger className="sm:w-64"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All projects</SelectItem>
            {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {rows.length === 0 ? <EmptyState title="No tasks match these filters" hint="All clear for this view." /> : (
        <ul className="grid gap-2">
          {rows.map((t) => {
            const done = t.status === "Completed";
            return (
              <li key={t.id} className="flex flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-center">
                <div className="flex flex-1 items-start gap-3">
                  <Checkbox className="mt-0.5" checked={done} onCheckedChange={(v) => toggle(t.id, v === true)} aria-label={`Mark "${t.title}" complete`} />
                  <div>
                    <p className={done ? "text-sm text-muted-foreground line-through" : "text-sm font-medium"}>{t.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {projects.find((p) => p.id === t.projectId)?.name} · {t.workflowStep !== undefined ? "Pre-Approval workflow" : requirements.find((r) => r.id === t.requirementId)?.name}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 pl-7 sm:pl-0">
                  <Select value={t.responsible} onValueChange={(v) => reassign(t.id, v)}>
                    <SelectTrigger className="h-8 w-40" aria-label={`Responsible person for ${t.title}`}><SelectValue /></SelectTrigger>
                    <SelectContent>{TEAM.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                  </Select>
                  <StatusBadge value={t.priority} />
                  <StatusBadge value={t.status} />
                  {isOverdue(t.dueDate, done) && <StatusBadge value="Overdue" />}
                  <span className="font-mono text-xs">{formatDate(t.dueDate)}</span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
