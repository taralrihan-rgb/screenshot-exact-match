// Data-access layer. The store loads its initial state through this module
// so a future Supabase implementation can replace it without rewriting UI.
//
// FUTURE CONTRACT (not implemented — no backend in this task):
//   interface DataRepository {
//     listProjects(orgId: string): Promise<Project[]>;
//     listRequirements(projectId: string): Promise<Requirement[]>;
//     listTasks(projectId: string): Promise<Task[]>;
//     listApprovals(projectId: string): Promise<Approval[]>;
//     listDocuments(projectId: string): Promise<DocumentRecord[]>;
//     listActivity(projectId: string): Promise<Activity[]>;
//     ...mutations returning persisted rows
//   }
// The demo repository below is synchronous and memory-only; the async
// signatures above are the intended swap point.
import * as demo from "./demo-data";
import { preApprovalTasks } from "./workflow";

export interface DemoState {
  projects: demo.Project[];
  requirements: demo.Requirement[];
  tasks: demo.Task[];
  activity: demo.Activity[];
  documents: demo.DocumentRecord[];
  approvals: demo.Approval[];
}

/** Demo memory only: refreshing restores the original fixtures. */
export function loadInitialState(): DemoState {
  return {
    projects: demo.projects,
    requirements: demo.requirements,
    tasks: [...demo.tasks, ...demo.projects.flatMap(preApprovalTasks)],
    activity: demo.activity,
    documents: demo.documents,
    approvals: demo.approvals,
  };
}
