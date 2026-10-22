import { createContext, useContext, useState, type ReactNode } from "react";
import * as demo from "./demo-data";
import type { Activity, Project, Requirement, ReqStatus, Task, TaskStatus } from "./demo-data";

// In-memory demo store. Changes reset on page reload (nothing is saved permanently).
// To connect a backend later, replace these useState calls with server queries/mutations.
interface Store {
  projects: Project[];
  tasks: Task[];
  activity: Activity[];
  requirements: Requirement[];
  documents: typeof demo.documents;
  approvals: typeof demo.approvals;
  addProject: (p: Omit<Project, "id" | "status" | "team">) => Project;
  setTaskStatus: (id: string, status: TaskStatus) => void;
  setTaskResponsible: (id: string, responsible: string) => void;
  setRequirementStatus: (id: string, status: ReqStatus) => void;
  setRequirementResponsible: (id: string, responsible: string) => void;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState(demo.projects);
  const [tasks, setTasks] = useState(demo.tasks);
  const [activity, setActivity] = useState(demo.activity);
  const [requirements, setRequirements] = useState(demo.requirements);

  const log = (projectId: string, text: string) =>
    setActivity((a) => [{ id: crypto.randomUUID(), projectId, text, who: "You (demo)", when: demo.DEMO_TODAY }, ...a]);

  const value: Store = {
    projects,
    tasks,
    activity,
    requirements,
    documents: demo.documents,
    approvals: demo.approvals,
    addProject: (p) => {
      const project: Project = { ...p, id: `p${Date.now()}`, status: "Active", team: [p.owner] };
      setProjects((ps) => [project, ...ps]);
      log(project.id, `Project "${project.name}" created`);
      return project;
    },
    setTaskStatus: (id, status) => {
      const t = tasks.find((x) => x.id === id);
      setTasks((ts) => ts.map((x) => (x.id === id ? { ...x, status } : x)));
      if (t) log(t.projectId, `Task "${t.title}" set to ${status}`);
    },
    setTaskResponsible: (id, responsible) => {
      const t = tasks.find((x) => x.id === id);
      setTasks((ts) => ts.map((x) => (x.id === id ? { ...x, responsible } : x)));
      if (t) log(t.projectId, `Task "${t.title}" reassigned to ${responsible}`);
    },
    setRequirementStatus: (id, status) => {
      const r = requirements.find((x) => x.id === id);
      setRequirements((rs) => rs.map((x) => (x.id === id ? { ...x, status } : x)));
      if (r) log(r.projectId, `Requirement "${r.name}" workflow status set to ${status} (workflow only, not legal compliance)`);
    },
    setRequirementResponsible: (id, responsible) => {
      const r = requirements.find((x) => x.id === id);
      setRequirements((rs) => rs.map((x) => (x.id === id ? { ...x, responsible } : x)));
      if (r) log(r.projectId, `Requirement "${r.name}" reassigned to ${responsible}`);
    },
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore must be used inside StoreProvider");
  return s;
}
