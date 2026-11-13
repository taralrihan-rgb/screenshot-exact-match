// React binding for the repository contract. Pages stay independent of the
// in-memory adapter; refreshing restores the original fictional fixtures.
import { createContext, useContext, useState, useSyncExternalStore, type ReactNode } from "react";
import type { Approval, Project, ReqStatus, TaskStatus } from "./demo-data";
import type { ProjectInput } from "./workflow";
import { createDemoRepository, type DemoState, type DocumentMetadataInput } from "./repository";

interface Store extends DemoState {
  addProject: (input: ProjectInput) => Project;
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
  registerDocument: (input: DocumentMetadataInput) => DemoState["documents"][number];
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [repository] = useState(createDemoRepository);
  const state = useSyncExternalStore(
    repository.subscribe,
    repository.getSnapshot,
    repository.getSnapshot,
  );

  const value: Store = {
    ...state,
    addProject: repository.createProject,
    updateProjectLocation: repository.updateProjectLocation,
    setApplicationStatus: repository.setApplicationStatus,
    setTaskStatus: repository.setTaskStatus,
    setTaskResponsible: repository.setTaskResponsible,
    setTaskDueDate: repository.setTaskDueDate,
    setRequirementStatus: repository.setRequirementStatus,
    setRequirementResponsible: repository.setRequirementResponsible,
    registerDocument: repository.registerDocument,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const store = useContext(Ctx);
  if (!store) throw new Error("useStore must be used inside StoreProvider");
  return store;
}
