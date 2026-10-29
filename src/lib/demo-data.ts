// All records are FICTIONAL demonstration data. Replace with backend calls later.

export type ProjectStage =
  "Feasibility" | "Pre-approval" | "Approval in progress" | "Construction" | "Completion";
export type ProjectStatus = "Active" | "On hold" | "Completed";

export interface Project {
  id: string;
  name: string;
  location: string;
  type: string;
  stage: ProjectStage;
  status: ProjectStatus;
  owner: string;
  team: string[];
  description: string;
  talukaId?: string;
  villageId?: string;
  workflowStatus?: string;
  preApprovalOptions?: string[];
}

export type ReqStatus =
  | "Not started"
  | "In progress"
  | "Submitted"
  | "Changes requested"
  | "Approved"
  | "Not applicable"
  | "Needs verification";

export interface Requirement {
  id: string;
  projectId: string;
  name: string;
  category: string;
  applicability: "Applicable" | "Needs review";
  status: ReqStatus;
  responsible: string;
  dueDate: string;
  evidence: "Not uploaded" | "Draft" | "Uploaded" | "Expired";
  sourceRef: string;
  lastVerified: string | null;
  templateKey?: string;
  notes?: string;
}

export interface DocumentRecord {
  id: string;
  name: string;
  requirementId: string;
  projectId: string;
  version: string;
  status: "Pending" | "Received" | "Under review" | "Expired";
  dateAdded: string;
  reviewDate: string | null;
}

export type TaskStatus = "Open" | "In progress" | "Blocked" | "Completed";
export interface Task {
  id: string;
  title: string;
  projectId: string;
  requirementId: string;
  responsible: string;
  dueDate: string;
  priority: "High" | "Medium" | "Low";
  status: TaskStatus;
  workflowStep?: number;
}

export interface Approval {
  id: string;
  reference: string;
  projectId: string;
  submitted: string;
  status:
    | "Draft"
    | "Submitted"
    | "Query raised"
    | "Under review"
    | "Granted (recorded)"
    | "Rejected"
    | "Document Reassignment"
    | "Forwarded Proposal"
    | "Reassign Proposal"
    | "Rejected Proposal"
    | "In Process";
  pendingAction: string;
  responsible: string;
  nextFollowUp: string;
}

export interface Activity {
  id: string;
  projectId: string;
  text: string;
  who: string;
  when: string;
}

// Fixed "today" so demo overdue/upcoming values are stable.
export const DEMO_TODAY = "2026-10-19";

export const TEAM = ["Ananya Rao", "Vikram Mehta", "Priya Nair", "Arjun Kapoor", "Sneha Iyer"];

export const PROJECT_TYPES = ["Residential", "Commercial", "Mixed-use", "Plotted development"];
export const STAGES: ProjectStage[] = [
  "Feasibility",
  "Pre-approval",
  "Approval in progress",
  "Construction",
  "Completion",
];

export const projects: Project[] = [
  {
    id: "p1",
    name: "Sample Greens Residency",
    location: "Demo City North (fictional)",
    type: "Residential",
    stage: "Approval in progress",
    status: "Active",
    owner: "Ananya Rao",
    team: ["Ananya Rao", "Vikram Mehta"],
    description: "Fictional 4-tower residential project used for demonstration.",
  },
  {
    id: "p2",
    name: "Example Trade Centre",
    location: "Placeholder District (fictional)",
    type: "Commercial",
    stage: "Pre-approval",
    status: "Active",
    owner: "Vikram Mehta",
    team: ["Vikram Mehta", "Priya Nair"],
    description: "Fictional commercial office block.",
  },
  {
    id: "p3",
    name: "Mock Lakeview Plots",
    location: "Sampletown East (fictional)",
    type: "Plotted development",
    stage: "Feasibility",
    status: "Active",
    owner: "Priya Nair",
    team: ["Priya Nair"],
    description: "Fictional plotted layout, early feasibility.",
  },
  {
    id: "p4",
    name: "Demo Heights Mixed-use",
    location: "Testville Central (fictional)",
    type: "Mixed-use",
    stage: "Construction",
    status: "Active",
    owner: "Arjun Kapoor",
    team: ["Arjun Kapoor", "Sneha Iyer"],
    description: "Fictional retail-plus-residential development.",
  },
  {
    id: "p5",
    name: "Specimen Courtyard Homes",
    location: "Demo City South (fictional)",
    type: "Residential",
    stage: "Completion",
    status: "On hold",
    owner: "Sneha Iyer",
    team: ["Sneha Iyer", "Ananya Rao"],
    description: "Fictional low-rise housing, currently on hold.",
  },
];

