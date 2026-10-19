import type { Requirement } from "@/lib/demo-data";
import { useStore } from "@/lib/store";
import { formatDate, isOverdue } from "@/lib/metrics";
import { COMPLETE_STATUSES } from "@/lib/demo-data";
import { StatusBadge } from "./ui-bits";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function RequirementsTable({ rows, showProject }: { rows: Requirement[]; showProject?: boolean }) {
  const { projects } = useStore();
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
              <TableCell className="min-w-48 font-medium">{r.name}</TableCell>
              {showProject && <TableCell className="min-w-40">{projects.find((p) => p.id === r.projectId)?.name}</TableCell>}
              <TableCell>{r.category}</TableCell>
              <TableCell><StatusBadge value={r.applicability} /></TableCell>
              <TableCell><StatusBadge value={r.status} /></TableCell>
              <TableCell className="whitespace-nowrap">{r.responsible}</TableCell>
              <TableCell className="whitespace-nowrap font-mono text-xs">
                {formatDate(r.dueDate)}
                {isOverdue(r.dueDate, COMPLETE_STATUSES.includes(r.status)) && <StatusBadge value="Overdue" className="ml-1" />}
              </TableCell>
              <TableCell><StatusBadge value={r.evidence} /></TableCell>
              <TableCell className="min-w-56 text-xs text-muted-foreground">{r.sourceRef}</TableCell>
              <TableCell className="whitespace-nowrap text-xs">{r.lastVerified ? formatDate(r.lastVerified) : <StatusBadge value="Needs verification" />}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
