import { describe, it, expect } from "vitest";
import { createProjectBundle } from "@/lib/workflow";
import { CHECKLIST_TEMPLATES, projects } from "@/lib/demo-data";

const base = projects.find((p) => p.talukaId && p.villageId)!;
const input = { ...base, name: "Gen test", stage: "Feasibility" } as any;

describe("checklist generation", () => {
  it("creates template items with pending/unverified status and unique ids", () => {
    const b = createProjectBundle({ ...input, type: "Residential" }, "p-x");
    expect(b.requirements.length).toBeGreaterThan(0);
    expect(b.requirements.every((r) => r.status === "Needs verification" && r.applicability === "Needs review")).toBe(true);
    expect(new Set(b.requirements.map((r) => r.id)).size).toBe(b.requirements.length);
  });
  it("creates no items for an unconfigured type", () => {
    expect(CHECKLIST_TEMPLATES["Mixed-use"]).toBeUndefined();
    expect(createProjectBundle({ ...input, type: "Mixed-use" }, "p-y").requirements).toEqual([]);
  });
});
