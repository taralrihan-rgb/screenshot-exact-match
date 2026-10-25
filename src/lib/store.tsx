import { createContext, useContext, useState, type ReactNode } from "react";
import * as demo from "./demo-data";
import type { Project, ReqStatus, TaskStatus, Approval } from "./demo-data";
import { createProjectBundle, preApprovalTasks, type ProjectInput } from "./workflow";
import { validLocation } from "./locations";

// One state transition creates the project, checklist, tasks and activity atomically.
// Demo memory only: refreshing restores the original fixtures.
function initialState() {
  return { projects: demo.projects, requirements: demo.requirements, tasks: [...demo.tasks, ...demo.projects.flatMap(preApprovalTasks)], activity: demo.activity, documents: demo.documents, approvals: demo.approvals };
}
type State = ReturnType<typeof initialState>;
interface Store extends State {
  addProject: (p: ProjectInput) => Project;
  updateProjectLocation: (id: string, location: string, talukaId: string, villageId: string) => void;
  setApplicationStatus: (id: string, status: Approval["status"]) => void;
  setTaskStatus: (id: string, status: TaskStatus) => void;
  setTaskResponsible: (id: string, responsible: string) => void;
  setTaskDueDate: (id: string, date: string) => void;
  setRequirementStatus: (id: string, status: ReqStatus) => void;
  setRequirementResponsible: (id: string, responsible: string) => void;
}
const Ctx = createContext<Store | null>(null);
export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(initialState);
  const withLog = (s: State, projectId: string, text: string): State => ({ ...s, activity: [{ id: crypto.randomUUID(), projectId, text, who: "You (demo)", when: demo.DEMO_TODAY }, ...s.activity] });
  const updateTask = (id: string, patch: Partial<demo.Task>, text: string) => setState((s) => {
    const task = s.tasks.find((t) => t.id === id);
    if (!task) return s;
    return withLog({ ...s, tasks: s.tasks.map((t) => t.id === id ? { ...t, ...patch } : t) }, task.projectId, `Task "${task.title}" ${text}`);
  });
  const updateRequirement = (id: string, patch: Partial<demo.Requirement>, text: string) => setState((s) => {
    const req = s.requirements.find((r) => r.id === id);
    if (!req) return s;
    return withLog({ ...s, requirements: s.requirements.map((r) => r.id === id ? { ...r, ...patch } : r) }, req.projectId, `Requirement "${req.name}" ${text}`);
  });
  const value: Store = {
    ...state,
    addProject: (input) => {
      const bundle = createProjectBundle(input, `p-${crypto.randomUUID()}`);
      setState((s) => withLog({ ...s, projects: [bundle.project, ...s.projects], requirements: [...s.requirements, ...bundle.requirements], tasks: [...s.tasks, ...bundle.tasks] }, bundle.project.id, `Project "${bundle.project.name}" created with ${bundle.requirements.length} fictional checklist items`));
      return bundle.project;
    },
    updateProjectLocation: (id, location, talukaId, villageId) => {
      if (!location.trim() || !validLocation(talukaId, villageId)) throw new Error("Select a valid demo Taluka and Village, and enter a location.");
      setState((s) => withLog({ ...s, projects: s.projects.map((p) => p.id === id ? { ...p, location: location.trim(), talukaId, villageId } : p) }, id, "Project location updated (fictional demo selections)"));
    },
    setApplicationStatus: (id, status) => setState((s) => {
      const application = s.approvals.find((a) => a.id === id);
      if (application) return withLog({ ...s, approvals: s.approvals.map((a) => a.id === id ? { ...a, status } : a) }, application.projectId, `Application ${application.reference} workflow status set to ${status}`);
      const project = s.projects.find((p) => p.id === id);
      if (!project) return s;
      return withLog({ ...s, projects: s.projects.map((p) => p.id === id ? { ...p, workflowStatus: status } : p) }, id, `Project application-tracking status set to ${status}`);
    }),
    setTaskStatus: (id, status) => updateTask(id, { status }, `set to ${status}`),
    setTaskResponsible: (id, responsible) => updateTask(id, { responsible }, `reassigned to ${responsible}`),
    setTaskDueDate: (id, dueDate) => updateTask(id, { dueDate }, `target date set to ${dueDate || "Not set"}`),
    setRequirementStatus: (id, status) => updateRequirement(id, { status }, `workflow status set to ${status} (workflow only, not legal compliance)`),
    setRequirementResponsible: (id, responsible) => updateRequirement(id, { responsible }, `reassigned to ${responsible}`),
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore must be used inside StoreProvider");
  return s;
}