const R = (
  id: string,
  projectId: string,
  name: string,
  category: string,
  status: ReqStatus,
  responsible: string,
  dueDate: string,
  evidence: Requirement["evidence"],
  lastVerified: string | null,
  applicability: Requirement["applicability"] = "Applicable",
): Requirement => ({
  id,
  projectId,
  name: `${name} (example)`,
  category,
  applicability,
  status,
  responsible,
  dueDate,
  evidence,
  sourceRef: `Illustrative ref EX-${id.toUpperCase()} — verify against official source`,
  lastVerified,
});

export const requirements: Requirement[] = [
  R(
    "r1",
    "p1",
    "Land title documentation",
    "Land & title",
    "Approved",
    "Ananya Rao",
    "2026-08-10",
    "Uploaded",
    "2026-09-02",
  ),
  R(
    "r2",
    "p1",
    "Site plan submission",
    "Planning",
    "Submitted",
    "Vikram Mehta",
    "2026-10-05",
    "Uploaded",
    "2026-10-06",
  ),
  R(
    "r3",
    "p1",
    "Environmental assessment",
    "Environment",
    "Changes requested",
    "Ananya Rao",
    "2026-10-12",
    "Draft",
    null,
  ),
  R(
    "r4",
    "p1",
    "Fire safety review",
    "Safety",
    "In progress",
    "Vikram Mehta",
    "2026-10-28",
    "Not uploaded",
    null,
  ),
  R(
    "r5",
    "p1",
    "Structural design certificate",
    "Engineering",
    "Needs verification",
    "Ananya Rao",
    "2026-11-15",
    "Uploaded",
    null,
    "Needs review",
  ),
  R(
    "r6",
    "p2",
    "Zoning confirmation",
    "Planning",
    "In progress",
    "Priya Nair",
    "2026-10-15",
    "Not uploaded",
    null,
  ),
  R(
    "r7",
    "p2",
    "Traffic impact note",
    "Infrastructure",
    "Not started",
    "Vikram Mehta",
    "2026-11-05",
    "Not uploaded",
    null,
    "Needs review",
  ),
  R(
    "r8",
    "p2",
    "Land title documentation",
    "Land & title",
    "Approved",
    "Priya Nair",
    "2026-07-30",
    "Uploaded",
    "2026-08-12",
  ),
  R(
    "r9",
    "p3",
    "Layout plan draft",
    "Planning",
    "Not started",
    "Priya Nair",
    "2026-11-20",
    "Not uploaded",
    null,
  ),
  R(
    "r10",
    "p3",
    "Drainage study",
    "Infrastructure",
    "Needs verification",
    "Priya Nair",
    "2026-12-01",
    "Draft",
    null,
    "Needs review",
  ),
  R(
    "r11",
    "p4",
    "Building plan sanction record",
    "Planning",
    "Approved",
    "Arjun Kapoor",
    "2026-05-12",
    "Uploaded",
    "2026-06-01",
  ),
  R(
    "r12",
    "p4",
    "Construction safety plan",
    "Safety",
    "Submitted",
    "Sneha Iyer",
    "2026-10-25",
    "Uploaded",
    null,
  ),
  R(
    "r13",
    "p4",
    "Water connection application",
    "Utilities",
    "In progress",
    "Arjun Kapoor",
    "2026-10-10",
    "Expired",
    null,
  ),
  R(
    "r14",
    "p4",
    "Signage design",
    "Planning",
    "Not applicable",
    "Sneha Iyer",
    "2026-12-10",
    "Not uploaded",
    "2026-09-20",
  ),
  R(
    "r15",
    "p5",
    "Completion documentation",
    "Completion",
    "Changes requested",
    "Sneha Iyer",
    "2026-10-01",
    "Draft",
    null,
  ),
  R(
    "r16",
    "p5",
    "Occupancy readiness checklist",
    "Completion",
    "Not started",
    "Ananya Rao",
    "2026-11-30",
    "Not uploaded",
    null,
  ),
];

