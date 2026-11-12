import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StoreProvider, useStore } from "@/lib/store";
import { DEMO_ORGANISATION, DEMO_SESSION_USER } from "@/lib/types";

const input = {
  name: "Activity test project",
  location: "Fictional location",
  type: "Residential",
  stage: "Pre-approval" as const,
  owner: "Ananya Rao",
  description: "Fictional",
  talukaId: "test-north",
  villageId: "test-greens",
};

describe("Activity event logging", () => {
  it("logs a typed project.created event with actor, org and real timestamp", () => {
    const { result } = renderHook(useStore, { wrapper: StoreProvider });
    let id = "";
    act(() => {
      id = result.current.addProject(input).id;
    });
    const event = result.current.activity[0];
    expect(event?.type).toBe("project.created");
    expect(event?.entityType).toBe("project");
    expect(event?.entityId).toBe(id);
    expect(event?.projectId).toBe(id);
    expect(event?.organisationId).toBe(DEMO_ORGANISATION.id);
    expect(event?.actorUserId).toBe(DEMO_SESSION_USER.id);
    expect(event?.who).toBe(DEMO_SESSION_USER.displayName);
    expect(Number.isNaN(Date.parse(event?.timestamp ?? ""))).toBe(false);
  });
  it("logs task completion and reopening as task.status_updated events", () => {
    const { result } = renderHook(useStore, { wrapper: StoreProvider });
    act(() => result.current.setTaskStatus("t1", "Completed"));
    expect(result.current.activity[0]?.type).toBe("task.status_updated");
    expect(result.current.activity[0]?.entityId).toBe("t1");
    expect(result.current.activity[0]?.text).toContain("Completed");
    act(() => result.current.setTaskStatus("t1", "Open"));
    expect(result.current.activity[0]?.text).toContain("Open");
  });
  it("logs reassignment, deadline, requirement and approval events with entity IDs", () => {
    const { result } = renderHook(useStore, { wrapper: StoreProvider });
    act(() => result.current.setTaskResponsible("t1", "Priya Nair"));
    expect(result.current.activity[0]?.type).toBe("task.responsibility_changed");
    act(() => result.current.setTaskDueDate("t1", "2026-12-01"));
    expect(result.current.activity[0]?.type).toBe("task.deadline_changed");
    act(() => result.current.setRequirementStatus("r1", "In progress"));
    expect(result.current.activity[0]?.type).toBe("requirement.status_updated");
    expect(result.current.activity[0]?.entityId).toBe("r1");
    act(() => result.current.setRequirementResponsible("r1", "Vikram Mehta"));
    expect(result.current.activity[0]?.type).toBe("requirement.responsibility_changed");
    act(() => result.current.setApplicationStatus("a1", "Rejected"));
    expect(result.current.activity[0]?.type).toBe("approval.status_updated");
    expect(result.current.activity[0]?.entityId).toBe("a1");
  });
  it("registers document metadata only — no storage path — and logs it", () => {
    const { result } = renderHook(useStore, { wrapper: StoreProvider });
    let docId = "";
    act(() => {
      docId = result.current.registerDocument({
        name: "Fictional_Test_Doc.pdf",
        projectId: "p1",
        requirementId: "r1",
        version: "v1",
        status: "Pending",
        reviewDate: null,
      }).id;
    });
    const doc = result.current.documents.find((d) => d.id === docId);
    expect(doc?.storagePath).toBeNull();
    expect(doc?.fileSizeBytes).toBeNull();
    expect(doc?.registeredAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(doc?.uploadedAt).toBeNull();
    expect(result.current.activity[0]?.type).toBe("document.registered");
    expect(result.current.activity[0]?.entityId).toBe(docId);
  });
  it("rejects invalid document metadata without changing state", () => {
    const { result } = renderHook(useStore, { wrapper: StoreProvider });
    const docs = result.current.documents;
    expect(() =>
      result.current.registerDocument({
        name: "x",
        projectId: "p1",
        requirementId: "",
        version: "v1",
        status: "Pending",
        reviewDate: null,
      }),
    ).toThrow();
    expect(result.current.documents).toBe(docs);
  });
});
