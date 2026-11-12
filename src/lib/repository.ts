// Typed persistence boundary. UI components consume the store, which delegates
// every read and mutation to this contract; the demo adapter is memory-only.
import * as demo from "./demo-data";
import type {
  Activity,
  Approval,
  DocumentRecord,
  Project,
  ReqStatus,
  TaskStatus,
} from "./demo-data";
import { createProjectBundle, preApprovalTasks, type ProjectInput } from "./workflow";
import {
  documentMetadataSchema,
  parseOrThrow,
  taskDeadlineSchema,
  type DocumentMetadataInput,
} from "./validation";
import { validLocation } from "./locations";
import {
  makeActivityEvent,
  type ActivityEntityType,
  type ActivityEventInput,
  type ActivityEventType,
} from "./activity";

export type { DocumentMetadataInput } from "./validation";

export interface DemoState {
  projects: Project[];
  requirements: demo.Requirement[];
  tasks: demo.Task[];
  activity: Activity[];
  documents: DocumentRecord[];
  approvals: Approval[];
}

/** Persistence contract for the demo now and a future backend adapter later. */
export interface RealtifyRepository {
  getSnapshot: () => DemoState;
  subscribe: (listener: () => void) => () => void;
  listProjects: () => Project[];
  listRequirements: () => demo.Requirement[];
  listTasks: () => demo.Task[];
  listApprovals: () => Approval[];
  listDocuments: () => DocumentRecord[];
  listActivity: () => Activity[];
  createProject: (input: ProjectInput) => Project;
  updateProjectLocation: (
    id: string,
    location: string,
    talukaId: string,
    villageId: string,
  ) => void;
  setRequirementStatus: (id: string, status: ReqStatus) => void;
  setRequirementResponsible: (id: string, responsible: string) => void;
  setTaskStatus: (id: string, status: TaskStatus) => void;
  setTaskResponsible: (id: string, responsible: string) => void;
  setTaskDueDate: (id: string, date: string) => void;
  setApplicationStatus: (id: string, status: Approval["status"]) => void;
  registerDocument: (input: DocumentMetadataInput) => DocumentRecord;
  recordActivity: (input: ActivityEventInput) => Activity;
}

/** Fresh demo fixtures for each adapter instance. Refreshing restores fixtures. */
export function loadInitialState(): DemoState {
  return {
    projects: [...demo.projects],
    requirements: [...demo.requirements],
    tasks: [...demo.tasks, ...demo.projects.flatMap(preApprovalTasks)],
    activity: [...demo.activity],
    documents: [...demo.documents],
    approvals: [...demo.approvals],
  };
}

