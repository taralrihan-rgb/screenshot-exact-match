import { describe, expect, it } from "vitest";
import {
  applicationRows,
  createProjectBundle,
  mappedStatus,
  preApprovalTasks,
  stepProgress,
  APPLICATION_STATUSES,
} from "@/lib/workflow";
import {
  LOCATION_DATA,
  searchTalukas,
  searchVillages,
  validLocation,
  type LocationDataset,
} from "@/lib/locations";
import { projects, approvals, type Project } from "@/lib/demo-data";
import { isOverdue, summarize } from "@/lib/metrics";
const input = {
  name: "Pilot test project",
  location: "Fictional site",
  type: "Residential",
  stage: "Pre-approval" as const,
  owner: "Ananya Rao",
  description: "Fictional",
  talukaId: "test-north",
  villageId: "test-greens",
};
describe("Pilot creation and checklist rules", () => {
  it("generates the residential template once with unique pending unverified items", () => {
    const bundle = createProjectBundle(input, "new");
    expect(bundle.requirements).toHaveLength(2);
    expect(new Set(bundle.requirements.map((r) => r.id)).size).toBe(2);
    expect(bundle.requirements.map((r) => [r.status, r.applicability, r.lastVerified])).toEqual([
      ["Needs verification", "Needs review", null],
      ["Needs verification", "Needs review", null],
    ]);
    expect(summarize(bundle.requirements, bundle.tasks).outstanding).toBe(2);
    expect(bundle.project.talukaId).toBe("test-north");
    expect(bundle.project.villageId).toBe("test-greens");
  });
  it("does not invent a checklist for an unconfigured type", () =>
    expect(createProjectBundle({ ...input, type: "Mixed-use" }, "mixed").requirements).toHaveLength(
      0,
    ));
  it("uses distinct templates for different project types", () => {
    expect(
      createProjectBundle({ ...input, type: "Commercial" }, "c").requirements.map(
        (r) => r.templateKey,
      ),
    ).toEqual(["title", "zoning"]);
    expect(
      createProjectBundle({ ...input, type: "Plotted development" }, "p").requirements.map(
        (r) => r.templateKey,
      ),
    ).toEqual(["layout", "drainage"]);
  });
  it("rejects invalid required project fields before producing a bundle", () => {
    for (const patch of [
      { name: "x" },
      { location: " " },
      { owner: "Unknown" },
      { type: "Unknown" },
      { villageId: "test-courtyard" },
      { stage: "Invalid" },
    ])
      expect(() => createProjectBundle({ ...input, ...patch } as typeof input, "bad")).toThrow();
  });
  it("never infers overdue from an unset target", () => expect(isOverdue("", false)).toBe(false));
});
describe("Pre-Approval rules", () => {
  it("creates exactly the four ordered tracking steps, none completed", () => {
    const bundle = createProjectBundle(input, "steps");
    expect(bundle.tasks.map((t) => t.title)).toEqual([
      "Engineer Drawing",
      "Tracing",
      "DSC on Application Form and Documents",
      "Pre-Payment",
    ]);
    expect(
      bundle.tasks.every(
        (t) => t.status === "Open" && t.responsible === "Ananya Rao" && t.dueDate === "",
      ),
    ).toBe(true);
    expect(stepProgress(bundle.tasks)).toBe(0);
  });
  it("calculates progress from completed steps only, not blocked steps", () => {
    const tasks = createProjectBundle(input, "progress").tasks;
    tasks[0] = { ...tasks[0], status: "Completed" } as (typeof tasks)[number];
    tasks[1] = { ...tasks[1], status: "Blocked" } as (typeof tasks)[number];
    expect(stepProgress(tasks)).toBe(25);
  });
  it("does not force later stage projects into Pre-Approval", () =>
    expect(
      preApprovalTasks({
        ...input,
        id: "later",
        stage: "Construction",
        status: "Active",
        team: [input.owner],
      } as Project),
    ).toHaveLength(0));
});
describe("Administrative suggestions", () => {
  it("searches case-insensitive partial names and normalizes spaces", () =>
    expect(searchTalukas("  TEST   TALUKA nORTH ").map((t) => t.id)).toEqual(["test-north"]));
  it("restricts villages to their selected taluka", () => {
    expect(searchVillages("test", "test-north").map((v) => v.id)).toEqual([
      "test-greens",
      "test-lake",
    ]);
    expect(validLocation("test-north", "test-courtyard")).toBe(false);
  });
  it("handles empty data and no-match searches safely", () => {
    const empty: LocationDataset = { ...LOCATION_DATA, districts: [], talukas: [], villages: [] };
    expect(searchTalukas("", undefined, empty)).toEqual([]);
    expect(searchVillages("", "test-north", empty)).toEqual([]);
    expect(searchTalukas("does not exist")).toEqual([]);
  });
  it("filters by linked district and rejects outside-Maharashtra data", () => {
    expect(searchTalukas("", "unknown")).toEqual([]);
    const outside = {
      ...LOCATION_DATA,
      districts: [{ ...LOCATION_DATA.districts[0], state: "Karnataka" }],
    } as unknown as LocationDataset;
    expect(searchTalukas("", undefined, outside)).toEqual([]);
  });
});
describe("Application mapping", () => {
  it("keeps Rejected and Rejected Proposal separate", () => {
    expect(mappedStatus("Rejected")).toBe("Rejected");
    expect(mappedStatus("Rejected Proposal")).toBe("Rejected Proposal");
  });
  it("maps only known equivalents and leaves unknown values unmapped", () => {
    expect(mappedStatus("Under review")).toBe("In Process");
    for (const status of [
      undefined,
      "Mystery",
      "Draft",
      "Submitted",
      "Query raised",
      "Granted (recorded)",
    ])
      expect(mappedStatus(status)).toBe("Unmapped");
  });
  it("counts and filters the same records for each status without double counting projects", () => {
    const records = applicationRows(projects, approvals);
    expect(records).toHaveLength(7);
    expect(records.filter((r) => r.status === "In Process")).toHaveLength(1);
    for (const status of APPLICATION_STATUSES)
      expect(records.filter((r) => r.status === status).length).toBe(
        status === "In Process" ? 1 : 0,
      );
    const changed = applicationRows(
      projects,
      approvals.map((a) => (a.id === "a1" ? { ...a, status: "Rejected" as const } : a)),
    );
    expect(changed.filter((r) => r.status === "Rejected")).toHaveLength(1);
    expect(changed.filter((r) => r.status === "In Process")).toHaveLength(0);
  });
});
