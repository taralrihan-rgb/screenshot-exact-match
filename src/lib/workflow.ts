import {
  CHECKLIST_TEMPLATES,
  PRE_APPROVAL_STEPS,
  PROJECT_TYPES,
  STAGES,
  TEAM,
  type Approval,
  type Project,
  type Requirement,
  type Task,
} from "./demo-data";
import { validLocation } from "./locations";

export const APPLICATION_STATUSES = [
  "Rejected",
  "Document Reassignment",
  "Forwarded Proposal",
  "Reassign Proposal",
  "Rejected Proposal",
  "In Process",
] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];
// Only Under review has a clear equivalent (In Process). Draft, Submitted,
// Query raised, Granted (recorded), missing/unknown values remain Unmapped.
export function mappedStatus(status?: string): ApplicationStatus | "Unmapped" {
  if (status === "Under review") return "In Process";
  return APPLICATION_STATUSES.find((s) => s === status) ?? "Unmapped";
}
export function applicationRows(projects: Project[], approvals: Approval[]) {
  return [
    ...approvals.map((a) => ({
      id: a.id,
      projectId: a.projectId,
      label: a.reference,
      rawStatus: a.status,
      status: mappedStatus(a.status),
      kind: "application",
    })),
    ...projects
      .filter((p) => !approvals.some((a) => a.projectId === p.id))
      .map((p) => ({
        id: p.id,
        projectId: p.id,
        label: p.name,
        rawStatus: p.workflowStatus ?? "Not recorded",
        status: mappedStatus(p.workflowStatus),
        kind: "project",
      })),
  ];
}
export type ProjectInput = Omit<Project, "id" | "status" | "team" | "workflowStatus">;
export function createProjectBundle(input: ProjectInput, id: string) {
  if (
    input.name.trim().length < 3 ||
    !input.location.trim() ||
    !PROJECT_TYPES.includes(input.type) ||
    !STAGES.includes(input.stage) ||
    !TEAM.includes(input.owner) ||
    !validLocation(input.talukaId ?? "", input.villageId ?? "")
  ) {
    throw new Error(
      "Choose valid project fields and a Taluka/Village pair from the demo suggestions.",
    );
  }
  const project: Project = {
    ...input,
    name: input.name.trim(),
    location: input.location.trim(),
    id,
    status: "Active",
    team: [input.owner],
  };
  const requirements: Requirement[] = (CHECKLIST_TEMPLATES[input.type] ?? [])
    .filter((item) => !item.stage || item.stage === input.stage)
    .map((item) => ({
      id: `${id}-req-${item.key}`,
      projectId: id,
      templateKey: item.key,
      name: item.name,
      category: item.category,
      notes: `${item.notes} ${item.requiredForTemplate ? "Required in fictional template." : "Optional in fictional template."}`,
      applicability: "Needs review",
      status: "Needs verification",
      responsible: input.owner,
      dueDate: "",
      evidence: "Not uploaded",
      sourceRef: "Fictional demo template — verify against applicable official sources",
      lastVerified: null,
    }));
  return { project, requirements, tasks: preApprovalTasks(project) };
}
export function preApprovalTasks(project: Project): Task[] {
  if (project.stage !== "Pre-approval") return [];
  return PRE_APPROVAL_STEPS.map((title, workflowStep) => ({
    id: `${project.id}-pre-${workflowStep}`,
    title,
    workflowStep,
    projectId: project.id,
    requirementId: "",
    responsible: project.owner,
    dueDate: "",
    priority: "Medium",
    status: "Open",
  }));
}
export function stepProgress(tasks: Task[]) {
  return tasks.length
    ? Math.round((tasks.filter((t) => t.status === "Completed").length / tasks.length) * 100)
    : 0;
}
