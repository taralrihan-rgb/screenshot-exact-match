import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { formatDate } from "@/lib/metrics";
import { PageHeader, StatusBadge, EmptyState } from "@/components/app/ui-bits";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
      { title: "Document register — Realtify demo" },
      {
        name: "description",
        content: "Register of evidence documents, versions and review dates per project.",
      },
      { property: "og:title", content: "Document register — Realtify demo" },
      { property: "og:description", content: "Evidence documents, versions and review dates." },
    ],
  }),
  component: Documents,
});

function formatSize(bytes: number | null) {
  if (bytes === null) return "—";
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  return `${Math.round(bytes / 1000)} KB`;
}

function Documents() {
  const { documents, requirements, projects } = useStore();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const rows = documents.filter((d) => d.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <PageHeader
        title="Document register"
        description="Demonstration metadata only — no real files are stored or uploaded."
        action={<Button onClick={() => setOpen(true)}>Register document metadata</Button>}
      />
      <p className="mb-4 rounded-md border border-dashed px-3 py-2 text-xs text-muted-foreground">
        This register records document metadata (name, version, status, dates). Registering a
        document here does not upload or store any file. Secure file storage will be added with the
        future backend.
      </p>
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
                <TableHead>Type</TableHead>
                <TableHead>Size</TableHead>
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
                  <TableCell className="whitespace-nowrap font-mono text-xs">
                    {d.mimeType?.split("/").pop() ?? "—"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap font-mono text-xs">
                    {formatSize(d.fileSizeBytes)}
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
      <RegisterDocumentDialog open={open} onOpenChange={setOpen} />
    </>
  );
}

const DOC_STATUSES = ["Pending", "Received", "Under review", "Expired"] as const;

function RegisterDocumentDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const { projects, requirements, registerDocument } = useStore();
  const empty = { name: "", projectId: "", requirementId: "", version: "v1", reviewDate: "" };
  const [f, setF] = useState(empty);
  const [status, setStatus] = useState<(typeof DOC_STATUSES)[number]>("Pending");
  const [error, setError] = useState("");
  const reqs = requirements.filter((r) => r.projectId === f.projectId);

  const submit = () => {
    try {
      registerDocument({
        name: f.name,
        projectId: f.projectId,
        requirementId: f.requirementId,
        version: f.version,
        status,
        reviewDate: f.reviewDate || null,
      });
      toast.success("Document metadata registered — no file was uploaded or stored.");
      setF(empty);
      setStatus("Pending");
      setError("");
      onOpenChange(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Registration failed.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Register document metadata</DialogTitle>
          <DialogDescription>
            This records metadata only. No file is uploaded, stored or linked. File storage requires
            the future backend.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="doc-name">Document name *</Label>
            <Input
              id="doc-name"
              value={f.name}
              placeholder="e.g. Title_Deed_Draft.pdf"
              onChange={(e) => setF({ ...f, name: e.target.value })}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="doc-project">Project *</Label>
            <Select
              value={f.projectId}
              onValueChange={(v) => setF({ ...f, projectId: v, requirementId: "" })}
            >
              <SelectTrigger id="doc-project">
                <SelectValue placeholder="Select…" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="doc-requirement">Related requirement</Label>
            <Select
              value={f.requirementId}
              onValueChange={(v) => setF({ ...f, requirementId: v })}
              disabled={!f.projectId}
            >
              <SelectTrigger id="doc-requirement">
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                {reqs.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-1.5">
              <Label htmlFor="doc-version">Version *</Label>
              <Input
                id="doc-version"
                value={f.version}
                onChange={(e) => setF({ ...f, version: e.target.value })}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="doc-status">Status</Label>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as (typeof DOC_STATUSES)[number])}
              >
                <SelectTrigger id="doc-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DOC_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="doc-review">Review date</Label>
              <Input
                id="doc-review"
                type="date"
                value={f.reviewDate}
                onChange={(e) => setF({ ...f, reviewDate: e.target.value })}
              />
            </div>
          </div>
          {error && (
            <p role="alert" className="text-xs text-destructive">
              {error}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit}>Register metadata</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
