import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { APPLICATION_STATUSES, mappedStatus } from "@/lib/workflow";
import type { Approval } from "@/lib/demo-data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/app/ui-bits";
import { useStore } from "@/lib/store";
import { formatDate, isOverdue } from "@/lib/metrics";
import { PageHeader, StatusBadge } from "@/components/app/ui-bits";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/approvals")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Approvals tracker — ClearTrack demo" },
      {
        name: "description",
        content: "Track application references, pending actions and follow-up dates.",
      },
      { property: "og:title", content: "Approvals tracker — ClearTrack demo" },
      {
        property: "og:description",
        content: "Application references, pending actions and follow-ups.",
      },
    ],
  }),
  component: Approvals,
});

function Approvals() {
  const { approvals, projects, setApplicationStatus } = useStore();
  const [filter, setFilter] = useState("all");
  const rows = approvals.filter((a) => filter === "all" || mappedStatus(a.status) === filter);
  return (
    <>
      <PageHeader
        title="Approvals tracker"
        description="Manually recorded, fictional records. This app is not connected to any government portal."
      />
      <Select value={filter} onValueChange={setFilter}>
        <SelectTrigger className="mb-4 w-60" aria-label="Approval workflow filter">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All workflows (clear filter)</SelectItem>
          {[...APPLICATION_STATUSES, "Unmapped"].map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {rows.length === 0 && <EmptyState title="No approvals match this workflow" />}
      <div className="overflow-x-auto rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reference</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Pending action</TableHead>
              <TableHead>Responsible</TableHead>
              <TableHead>Next follow-up</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="font-mono text-xs">{a.reference}</TableCell>
                <TableCell className="min-w-40">
                  {projects.find((p) => p.id === a.projectId)?.name}
                </TableCell>
                <TableCell className="whitespace-nowrap text-xs">
                  {a.submitted ? formatDate(a.submitted) : "Not submitted"}
                </TableCell>
                <TableCell>
                  <Select
                    value={a.status}
                    onValueChange={(v) => setApplicationStatus(a.id, v as Approval["status"])}
                  >
                    <SelectTrigger
                      className="w-52"
                      aria-label={`Approval status for ${a.reference}`}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        ...new Set([
                          a.status,
                          "Draft",
                          "Submitted",
                          "Query raised",
                          "Under review",
                          "Granted (recorded)",
                          ...APPLICATION_STATUSES,
                        ]),
                      ].map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="mt-1 text-xs text-muted-foreground">{mappedStatus(a.status)}</p>
                </TableCell>
                <TableCell className="min-w-52 text-sm">{a.pendingAction}</TableCell>
                <TableCell className="whitespace-nowrap">{a.responsible}</TableCell>
                <TableCell className="whitespace-nowrap font-mono text-xs">
                  {formatDate(a.nextFollowUp)}
                  {isOverdue(a.nextFollowUp, a.status === "Granted (recorded)") && (
                    <StatusBadge value="Overdue" className="ml-1" />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
