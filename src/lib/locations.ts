// Location search/validation logic. The dataset itself lives in
// locations-data.ts (fictional fixtures) so a verified dataset can be
// swapped in without touching this logic. Never present fictional records
// as genuine locations; provenance stays visible via LocationDataset.
import { LOCATION_DATA } from "./locations-data";

export interface LocationDataset {
  provenance: "fictional" | "verified";
  source: string;
  districts: { id: string; name: string; state: "Maharashtra" }[];
  talukas: { id: string; name: string; districtId: string }[];
  villages: { id: string; name: string; talukaId: string }[];
}

export { LOCATION_DATA };

const normalize = (value: string) => value.trim().replace(/\s+/g, " ").toLocaleLowerCase();

export function searchTalukas(query: string, districtId?: string, data = LOCATION_DATA) {
  const districts = new Set(
    data.districts
      .filter((d) => d.state === "Maharashtra" && (!districtId || d.id === districtId))
      .map((d) => d.id),
  );
  return data.talukas.filter(
    (t) => districts.has(t.districtId) && normalize(t.name).includes(normalize(query)),
  );
}

export function searchVillages(query: string, talukaId: string, data = LOCATION_DATA) {
  if (!searchTalukas("", undefined, data).some((t) => t.id === talukaId)) return [];
  return data.villages.filter(
    (v) => v.talukaId === talukaId && normalize(v.name).includes(normalize(query)),
  );
}

/** A village must belong to the selected taluka; IDs only, never names. */
export function validLocation(talukaId: string, villageId: string, data = LOCATION_DATA) {
  return searchVillages("", talukaId, data).some((v) => v.id === villageId);
}

/** Missing or invalid IDs resolve to "Not recorded" instead of throwing. */
export function locationNames(talukaId?: string, villageId?: string) {
  return {
    taluka: LOCATION_DATA.talukas.find((t) => t.id === talukaId)?.name ?? "Not recorded",
    village: LOCATION_DATA.villages.find((v) => v.id === villageId)?.name ?? "Not recorded",
    district:
      LOCATION_DATA.districts.find(
        (d) => d.id === LOCATION_DATA.talukas.find((t) => t.id === talukaId)?.districtId,
      )?.name ?? "Not recorded",
  };
}