export const documents: DocumentRecord[] = [
  {
    id: "d1",
    name: "Title_Deed_Sample.pdf",
    requirementId: "r1",
    projectId: "p1",
    version: "v2",
    status: "Received",
    dateAdded: "2026-08-08",
    reviewDate: null,
  },
  {
    id: "d2",
    name: "Site_Plan_Demo.dwg",
    requirementId: "r2",
    projectId: "p1",
    version: "v3",
    status: "Under review",
    dateAdded: "2026-10-04",
    reviewDate: "2026-11-04",
  },
  {
    id: "d3",
    name: "Env_Assessment_Draft.docx",
    requirementId: "r3",
    projectId: "p1",
    version: "v1",
    status: "Pending",
    dateAdded: "2026-10-09",
    reviewDate: null,
  },
  {
    id: "d4",
    name: "Structural_Cert_Example.pdf",
    requirementId: "r5",
    projectId: "p1",
    version: "v1",
    status: "Received",
    dateAdded: "2026-10-11",
    reviewDate: "2027-10-11",
  },
  {
    id: "d5",
    name: "Title_Records_TradeCentre.pdf",
    requirementId: "r8",
    projectId: "p2",
    version: "v1",
    status: "Received",
    dateAdded: "2026-07-28",
    reviewDate: null,
  },
  {
    id: "d6",
    name: "Drainage_Study_Draft.pdf",
    requirementId: "r10",
    projectId: "p3",
    version: "v1",
    status: "Pending",
    dateAdded: "2026-10-14",
    reviewDate: null,
  },
  {
    id: "d7",
    name: "Plan_Sanction_Record.pdf",
    requirementId: "r11",
    projectId: "p4",
    version: "v1",
    status: "Received",
    dateAdded: "2026-05-10",
    reviewDate: "2027-05-10",
  },
  {
    id: "d8",
    name: "Water_Application_Old.pdf",
    requirementId: "r13",
    projectId: "p4",
    version: "v1",
    status: "Expired",
    dateAdded: "2025-09-01",
    reviewDate: "2026-09-01",
  },
  {
    id: "d9",
    name: "Completion_Pack_Draft.zip",
    requirementId: "r15",
    projectId: "p5",
    version: "v2",
    status: "Under review",
    dateAdded: "2026-09-25",
    reviewDate: null,
  },
];

export const tasks: Task[] = [
  {
    id: "t1",
    title: "Address reviewer comments on environmental assessment",
    projectId: "p1",
    requirementId: "r3",
    responsible: "Ananya Rao",
    dueDate: "2026-10-14",
    priority: "High",
    status: "Open",
  },
  {
    id: "t2",
    title: "Collect fire safety consultant report",
    projectId: "p1",
    requirementId: "r4",
    responsible: "Vikram Mehta",
    dueDate: "2026-10-24",
    priority: "Medium",
    status: "In progress",
  },
  {
    id: "t3",
    title: "Verify structural certificate against source",
    projectId: "p1",
    requirementId: "r5",
    responsible: "Ananya Rao",
    dueDate: "2026-10-30",
    priority: "Medium",
    status: "Open",
  },
  {
    id: "t4",
    title: "Draft zoning confirmation request",
    projectId: "p2",
    requirementId: "r6",
    responsible: "Priya Nair",
    dueDate: "2026-10-15",
    priority: "High",
    status: "In progress",
  },
  {
    id: "t5",
    title: "Confirm whether traffic note applies",
    projectId: "p2",
    requirementId: "r7",
    responsible: "Vikram Mehta",
    dueDate: "2026-10-27",
    priority: "Low",
    status: "Open",
  },
  {
    id: "t6",
    title: "Renew water connection application",
    projectId: "p4",
    requirementId: "r13",
    responsible: "Arjun Kapoor",
    dueDate: "2026-10-12",
    priority: "High",
    status: "Open",
  },
  {
    id: "t7",
    title: "Upload signed safety plan",
    projectId: "p4",
    requirementId: "r12",
    responsible: "Sneha Iyer",
    dueDate: "2026-10-20",
    priority: "Medium",
    status: "Completed",
  },
  {
    id: "t8",
    title: "Revise completion documentation",
    projectId: "p5",
    requirementId: "r15",
    responsible: "Sneha Iyer",
    dueDate: "2026-10-05",
    priority: "High",
    status: "Open",
  },
  {
    id: "t9",
    title: "Scope drainage study inputs",
    projectId: "p3",
    requirementId: "r10",
    responsible: "Priya Nair",
    dueDate: "2026-11-02",
    priority: "Low",
    status: "Open",
  },
];

