import { useState } from "react";
import { toast } from "sonner";
import type { Project } from "@/lib/demo-data";
import { locationNames, searchTalukas, searchVillages, validLocation } from "@/lib/locations";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { LocationCombobox } from "./location-combobox";

export function EditProjectLocation({ project }: { project: Project }) {
  const { updateProjectLocation } = useStore();
  const [open, setOpen] = useState(false);
  const [location, setLocation] = useState(project.location);
  const [talukaId, setTalukaId] = useState(project.talukaId ?? "");
  const [villageId, setVillageId] = useState(project.villageId ?? "");
  const names = locationNames(project.talukaId, project.villageId);
  const [taluka, setTaluka] = useState(project.talukaId ? names.taluka : "");
  const [village, setVillage] = useState(project.villageId ? names.village : "");
  const [error, setError] = useState("");
  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        Edit location
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit project location</DialogTitle>
            <DialogDescription>
              Fictional suggestions only. Changes reset on reload. Project type is unchanged to
              preserve checklist progress.
            </DialogDescription>
          </DialogHeader>
          <label htmlFor="edit-location" className="text-sm font-medium">
            Location *
          </label>
          <Input
            id="edit-location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <LocationCombobox
            label="Taluka"
            value={taluka}
            options={searchTalukas(taluka)}
            onQuery={(q) => {
              setTaluka(q);
              setTalukaId("");
              setVillage("");
              setVillageId("");
            }}
            onSelect={(id, name) => {
              setTalukaId(id);
              setTaluka(name);
              setVillage("");
              setVillageId("");
            }}
          />
          <LocationCombobox
            label="Village"
            value={village}
            disabled={!talukaId}
            options={searchVillages(village, talukaId)}
            onQuery={(q) => {
              setVillage(q);
              setVillageId("");
            }}
            onSelect={(id, name) => {
              setVillageId(id);
              setVillage(name);
            }}
          />
          {error && (
            <p role="alert" className="text-xs text-destructive">
              {error}
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!location.trim() || !validLocation(talukaId, villageId)) {
                  setError(
                    "Enter a location and select a Taluka/Village pair from the suggestions.",
                  );
                  return;
                }
                updateProjectLocation(project.id, location, talukaId, villageId);
                setError("");
                setOpen(false);
                toast.success("Demo location updated.");
              }}
            >
              Save location
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
