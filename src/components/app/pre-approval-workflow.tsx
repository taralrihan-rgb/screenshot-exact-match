import { TEAM, type TaskStatus } from "@/lib/demo-data";
import { useStore } from "@/lib/store";
import { stepProgress } from "@/lib/workflow";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ProgressBar, StatusBadge } from "./ui-bits";

export function PreApprovalWorkflow({ projectId }: { projectId: string }) {
  const { tasks, setTaskStatus, setTaskResponsible, setTaskDueDate } = useStore();
  const steps = tasks
    .filter((t) => t.projectId === projectId && t.workflowStep !== undefined)
    .sort((a, b) => (a.workflowStep ?? 0) - (b.workflowStep ?? 0));
  return (
    <section className="mt-6 border-y py-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">Pre-Approval workflow</h2>
        <div className="w-48">
          <ProgressBar value={stepProgress(steps)} />
        </div>
      </div>
      <p className="mb-3 text-xs text-muted-foreground">
        {steps.filter((t) => t.status !== "Completed").length} outstanding ·{" "}
        {steps.filter((t) => t.status === "Blocked").length} blocked. Tracking only — no digital
        signing or payment is performed.
      </p>
      <ol className="divide-y">
        {steps.map((t, i) => (
          <li key={t.id} className="grid items-center gap-3 py-3 md:grid-cols-[2fr_1fr_1fr_1fr]">
            <div className="text-sm">
              <span className="mr-2 font-mono text-muted-foreground">{i + 1}.</span>
              {t.title}
              {t.status === "Blocked" && <StatusBadge value="Blocked" className="ml-2" />}
            </div>
            <Select value={t.status} onValueChange={(v) => setTaskStatus(t.id, v as TaskStatus)}>
              <SelectTrigger aria-label={`Step status for ${t.title}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(["Open", "In progress", "Blocked", "Completed"] as TaskStatus[]).map((s) => (
                  <SelectItem key={s} value={s}>
                    {s === "Open" ? "Not started" : s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={t.responsible} onValueChange={(v) => setTaskResponsible(t.id, v)}>
              <SelectTrigger aria-label={`Step responsible for ${t.title}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TEAM.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={t.dueDate}
              onChange={(e) => setTaskDueDate(t.id, e.target.value)}
              aria-label={`Target date for ${t.title}`}
            />
          </li>
        ))}
      </ol>
    </section>
  );
}