/** Synchronous in-memory demo adapter. No files, database or network are used. */
export function createDemoRepository(): RealtifyRepository {
  let state = loadInitialState();
  const listeners = new Set<() => void>();

  const commit = (next: DemoState, event?: ActivityEventInput): Activity | null => {
    const activityEvent = event ? makeActivityEvent(event) : null;
    state = activityEvent ? { ...next, activity: [activityEvent, ...next.activity] } : next;
    listeners.forEach((listener) => listener());
    return activityEvent;
  };

  const updateTask = (
    id: string,
    patch: Partial<demo.Task>,
    event: { type: ActivityEventType; text: string },
  ) => {
    const task = state.tasks.find((t) => t.id === id);
    if (!task) return;
    commit(
      { ...state, tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) },
      {
        ...event,
        projectId: task.projectId,
        entityType: "task",
        entityId: id,
        text: `Task "${task.title}" ${event.text}`,
      },
    );
  };

  const updateRequirement = (
    id: string,
    patch: Partial<demo.Requirement>,
    event: { type: ActivityEventType; text: string },
  ) => {
    const requirement = state.requirements.find((r) => r.id === id);
    if (!requirement) return;
    commit(
      {
        ...state,
        requirements: state.requirements.map((r) => (r.id === id ? { ...r, ...patch } : r)),
      },
      {
        ...event,
        projectId: requirement.projectId,
        entityType: "requirement",
        entityId: id,
        text: `Requirement "${requirement.name}" ${event.text}`,
      },
    );
  };

  return {
    getSnapshot: () => state,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    listProjects: () => state.projects,
    listRequirements: () => state.requirements,
    listTasks: () => state.tasks,
    listApprovals: () => state.approvals,
    listDocuments: () => state.documents,
    listActivity: () => state.activity,
    createProject: (input) => {
      // Validate and compute the complete bundle before changing any state.
      const bundle = createProjectBundle(input, `p-${crypto.randomUUID()}`);
      commit(
        {
          ...state,
          projects: [bundle.project, ...state.projects],
          requirements: [...state.requirements, ...bundle.requirements],
          tasks: [...state.tasks, ...bundle.tasks],
        },
        {
          type: "project.created",
          projectId: bundle.project.id,
          entityType: "project",
          entityId: bundle.project.id,
          text: `Project "${bundle.project.name}" created with ${bundle.requirements.length} fictional checklist items`,
        },
      );
      return bundle.project;
    },
    updateProjectLocation: (id, location, talukaId, villageId) => {
      if (!location.trim() || !validLocation(talukaId, villageId)) {
        throw new Error("Select a valid demo Taluka and Village, and enter a location.");
      }
      commit(
        {
          ...state,
          projects: state.projects.map((project) =>
            project.id === id
              ? { ...project, location: location.trim(), talukaId, villageId }
              : project,
          ),
        },
        {
          type: "project.location_updated",
          projectId: id,
          entityType: "project",
          entityId: id,
          text: "Project location updated (fictional demo selections)",
        },
      );
    },
    setApplicationStatus: (id, status) => {
      const application = state.approvals.find((approval) => approval.id === id);
      if (application) {
        commit(
          {
            ...state,
            approvals: state.approvals.map((approval) =>
              approval.id === id ? { ...approval, status } : approval,
            ),
          },
          {
            type: "approval.status_updated",
            projectId: application.projectId,
            entityType: "approval",
            entityId: id,
            text: `Application ${application.reference} workflow status set to ${status}`,
          },
        );
        return;
      }
      const project = state.projects.find((item) => item.id === id);
      if (!project) return;
      commit(
        {
          ...state,
          projects: state.projects.map((item) =>
            item.id === id ? { ...item, workflowStatus: status } : item,
          ),
        },
        {
          type: "approval.status_updated",
          projectId: id,
          entityType: "project",
          entityId: id,
          text: "Project application-tracking status set to " + status,
        },
      );
    },
    setTaskStatus: (id, status) =>
      updateTask(id, { status }, { type: "task.status_updated", text: `set to ${status}` }),
    setTaskResponsible: (id, responsible) =>
      updateTask(
        id,
        { responsible },
        { type: "task.responsibility_changed", text: `reassigned to ${responsible}` },
      ),
    setTaskDueDate: (id, rawDate) => {
      const dueDate = parseOrThrow(taskDeadlineSchema, rawDate);
      updateTask(
        id,
        { dueDate },
        { type: "task.deadline_changed", text: `target date set to ${dueDate || "Not set"}` },
      );
    },
    setRequirementStatus: (id, status) =>
      updateRequirement(
        id,
        { status },
        {
          type: "requirement.status_updated",
          text: `workflow status set to ${status} (workflow only, not legal compliance)`,
        },
      ),
    setRequirementResponsible: (id, responsible) =>
      updateRequirement(
        id,
        { responsible },
        { type: "requirement.responsibility_changed", text: `reassigned to ${responsible}` },
      ),
    registerDocument: (rawInput) => {
      // Metadata registration only: validate all references before any commit.
      const input = parseOrThrow(documentMetadataSchema, rawInput);
      const projectExists = state.projects.some((project) => project.id === input.projectId);
      if (!projectExists) throw new Error("Choose a valid project.");
      const requirement = state.requirements.find((item) => item.id === input.requirementId);
      if (!requirement || requirement.projectId !== input.projectId) {
        throw new Error("The selected requirement does not belong to the selected project.");
      }
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
        registeredAt: new Date().toISOString().slice(0, 10),
        uploadedAt: null,
        reviewDate: input.reviewDate,
      };
      commit(
        { ...state, documents: [record, ...state.documents] },
        {
          type: "document.registered",
          projectId: record.projectId,
          entityType: "document",
          entityId: record.id,
          text: `Document metadata "${record.name}" registered (no file stored)`,
        },
      );
      return record;
    },
    recordActivity: (input) => {
      const event = commit(state, input);
      if (!event) throw new Error("Activity event could not be recorded.");
      return event;
    },
  };
}