export const approvals: Approval[] = [
  {
    id: "a1",
    reference: "DEMO-APP-0142",
    projectId: "p1",
    submitted: "2026-10-05",
    status: "Under review",
    pendingAction: "Await reviewer feedback on site plan",
    responsible: "Vikram Mehta",
    nextFollowUp: "2026-10-26",
  },
  {
    id: "a2",
    reference: "DEMO-APP-0139",
    projectId: "p1",
    submitted: "2026-09-20",
    status: "Query raised",
    pendingAction: "Respond to environmental query",
    responsible: "Ananya Rao",
    nextFollowUp: "2026-10-21",
  },
  {
    id: "a3",
    reference: "DEMO-APP-0151",
    projectId: "p2",
    submitted: "",
    status: "Draft",
    pendingAction: "Complete zoning request draft",
    responsible: "Priya Nair",
    nextFollowUp: "2026-10-22",
  },
  {
    id: "a4",
    reference: "DEMO-APP-0098",
    projectId: "p4",
    submitted: "2026-04-28",
    status: "Granted (recorded)",
    pendingAction: "None — archive record",
    responsible: "Arjun Kapoor",
    nextFollowUp: "2026-12-01",
  },
  {
    id: "a5",
    reference: "DEMO-APP-0160",
    projectId: "p4",
    submitted: "2026-10-18",
    status: "Submitted",
    pendingAction: "Confirm acknowledgement received",
    responsible: "Sneha Iyer",
    nextFollowUp: "2026-10-23",
  },
  {
    id: "a6",
    reference: "DEMO-APP-0120",
    projectId: "p5",
    submitted: "2026-09-28",
    status: "Query raised",
    pendingAction: "Resubmit completion pack",
    responsible: "Sneha Iyer",
    nextFollowUp: "2026-10-16",
  },
];

export const activity: Activity[] = [
  {
    id: "ac1",
    projectId: "p4",
    text: "Approval DEMO-APP-0160 marked as submitted",
    who: "Sneha Iyer",
    when: "2026-10-18",
  },
  {
    id: "ac2",
    projectId: "p3",
    text: "Drainage study draft added to register",
    who: "Priya Nair",
    when: "2026-10-14",
  },
  {
    id: "ac3",
    projectId: "p1",
    text: "Changes requested on environmental assessment",
    who: "Ananya Rao",
    when: "2026-10-12",
  },
  {
    id: "ac4",
    projectId: "p1",
    text: "Structural certificate uploaded — awaiting verification",
    who: "Ananya Rao",
    when: "2026-10-11",
  },
  {
    id: "ac5",
    projectId: "p1",
    text: "Site plan v3 submitted",
    who: "Vikram Mehta",
    when: "2026-10-04",
  },
  {
    id: "ac6",
    projectId: "p5",
    text: "Project placed on hold",
    who: "Sneha Iyer",
    when: "2026-09-30",
  },
];

export const COMPLETE_STATUSES: ReqStatus[] = ["Approved", "Not applicable"];

// Fictional templates adapted from this demo's existing examples, NOT statutory requirements.
export interface ChecklistTemplateItem {
  key: string;
  name: string;
  category: string;
  notes: string;
  stage?: ProjectStage;
  requiredForTemplate: boolean;
}
export const CHECKLIST_TEMPLATES: Record<string, ChecklistTemplateItem[]> = {
  Residential: [
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
  Commercial: [
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
  "Plotted development": [
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
};
// Mixed-use intentionally has no template: never invent requirements to fill a gap.
export const PRE_APPROVAL_STEPS = [
  "Engineer Drawing",
  "Tracing",
  "DSC on Application Form and Documents",
  "Pre-Payment",
] as const;
