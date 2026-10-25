/** Replace this dataset with professionally verified Maharashtra records.
 * IDs link village -> taluka -> district; names are never used as foreign keys.
 * The fictional fixtures are scoped to Maharashtra for interface testing only.
 */
export interface LocationDataset {
  provenance: "fictional" | "verified";
  source: string;
  districts: { id: string; name: string; state: "Maharashtra" }[];
  talukas: { id: string; name: string; districtId: string }[];
  villages: { id: string; name: string; talukaId: string }[];
}
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
const normalize = (value: string) => value.trim().replace(/\s+/g, " ").toLocaleLowerCase();
export function searchTalukas(query: string, districtId?: string, data = LOCATION_DATA) {
  const districts = new Set(data.districts.filter((d) => d.state === "Maharashtra" && (!districtId || d.id === districtId)).map((d) => d.id));
  return data.talukas.filter((t) => districts.has(t.districtId) && normalize(t.name).includes(normalize(query)));
}
export function searchVillages(query: string, talukaId: string, data = LOCATION_DATA) {
  if (!searchTalukas("", undefined, data).some((t) => t.id === talukaId)) return [];
  return data.villages.filter((v) => v.talukaId === talukaId && normalize(v.name).includes(normalize(query)));
}
export function validLocation(talukaId: string, villageId: string, data = LOCATION_DATA) {
  return searchVillages("", talukaId, data).some((v) => v.id === villageId);
}
export function locationNames(talukaId?: string, villageId?: string) {
  return {
    taluka: LOCATION_DATA.talukas.find((t) => t.id === talukaId)?.name ?? "Not recorded",
    village: LOCATION_DATA.villages.find((v) => v.id === villageId)?.name ?? "Not recorded",
    district: LOCATION_DATA.districts.find((d) => d.id === LOCATION_DATA.talukas.find((t) => t.id === talukaId)?.districtId)?.name ?? "Not recorded",
  };
}