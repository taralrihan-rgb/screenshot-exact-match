import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StoreProvider, useStore } from "@/lib/store";
import { applicationRows } from "@/lib/workflow";

const input = {
  name: "Store pilot example",
  location: "Fictional location",
  type: "Residential",
  stage: "Pre-approval" as const,
  owner: "Ananya Rao",
  description: "Fictional",
  talukaId: "test-north",
  villageId: "test-greens",
};
describe("Shared pilot store", () => {
  it("creates one project and exactly one checklist in the same transition", () => {
    const { result } = renderHook(useStore, { wrapper: StoreProvider });
    const before = result.current.projects.length;
    let id = "";
    act(() => {
      id = result.current.addProject(input).id;
    });
    expect(result.current.projects.length).toBe(before + 1);
    expect(result.current.requirements.filter((r) => r.projectId === id)).toHaveLength(2);
    expect(result.current.tasks.filter((t) => t.projectId === id)).toHaveLength(4);
    expect(result.current.activity.filter((a) => a.projectId === id)).toHaveLength(1);
  });
  it("preserves checklist IDs, assignment and progress during project location editing", () => {
    const { result } = renderHook(useStore, { wrapper: StoreProvider });
    let id = "";
    act(() => {
      id = result.current.addProject(input).id;
    });
    const req = result.current.requirements.find((r) => r.projectId === id);
    if (!req) throw new Error("Checklist was not generated");
    act(() => {
      result.current.setRequirementStatus(req.id, "Approved");
      result.current.setRequirementResponsible(req.id, "Priya Nair");
    });
    const existing = result.current.requirements.filter((r) => r.projectId === id);
    act(() =>
      result.current.updateProjectLocation(id, "Updated fictional site", "test-north", "test-lake"),
    );
    expect(result.current.requirements.filter((r) => r.projectId === id)).toEqual(existing);
    expect(result.current.projects.find((p) => p.id === id)?.villageId).toBe("test-lake");
    expect(result.current.requirements.find((r) => r.id === req.id)?.applicability).toBe(
      "Needs review",
    );
  });
  it("does not partially create a project if bundle validation fails", () => {
    const { result } = renderHook(useStore, { wrapper: StoreProvider });
    const projects = result.current.projects;
    const requirements = result.current.requirements;
    expect(() => result.current.addProject({ ...input, villageId: "invalid" })).toThrow();
    expect(result.current.projects).toBe(projects);
    expect(result.current.requirements).toBe(requirements);
  });
  it("propagates application changes to counts and logs", () => {
    const { result } = renderHook(useStore, { wrapper: StoreProvider });
    act(() => result.current.setApplicationStatus("a1", "Rejected Proposal"));
    expect(
      applicationRows(result.current.projects, result.current.approvals).filter(
        (r) => r.status === "Rejected Proposal",
      ),
    ).toHaveLength(1);
    expect(
      applicationRows(result.current.projects, result.current.approvals).filter(
        (r) => r.status === "In Process",
      ),
    ).toHaveLength(0);
    expect(result.current.activity[0]?.text).toContain("Rejected Proposal");
  });
});
