import { createContext, useContext, useState, type ReactNode } from "react";
import * as demo from "./demo-data";
import type { Activity, Project, Task, TaskStatus } from "./demo-data";

// In-memory demo store. Changes reset on page reload (nothing is saved permanently).
// To connect a backend later, replace these useState calls with server queries/mutations.
interface Store {
  projects: Project[];
  tasks: Task[];
  activity: Activity[];
  requirements: typeof demo.requirements;
  documents: typeof demo.documents;
  approvals: typeof demo.approvals;
  addProject: (p: Omit<Project, "id" | "status" | "team">) => Project;
  setTaskStatus: (id: string, status: TaskStatus) => void;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState(demo.projects);
  const [tasks, setTasks] = useState(demo.tasks);
  const [activity, setActivity] = useState(demo.activity);

  const log = (projectId: string, text: string) =>
    setActivity((a) => [{ id: crypto.randomUUID(), projectId, text, who: "You (demo)", when: demo.DEMO_TODAY }, ...a]);

  const value: Store = {
    projects,
    tasks,
    activity,
    requirements: demo.requirements,
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
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore must be used inside StoreProvider");
  return s;
}
