import { COMPLETE_STATUSES, DEMO_TODAY, type Requirement, type Task } from "./demo-data";

export const isOverdue = (date: string, done: boolean) => Boolean(date) && !done && date < DEMO_TODAY;

export function daysFromToday(date: string) {
  return Math.round((new Date(date).getTime() - new Date(DEMO_TODAY).getTime()) / 86400000);
}

export function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

/** Workflow progress only — NOT legal compliance. */
export function summarize(reqs: Requirement[], tasks: Task[]) {
  const complete = reqs.filter((r) => COMPLETE_STATUSES.includes(r.status)).length;
  const outstanding = reqs.length - complete;
  const overdueReqs = reqs.filter((r) => isOverdue(r.dueDate, COMPLETE_STATUSES.includes(r.status))).length;
  const overdueTasks = tasks.filter((t) => isOverdue(t.dueDate, t.status === "Completed")).length;
  const unverified = reqs.filter((r) => !r.lastVerified || r.status === "Needs verification" || r.applicability === "Needs review").length;
  const progress = reqs.length ? Math.round((complete / reqs.length) * 100) : 0;
  return { total: reqs.length, complete, outstanding, overdueReqs, overdueTasks, unverified, progress };
}
