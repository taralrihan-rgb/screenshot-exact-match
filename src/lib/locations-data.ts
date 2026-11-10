// Location FIXTURES ONLY — separated from the search/validation logic in
// locations.ts so a verified dataset can replace this file without touching
// business logic. Replace with professionally verified Maharashtra records.
// IDs link village -> taluka -> district; names are never used as foreign keys.
import type { LocationDataset } from "./locations";

export const LOCATION_DATA: LocationDataset = {
  provenance: "fictional",
  source: "Fictional interface fixtures; no verified Maharashtra dataset loaded.",
  districts: [{ id: "test-district", name: "Test District (fictional)", state: "Maharashtra" }],
  talukas: [
    { id: "test-north", name: "Test Taluka North (fictional)", districtId: "test-district" },
    { id: "test-south", name: "Test Taluka South (fictional)", districtId: "test-district" },
  ],
  villages: [
    { id: "test-greens", name: "Test Village Greens (fictional)", talukaId: "test-north" },
    { id: "test-lake", name: "Test Village Lake (fictional)", talukaId: "test-north" },
    { id: "test-courtyard", name: "Test Village Courtyard (fictional)", talukaId: "test-south" },
  ],
};
