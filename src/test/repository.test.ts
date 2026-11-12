import { describe, expect, it, vi } from "vitest";
import { createDemoRepository } from "@/lib/repository";

const projectInput = {
  name: "Repository contract example",
  location: "Fictional location",
  type: "Residential",
  stage: "Pre-approval" as const,
  owner: "Ananya Rao",
  description: "Fictional",
  talukaId: "test-north",
  villageId: "test-greens",
};

const documentInput = {
  name: "Fictional_Test_Doc.pdf",
  projectId: "p1",
  requirementId: "r1",
  version: "v1",
  status: "Pending" as const,
  reviewDate: null,
};

describe("Typed demo repository", () => {
  it("exposes reads and mutations for every demo collection", () => {
    const repository = createDemoRepository();
    expect(repository.listProjects().length).toBeGreaterThan(0);
    expect(repository.listRequirements().length).toBeGreaterThan(0);
    expect(repository.listTasks().length).toBeGreaterThan(0);
    expect(repository.listApprovals().length).toBeGreaterThan(0);
    expect(repository.listDocuments().length).toBeGreaterThan(0);
    expect(repository.listActivity().length).toBeGreaterThan(0);

    const project = repository.createProject(projectInput);
    expect(repository.listProjects()[0]?.id).toBe(project.id);
    repository.updateProjectLocation(project.id, "Updated fictional site", "test-north", "test-lake");
    expect(repository.listProjects()[0]?.villageId).toBe("test-lake");

    repository.setRequirementStatus("r1", "In progress");
    repository.setRequirementResponsible("r1", "Priya Nair");
    expect(repository.listRequirements().find((item) => item.id === "r1")).toMatchObject({
      status: "In progress",
      responsible: "Priya Nair",
    });

    repository.setTaskStatus("t1", "Completed");
    repository.setTaskResponsible("t1", "Priya Nair");
    repository.setTaskDueDate("t1", "2026-12-01");
    expect(repository.listTasks().find((item) => item.id === "t1")).toMatchObject({
      status: "Completed",
      responsible: "Priya Nair",
      dueDate: "2026-12-01",
    });

    repository.setApplicationStatus("a1", "Rejected");
    expect(repository.listApprovals().find((item) => item.id === "a1")?.status).toBe("Rejected");

    const document = repository.registerDocument(documentInput);
    expect(repository.listDocuments()[0]?.id).toBe(document.id);
    const activity = repository.recordActivity({
      type: "document.updated",
      projectId: "p1",
      entityType: "document",
      entityId: document.id,
      text: "Fictional metadata reviewed",
    });
    expect(repository.listActivity()[0]?.id).toBe(activity.id);
  });

  it("notifies subscribers only after a committed mutation", () => {
    const repository = createDemoRepository();
    const listener = vi.fn();
    const unsubscribe = repository.subscribe(listener);
    repository.setTaskStatus("t1", "Completed");
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
    repository.setTaskStatus("t1", "Open");
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("rejects a cross-project requirement without changing state or notifying", () => {
    const repository = createDemoRepository();
    const before = repository.getSnapshot();
    const listener = vi.fn();
    repository.subscribe(listener);

    expect(() =>
      repository.registerDocument({ ...documentInput, projectId: "p1", requirementId: "r6" }),
    ).toThrow("The selected requirement does not belong to the selected project.");
    expect(repository.getSnapshot()).toBe(before);
    expect(listener).not.toHaveBeenCalled();
  });

  it("rejects unknown document references and impossible review dates atomically", () => {
    const repository = createDemoRepository();
    const before = repository.getSnapshot();
    for (const input of [
      { ...documentInput, projectId: "missing" },
      { ...documentInput, requirementId: "missing" },
      { ...documentInput, reviewDate: "2026-02-31" },
    ]) {
      expect(() => repository.registerDocument(input)).toThrow();
      expect(repository.getSnapshot()).toBe(before);
    }
  });

  it("separates registration dates from upload timestamps and never fabricates uploads", () => {
    const repository = createDemoRepository();
    expect(repository.listDocuments().every((item) => item.uploadedAt === null)).toBe(true);
    const document = repository.registerDocument(documentInput);
    expect(document.registeredAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(document.uploadedAt).toBeNull();
    expect(document.storagePath).toBeNull();
  });

  it("rejects impossible task deadlines without modifying the task", () => {
    const repository = createDemoRepository();
    const before = repository.getSnapshot();
    expect(() => repository.setTaskDueDate("t1", "2026-02-31")).toThrow(
      "Enter a valid calendar date.",
    );
    expect(repository.getSnapshot()).toBe(before);
  });
});
