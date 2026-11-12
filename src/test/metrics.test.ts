import { describe, expect, it } from "vitest";
import { daysFromToday, isOverdue, summarize, todayString } from "@/lib/metrics";
import type { Requirement, Task } from "@/lib/demo-data";

const TODAY = "2026-11-10";

const req = (over: Partial<Requirement>): Requirement => ({
  id: "x",
  projectId: "p",
  name: "x",
  category: "c",
  applicability: "Applicable",
  status: "In progress",
  responsible: "r",
  dueDate: "",
  evidence: "Not uploaded",
  sourceRef: "s",
  lastVerified: null,
  ...over,
});
const task = (over: Partial<Task>): Task => ({
  id: "x",
  title: "t",
  projectId: "p",
  requirementId: "",
  responsible: "r",
  dueDate: "",
  priority: "Medium",
  status: "Open",
  ...over,
});

describe("Overdue calculations use the real current date", () => {
  it("flags a past deadline as overdue and a future one as not", () => {
    expect(isOverdue("2026-11-09", false, TODAY)).toBe(true);
    expect(isOverdue("2026-11-10", false, TODAY)).toBe(false);
    expect(isOverdue("2026-11-11", false, TODAY)).toBe(false);
  });
  it("never flags completed work as overdue", () => {
    expect(isOverdue("2026-11-01", true, TODAY)).toBe(false);
  });
  it("handles missing and invalid dates safely", () => {
    expect(isOverdue("", false, TODAY)).toBe(false);
    expect(isOverdue("not-a-date", false, TODAY)).toBe(false);
    expect(Number.isNaN(daysFromToday("", TODAY))).toBe(true);
    expect(Number.isNaN(daysFromToday("garbage", TODAY))).toBe(true);
  });
  it("rejects impossible calendar days instead of normalizing them", () => {
    expect(isOverdue("2026-02-31", false, TODAY)).toBe(false);
    expect(isOverdue("2026-04-31", false, TODAY)).toBe(false);
    expect(Number.isNaN(daysFromToday("2026-02-31", TODAY))).toBe(true);
    expect(Number.isNaN(daysFromToday("2025-02-29", TODAY))).toBe(true);
    expect(daysFromToday("2028-02-29", "2028-02-28")).toBe(1);
  });
  it("counts upcoming days from the injected anchor", () => {
    expect(daysFromToday("2026-11-24", TODAY)).toBe(14);
    expect(daysFromToday("2026-11-10", TODAY)).toBe(0);
    expect(daysFromToday("2026-11-01", TODAY)).toBe(-9);
  });
  it("todayString returns a real YYYY-MM-DD date, not a fixed demo date", () => {
    expect(todayString(new Date(2026, 10, 10))).toBe("2026-11-10");
    expect(todayString()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
  it("summarize counts overdue tasks and requirements with the same rules", () => {
    const reqs = [
      req({ id: "a", dueDate: "2026-11-01" }), // overdue
      req({ id: "b", dueDate: "2026-11-01", status: "Approved" }), // complete, not overdue
      req({ id: "c", dueDate: "2026-12-01" }), // upcoming
      req({ id: "d" }), // no deadline
    ];
    const tasks = [
      task({ id: "a", dueDate: "2026-10-01" }), // overdue
      task({ id: "b", dueDate: "2026-10-01", status: "Completed" }), // done, not overdue
      task({ id: "c", dueDate: "2026-12-01" }),
    ];
    const s = summarize(reqs, tasks, TODAY);
    expect(s.overdueReqs).toBe(1);
    expect(s.overdueTasks).toBe(1);
    expect(s.complete).toBe(1);
    expect(s.outstanding).toBe(3);
  });
});
