// Checklist template configuration — separated from generated project
// requirements. Fictional templates adapted from this demo's existing
// examples, NOT statutory requirements. Mixed-use intentionally has no
// template: never invent requirements to fill a gap.
import type { ProjectStage } from "./demo-data";

export interface ChecklistTemplateItem {
  key: string;
  name: string;
  category: string;
  notes: string;
  stage?: ProjectStage;
  /** Required/optional classification within the fictional template only —
   *  never means legally required. */
  requiredForTemplate: boolean;
}

export interface ChecklistTemplate {
  /** Template version, preserved on every generated requirement. */
  version: string;
  items: ChecklistTemplateItem[];
}

export const CHECKLIST_TEMPLATES: Record<string, ChecklistTemplate> = {
  Residential: {
    version: "demo-residential-v1",
    items: [
      {
        key: "title",
        name: "Land title documentation (example)",
        category: "Land & title",
        notes: "Fictional example — applicability and source require professional review.",
        requiredForTemplate: true,
      },
      {
        key: "site-plan",
        name: "Site plan submission (example)",
        category: "Planning",
        notes: "Fictional example — not an official Maharashtra document list.",
        requiredForTemplate: true,
      },
    ],
  },
  Commercial: {
    version: "demo-commercial-v1",
    items: [
      {
        key: "title",
        name: "Land title documentation (example)",
        category: "Land & title",
        notes: "Fictional example — review against official sources.",
        requiredForTemplate: true,
      },
      {
        key: "zoning",
        name: "Zoning confirmation (example)",
        category: "Planning",
        notes: "Fictional example — applicability must be reviewed.",
        requiredForTemplate: true,
      },
    ],
  },
  "Plotted development": {
    version: "demo-plotted-v1",
    items: [
      {
        key: "layout",
        name: "Layout plan draft (example)",
        category: "Planning",
        notes: "Fictional example — applicability must be reviewed.",
        requiredForTemplate: true,
      },
      {
        key: "drainage",
        name: "Drainage study (example)",
        category: "Infrastructure",
        notes: "Optional fictional template item — professional review required.",
        requiredForTemplate: false,
      },
    ],
  },
};

export const PRE_APPROVAL_STEPS = [
  "Engineer Drawing",
  "Tracing",
  "DSC on Application Form and Documents",
  "Pre-Payment",
] as const;
