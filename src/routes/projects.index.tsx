import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { LocationCombobox } from "@/components/app/location-combobox";
import { locationNames, searchTalukas, searchVillages, validLocation } from "@/lib/locations";
import { APPLICATION_STATUSES, applicationRows } from "@/lib/workflow";
import { summarize } from "@/lib/metrics";
import { PROJECT_TYPES, STAGES, TEAM, type ProjectStage } from "@/lib/demo-data";
import {
  PageHeader,
  StatusBadge,
  ProgressBar,
  EmptyState,
  SimulatedTag,
} from "@/components/app/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export const Route = createFileRoute("/projects/")({
  validateSearch: (search: Record<string, unknown>): { workflow?: string | undefined } => ({
    workflow: typeof search["workflow"] === "string" ? search["workflow"] : undefined,
  }),
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Projects — ClearTrack demo" },
      {
        name: "description",
        content: "Search and filter real estate projects and track workflow progress.",
      },
      { property: "og:title", content: "Projects — ClearTrack demo" },
      {
        property: "og:description",
        content: "Search and filter projects and track workflow progress.",
      },
    ],
  }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const { projects, requirements, tasks, approvals } = useStore();
  const { workflow } = Route.useSearch();
  const navigate = useNavigate();
  const records = applicationRows(projects, approvals);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [stage, setStage] = useState("all");
  const [open, setOpen] = useState(false);

  const list = projects.filter(
    (p) =>
      (!workflow || records.some((r) => r.projectId === p.id && r.status === workflow)) &&
      (status === "all" || p.status === status) &&
      (stage === "all" || p.stage === stage) &&
      (
        p.name +
        p.location +
        p.owner +
        locationNames(p.talukaId, p.villageId).taluka +
        locationNames(p.talukaId, p.villageId).village
      )
        .toLowerCase()
        .includes(q.toLowerCase()),
  );

  return (
    <>
      <PageHeader
        title="Projects"
        description="Fictional demonstration projects."
        action={
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" />
            Create project
          </Button>
        }
      />
      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search by name, location or owner"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="On hold">On hold</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={stage} onValueChange={setStage}>
          <SelectTrigger className="sm:w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All stages</SelectItem>
            {STAGES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Select
          value={workflow ?? "all"}
          onValueChange={(v) =>
            navigate({ to: "/projects", search: { workflow: v === "all" ? undefined : v } })
          }
        >
          <SelectTrigger className="w-60" aria-label="Application workflow filter">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All application workflows</SelectItem>
            {[...APPLICATION_STATUSES, "Unmapped"].map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {workflow && (
          <Button variant="ghost" onClick={() => navigate({ to: "/projects", search: {} })}>
            Clear workflow filter
          </Button>
        )}
      </div>
      {list.length === 0 ? (
        <EmptyState
          title="No projects match your filters"
          hint="Try clearing the search or filters."
        />
      ) : (
        <div className="grid gap-3">
          {list.map((p) => {
            const s = summarize(
              requirements.filter((r) => r.projectId === p.id),
              tasks.filter((t) => t.projectId === p.id),
            );
            return (
              <Link
                key={p.id}
                to="/projects/$projectId"
                params={{ projectId: p.id }}
                className="grid gap-3 rounded-lg border bg-card p-4 transition-colors hover:border-primary md:grid-cols-[2fr_1fr_1fr_1fr_1.2fr] md:items-center"
              >
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.location}</p>
                  {p.talukaId && (
                    <p className="text-xs text-muted-foreground">
                      {locationNames(p.talukaId, p.villageId).taluka} ·{" "}
                      {locationNames(p.talukaId, p.villageId).village}
                    </p>
                  )}
                </div>
                <div className="text-sm">{p.type}</div>
                <div className="flex flex-wrap gap-1">
                  <StatusBadge value={p.stage} />
                  <StatusBadge value={p.status} />
                  {records
                    .filter((r) => r.projectId === p.id)
                    .map((r) => (
                      <StatusBadge
                        key={r.id}
                        value={r.status === "Unmapped" ? r.rawStatus : r.status}
                      />
                    ))}
                </div>
                <div className="text-sm text-muted-foreground">{p.owner}</div>
                <ProgressBar value={s.progress} />
              </Link>
            );
          })}
        </div>
      )}
      <CreateProjectDialog open={open} onOpenChange={setOpen} />
    </>
  );
}

function CreateProjectDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const { addProject } = useStore();
  const navigate = useNavigate();
  const submitting = useRef(false);
  const [busy, setBusy] = useState(false);
  const [talukaQuery, setTalukaQuery] = useState("");
  const [villageQuery, setVillageQuery] = useState("");
  const empty = {
    name: "",
    location: "",
    talukaId: "",
    villageId: "",
    type: "",
    stage: "",
    owner: "",
  };
  const [f, setF] = useState(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof empty, string>>>({});

  const submit = () => {
    if (submitting.current) return;
    const e: Partial<Record<keyof typeof empty, string>> = {};
    if (f.name.trim().length < 3) e.name = "Enter a project name (min 3 characters).";
    if (!f.location.trim()) e.location = "Enter a location.";
    if (!searchTalukas("").some((t) => t.id === f.talukaId))
      e.talukaId = "Select a Taluka from the fictional demo suggestions.";
    if (!validLocation(f.talukaId, f.villageId))
      e.villageId = "Select a Village belonging to the selected Taluka.";
    if (!f.type) e.type = "Choose a project type.";
    if (!f.stage) e.stage = "Choose a stage.";
    if (!f.owner) e.owner = "Assign a team member.";
    setErrors(e);
    if (Object.keys(e).length) {
      toast.error("Please fix the highlighted fields.");
      return;
    }
    submitting.current = true;
    setBusy(true);
    try {
      const project = addProject({
        name: f.name.trim(),
        location: f.location.trim(),
        talukaId: f.talukaId,
        villageId: f.villageId,
        type: f.type,
        stage: f.stage as ProjectStage,
        owner: f.owner,
        description: "Created in demo session.",
      });
      toast.success("Project and configured fictional checklist created — resets on reload.");
      setF(empty);
      setTalukaQuery("");
      setVillageQuery("");
      setErrors({});
      onOpenChange(false);
      void navigate({ to: "/projects/$projectId", params: { projectId: project.id } });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Creation failed. Please retry.");
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  };

  const field = (k: keyof typeof f, label: string, node: React.ReactNode) => (
    <div className="grid gap-1.5">
      <Label htmlFor={`project-${k}`}>{label} *</Label>
      {node}
      {errors[k] && <p className="text-xs text-destructive">{errors[k]}</p>}
    </div>
  );
  const sel = (k: keyof typeof f, opts: string[]) => (
    <Select value={f[k]} onValueChange={(v) => setF({ ...f, [k]: v })}>
      <SelectTrigger id={`project-${k}`}>
        <SelectValue placeholder="Select…" />
      </SelectTrigger>
      <SelectContent>
        {opts.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Create project <SimulatedTag />
          </DialogTitle>
          <DialogDescription>
            Demo memory only — resets on reload. Configured fictional checklists need professional
            review. No verified Maharashtra location data is loaded.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          {field(
            "name",
            "Project name",
            <Input
              id="project-name"
              value={f.name}
              onChange={(e) => setF({ ...f, name: e.target.value })}
            />,
          )}
          {field(
            "location",
            "Location",
            <Input
              id="project-location"
              value={f.location}
              placeholder="Fictional location"
              onChange={(e) => setF({ ...f, location: e.target.value })}
            />,
          )}
          <p className="text-xs text-warning">
            Taluka/Village suggestions are fictional test data, not verified administrative
            locations.
          </p>
          <LocationCombobox
            label="Taluka"
            value={talukaQuery}
            options={searchTalukas(talukaQuery)}
            error={errors.talukaId}
            onQuery={(q) => {
              setTalukaQuery(q);
              setVillageQuery("");
              setF({ ...f, talukaId: "", villageId: "" });
            }}
            onSelect={(id, name) => {
              setTalukaQuery(name);
              setVillageQuery("");
              setF({ ...f, talukaId: id, villageId: "" });
            }}
          />
          <LocationCombobox
            label="Village"
            value={villageQuery}
            options={searchVillages(villageQuery, f.talukaId)}
            disabled={!f.talukaId}
            error={errors.villageId}
            onQuery={(q) => {
              setVillageQuery(q);
              setF({ ...f, villageId: "" });
            }}
            onSelect={(id, name) => {
              setVillageQuery(name);
              setF({ ...f, villageId: id });
            }}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {field("type", "Type", sel("type", PROJECT_TYPES))}
            {field("stage", "Stage", sel("stage", STAGES))}
          </div>
          {field("owner", "Assigned team member", sel("owner", TEAM))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={busy} onClick={submit}>
            {busy ? "Creating…" : "Create project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
