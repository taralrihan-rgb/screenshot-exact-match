import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { formatDate, isOverdue } from "@/lib/metrics";
import { PageHeader, StatusBadge } from "@/components/app/ui-bits";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/approvals")({
  head: () => ({
    meta: [
      { title: "Approvals tracker — ClearTrack demo" },
      { name: "description", content: "Track application references, pending actions and follow-up dates." },
      { property: "og:title", content: "Approvals tracker — ClearTrack demo" },
      { property: "og:description", content: "Application references, pending actions and follow-ups." },
    ],
  }),
  component: Approvals,
});

function Approvals() {
  const { approvals, projects } = useStore();
  return (
    <>
      <PageHeader title="Approvals tracker" description="Manually recorded, fictional records. This app is not connected to any government portal." />
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
            {approvals.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="font-mono text-xs">{a.reference}</TableCell>
                <TableCell className="min-w-40">{projects.find((p) => p.id === a.projectId)?.name}</TableCell>
                <TableCell className="whitespace-nowrap text-xs">{a.submitted ? formatDate(a.submitted) : "Not submitted"}</TableCell>
                <TableCell><StatusBadge value={a.status} /></TableCell>
                <TableCell className="min-w-52 text-sm">{a.pendingAction}</TableCell>
                <TableCell className="whitespace-nowrap">{a.responsible}</TableCell>
                <TableCell className="whitespace-nowrap font-mono text-xs">
                  {formatDate(a.nextFollowUp)}
                  {isOverdue(a.nextFollowUp, a.status === "Granted (recorded)") && <StatusBadge value="Overdue" className="ml-1" />}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
