import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { formatDate } from "@/lib/metrics";
import { PageHeader, StatusBadge, EmptyState, SimulatedTag } from "@/components/app/ui-bits";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/documents")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Document register — ClearTrack demo" },
      {
        name: "description",
        content: "Register of evidence documents, versions and review dates per project.",
      },
      { property: "og:title", content: "Document register — ClearTrack demo" },
      { property: "og:description", content: "Evidence documents, versions and review dates." },
    ],
  }),
  component: Documents,
});

function Documents() {
  const { documents, requirements, projects } = useStore();
  const [q, setQ] = useState("");
  const rows = documents.filter((d) => d.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <PageHeader
        title="Document register"
        description="Sample document metadata only. No real files are stored."
        action={
          <Button
            variant="outline"
            onClick={() =>
              toast.info("File upload is simulated in this prototype — no file was uploaded.")
            }
          >
            Upload document <SimulatedTag />
          </Button>
        }
      />
      <Input
        className="mb-4 sm:w-80"
        placeholder="Search documents"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      {rows.length === 0 ? (
        <EmptyState title="No documents found" />
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Related requirement</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Added</TableHead>
                <TableHead>Expiry / review</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-mono text-xs">{d.name}</TableCell>
                  <TableCell className="min-w-48">
                    {requirements.find((r) => r.id === d.requirementId)?.name}
                  </TableCell>
                  <TableCell className="min-w-40">
                    {projects.find((p) => p.id === d.projectId)?.name}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{d.version}</TableCell>
                  <TableCell>
                    <StatusBadge value={d.status} />
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs">
                    {formatDate(d.dateAdded)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs">
                    {formatDate(d.reviewDate)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}
