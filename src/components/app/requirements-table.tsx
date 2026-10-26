import { toast } from "sonner";
import type { Requirement, ReqStatus } from "@/lib/demo-data";
import { useStore } from "@/lib/store";
import { formatDate, isOverdue } from "@/lib/metrics";
import { COMPLETE_STATUSES, TEAM } from "@/lib/demo-data";
import { StatusBadge } from "./ui-bits";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const REQ_STATUSES: ReqStatus[] = [
  "Not started",
  "In progress",
  "Submitted",
  "Changes requested",
  "Approved",
  "Not applicable",
  "Needs verification",
];

export function RequirementsTable({
  rows,
  showProject,
}: {
  rows: Requirement[];
  showProject?: boolean;
}) {
  const { projects, setRequirementStatus, setRequirementResponsible } = useStore();
  return (
    <div className="overflow-x-auto rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Requirement</TableHead>
            {showProject && <TableHead>Project</TableHead>}
            <TableHead>Category</TableHead>
            <TableHead>Applicability</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Responsible</TableHead>
            <TableHead>Due</TableHead>
            <TableHead>Evidence</TableHead>
            <TableHead>Source reference</TableHead>
            <TableHead>Last verified</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="min-w-48 font-medium">
                {r.name}
                {r.notes && (
                  <p className="mt-1 text-xs font-normal text-muted-foreground">{r.notes}</p>
                )}
              </TableCell>
              {showProject && (
                <TableCell className="min-w-40">
                  {projects.find((p) => p.id === r.projectId)?.name}
                </TableCell>
              )}
              <TableCell>{r.category}</TableCell>
              <TableCell>
                <StatusBadge value={r.applicability} />
              </TableCell>
              <TableCell>
                <Select
                  value={r.status}
                  onValueChange={(v) => {
                    setRequirementStatus(r.id, v as ReqStatus);
                    toast.success(
                      "Workflow status updated (demo session only — not legal compliance).",
                    );
                  }}
                >
                  <SelectTrigger className="h-8 w-44" aria-label={`Workflow status for ${r.name}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REQ_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Select
                  value={r.responsible}
                  onValueChange={(v) => {
                    setRequirementResponsible(r.id, v);
                    toast.success("Responsible person updated (demo session only).");
                  }}
                >
                  <SelectTrigger
                    className="h-8 w-40"
                    aria-label={`Responsible person for ${r.name}`}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TEAM.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="whitespace-nowrap font-mono text-xs">
                {formatDate(r.dueDate)}
                {isOverdue(r.dueDate, COMPLETE_STATUSES.includes(r.status)) && (
                  <StatusBadge value="Overdue" className="ml-1" />
                )}
              </TableCell>
              <TableCell>
                <StatusBadge value={r.evidence} />
              </TableCell>
              <TableCell className="min-w-56 text-xs text-muted-foreground">
                {r.sourceRef}
              </TableCell>
              <TableCell className="whitespace-nowrap text-xs">
                {r.lastVerified ? (
                  formatDate(r.lastVerified)
                ) : (
                  <StatusBadge value="Needs verification" />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
