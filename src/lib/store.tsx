// In-memory demo store. Data access is isolated in repository.ts and
// business logic in workflow.ts / validation.ts, so a future Supabase
// backend can replace the repository without rewriting pages.
// Demo memory only: refreshing restores the original fixtures.
import { createContext, useContext, useState, type ReactNode } from "react";
import * as demo from "./demo-data";
import type { Project, ReqStatus, TaskStatus, Approval, DocumentRecord } from "./demo-data";
import { createProjectBundle, type ProjectInput } from "./workflow";
import { documentMetadataSchema, parseOrThrow } from "./validation";
import { validLocation } from "./locations";
import { loadInitialState, type DemoState } from "./repository";
import { makeActivityEvent, type ActivityEventType, type ActivityEntityType } from "./activity";

type State = DemoState;

interface DocumentMetadataInput {
  name: string;
  projectId: string;
  requirementId: string;
  version: string;
  status: DocumentRecord["status"];
  reviewDate: string | null;
}

interface Store extends State {
  addProject: (p: ProjectInput) => Project;
  updateProjectLocation: (
    id: string,
    location: string,
    talukaId: string,
    villageId: string,
  ) => void;
  setApplicationStatus: (id: string, status: Approval["status"]) => void;
  setTaskStatus: (id: string, status: TaskStatus) => void;
  setTaskResponsible: (id: string, responsible: string) => void;
  setTaskDueDate: (id: string, date: string) => void;
  setRequirementStatus: (id: string, status: ReqStatus) => void;
  setRequirementResponsible: (id: string, responsible: string) => void;
  registerDocument: (input: DocumentMetadataInput) => DocumentRecord;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(loadInitialState);

  // Every mutation appends one typed activity event in the same transition.
  const withEvent = (
    s: State,
    event: { type: ActivityEventType; projectId: string; entityType: ActivityEntityType; entityId: string; text: string },
  ): State => ({ ...s, activity: [makeActivityEvent(event), ...s.activity] });

  const updateTask = (
    id: string,
    patch: Partial<demo.Task>,
    event: { type: ActivityEventType; text: string },
  ) =>
    setState((s) => {
      const task = s.tasks.find((t) => t.id === id);
      if (!task) return s;
      return withEvent(
        { ...s, tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) },
        { ...event, projectId: task.projectId, entityType: "task", entityId: id },
      );
    });

  const updateRequirement = (
    id: string,
    patch: Partial<demo.Requirement>,
    event: { type: ActivityEventType; text: string },
  ) =>
    setState((s) => {
      const req = s.requirements.find((r) => r.id === id);
      if (!req) return s;
      return withEvent(
        { ...s, requirements: s.requirements.map((r) => (r.id === id ? { ...r, ...patch } : r)) },
        { ...event, projectId: req.projectId, entityType: "requirement", entityId: id },
      );
    });

  const value: Store = {
    ...state,
    addProject: (input) => {
      // Validation happens inside createProjectBundle, before any state change.
      const bundle = createProjectBundle(input, `p-${crypto.randomUUID()}`);
      setState((s) =>
        withEvent(
          {
            ...s,
            projects: [bundle.project, ...s.projects],
            requirements: [...s.requirements, ...bundle.requirements],
            tasks: [...s.tasks, ...bundle.tasks],
          },
          {
            type: "project.created",
            projectId: bundle.project.id,
            entityType: "project",
            entityId: bundle.project.id,
            text: `Project "${bundle.project.name}" created with ${bundle.requirements.length} fictional checklist items`,
          },
        ),
      );
      return bundle.project;
    },
    updateProjectLocation: (id, location, talukaId, villageId) => {
      if (!location.trim() || !validLocation(talukaId, villageId))
        throw new Error("Select a valid demo Taluka and Village, and enter a location.");
      setState((s) =>
        withEvent(
          {
            ...s,
            projects: s.projects.map((p) =>
              p.id === id ? { ...p, location: location.trim(), talukaId, villageId } : p,
            ),
          },
          {
            type: "project.location_updated",
            projectId: id,
            entityType: "project",
            entityId: id,
            text: "Project location updated (fictional demo selections)",
          },
        ),
      );
    },
    setApplicationStatus: (id, status) =>
      setState((s) => {
        const application = s.approvals.find((a) => a.id === id);
        if (application)
          return withEvent(
            { ...s, approvals: s.approvals.map((a) => (a.id === id ? { ...a, status } : a)) },
            {
              type: "approval.status_updated",
              projectId: application.projectId,
              entityType: "approval",
              entityId: id,
              text: `Application ${application.reference} workflow status set to ${status}`,
            },
          );
        const project = s.projects.find((p) => p.id === id);
        if (!project) return s;
        return withEvent(
          {
            ...s,
            projects: s.projects.map((p) => (p.id === id ? { ...p, workflowStatus: status } : p)),
          },
          {
            type: "approval.status_updated",
            projectId: id,
            entityType: "project",
            entityId: id,
            text: `Project application-tracking status set to ${status}`,
          },
        );
      }),
    setTaskStatus: (id, status) =>
      updateTask(id, { status }, { type: "task.status_updated", text: `set to ${status}` }),
    setTaskResponsible: (id, responsible) =>
      updateTask(id, { responsible }, {
        type: "task.responsibility_changed",
        text: `reassigned to ${responsible}`,
      }),
    setTaskDueDate: (id, dueDate) =>
      updateTask(id, { dueDate }, {
        type: "task.deadline_changed",
        text: `target date set to ${dueDate || "Not set"}`,
      }),
    setRequirementStatus: (id, status) =>
      updateRequirement(id, { status }, {
        type: "requirement.status_updated",
        text: `workflow status set to ${status} (workflow only, not legal compliance)`,
      }),
    setRequirementResponsible: (id, responsible) =>
      updateRequirement(id, { responsible }, {
        type: "requirement.responsibility_changed",
        text: `reassigned to ${responsible}`,
      }),
    registerDocument: (rawInput) => {
      // Metadata registration only — no file is uploaded or stored.
      const input = parseOrThrow(documentMetadataSchema, rawInput);
      const record: DocumentRecord = {
        id: `d-${crypto.randomUUID()}`,
        name: input.name.trim(),
        fileName: input.name.trim(),
        storagePath: null,
        mimeType: null,
        fileSizeBytes: null,
        uploaderUserId: null,
        requirementId: input.requirementId,
        projectId: input.projectId,
        version: input.version.trim(),
        status: input.status,
        uploadedAt: new Date().toISOString().slice(0, 10),
        dateAdded: new Date().toISOString().slice(0, 10),
        reviewDate: input.reviewDate,
      };
      setState((s) =>
        withEvent(
          { ...s, documents: [record, ...s.documents] },
          {
            type: "document.registered",
            projectId: record.projectId,
            entityType: "document",
            entityId: record.id,
            text: `Document metadata "${record.name}" registered (no file stored)`,
          },
        ),
      );
      return record;
    },
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore must be used inside StoreProvider");
  return s;
}
