// Operational date calculations use the REAL current date, never a fixed
// demo date. All functions accept an optional `today` (YYYY-MM-DD) so tests
// can inject a fixed anchor. Dates are compared as UTC-midnight ISO days to
// keep parsing and timezone handling consistent.
import { COMPLETE_STATUSES, type Requirement, type Task } from "./demo-data";
import { isValidCalendarDate } from "./validation";

/** Current local date as YYYY-MM-DD (timezone-safe, no UTC shift). */
export function todayString(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function isValidDay(date: string): boolean {
  return isValidCalendarDate(date);
}

/** Overdue = has a valid deadline, not done, and the deadline is before today. */
export const isOverdue = (date: string, done: boolean, today: string = todayString()) =>
  isValidDay(date) && !done && date < today;

/** Whole days from today to the deadline. NaN for missing/invalid dates. */
export function daysFromToday(date: string, today: string = todayString()) {
  if (!isValidDay(date)) return Number.NaN;
  return Math.round(
    (Date.parse(`${date}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86400000,
  );
}

export function formatDate(d: string | null) {
  if (!d || !isValidDay(d)) return "—";
  return new Date(`${d}T00:00:00Z`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Workflow progress only — NOT legal compliance. */
export function summarize(reqs: Requirement[], tasks: Task[], today: string = todayString()) {
  const complete = reqs.filter((r) => COMPLETE_STATUSES.includes(r.status)).length;
  const outstanding = reqs.length - complete;
  const overdueReqs = reqs.filter((r) =>
    isOverdue(r.dueDate, COMPLETE_STATUSES.includes(r.status), today),
  ).length;
  const overdueTasks = tasks.filter((t) =>
    isOverdue(t.dueDate, t.status === "Completed", today),
  ).length;
  const unverified = reqs.filter(
    (r) =>
      !r.lastVerified || r.status === "Needs verification" || r.applicability === "Needs review",
  ).length;
  const progress = reqs.length ? Math.round((complete / reqs.length) * 100) : 0;
  return {
    total: reqs.length,
    complete,
    outstanding,
    overdueReqs,
    overdueTasks,
    unverified,
    progress,
  };
}
