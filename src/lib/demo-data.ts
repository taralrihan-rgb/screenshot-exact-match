// All records are FICTIONAL demonstration data. Replace with backend calls later.
import { DEMO_ORGANISATION, DEMO_USERS } from "./types";
import type { ActivityEventType, ActivityEntityType } from "./activity";

export type ProjectStage =
  "Feasibility" | "Pre-approval" | "Approval in progress" | "Construction" | "Completion";
export type ProjectStatus = "Active" | "On hold" | "Completed";

export interface Project {
  id: string;
  /** Tenant placeholder — every record belongs to an organisation in the future model. */
  organisationId?: string;
  name: string;
  location: string;
  type: string;
  stage: ProjectStage;
  status: ProjectStatus;
  /** Display name today; migrate to ownerUserId with the backend. */
  owner: string;
  ownerUserId?: string | null;
  team: string[];
  description: string;
  talukaId?: string | undefined;
  villageId?: string | undefined;
  workflowStatus?: string;
  preApprovalOptions?: string[] | undefined;
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
  /** Applicability — never inferred automatically. */
  applicability: "Applicable" | "Needs review";
  /** Internal workflow status only — NOT legal compliance. */
  status: ReqStatus;
  responsible: string;
  dueDate: string;
  evidence: "Not uploaded" | "Draft" | "Uploaded" | "Expired";
  sourceRef: string;
  /** Verification status: null = never verified by a person. */
  lastVerified: string | null;
  templateKey?: string;
  /** Version of the template this item was generated from. */
  templateVersion?: string;
  /** Required/optional classification within the fictional template. */
  required?: boolean;
  notes?: string;
}

export interface DocumentRecord {
  id: string;
  /** Display name of the document record. */
  name: string;
  /** Original file name metadata (no file is stored in demo mode). */
  fileName: string;
  /** Future private object-storage path. Always null in demo mode — no file exists. */
  storagePath: string | null;
  mimeType: string | null;
  fileSizeBytes: number | null;
  /** Uploader placeholder for the future authenticated user. */
  uploaderUserId: string | null;
  requirementId: string;
  projectId: string;
  version: string;
  status: "Pending" | "Received" | "Under review" | "Expired";
  /** Registration/upload timestamp metadata (fixture date in demo mode). */
  uploadedAt: string;
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
  organisationId: string;
  projectId: string;
  type: ActivityEventType;
  entityType: ActivityEntityType;
  entityId: string;
  /** Human-readable description. */
  text: string;
  /** Stable actor ID placeholder (future authenticated user ID). */
  actorUserId: string;
  /** Actor display name for presentation. */
  who: string;
  /** Real ISO timestamp for new local events; fixture timestamp for demo rows. */
  timestamp: string;
  /** Display date (derived from timestamp for new events). */
  when: string;
}

// Fixture-only anchor date for reproducible demo fixtures. Business
// calculations (overdue, upcoming) must NOT use this — see metrics.ts.
export const DEMO_TODAY = "2026-10-19";

export const TEAM = DEMO_USERS.map((u) => u.displayName);

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
    organisationId: DEMO_ORGANISATION.id,
    name: "Sample Greens Residency",
    location: "Demo City North (fictional)",
    type: "Residential",
    stage: "Approval in progress",
    status: "Active",
    owner: "Ananya Rao",
    ownerUserId: "demo-u-ananya",
    team: ["Ananya Rao", "Vikram Mehta"],
    description: "Fictional 4-tower residential project used for demonstration.",
  },
  {
    id: "p2",
    organisationId: DEMO_ORGANISATION.id,
    name: "Example Trade Centre",
    location: "Placeholder District (fictional)",
    type: "Commercial",
    stage: "Pre-approval",
    status: "Active",
    owner: "Vikram Mehta",
    ownerUserId: "demo-u-vikram",
    team: ["Vikram Mehta", "Priya Nair"],
    description: "Fictional commercial office block.",
  },
  {
    id: "p3",
    organisationId: DEMO_ORGANISATION.id,
    name: "Mock Lakeview Plots",
    location: "Sampletown East (fictional)",
    type: "Plotted development",
    stage: "Feasibility",
    status: "Active",
    owner: "Priya Nair",
    ownerUserId: "demo-u-priya",
    team: ["Priya Nair"],
    description: "Fictional plotted layout, early feasibility.",
  },
  {
    id: "p4",
    organisationId: DEMO_ORGANISATION.id,
    name: "Demo Heights Mixed-use",
    location: "Testville Central (fictional)",
    type: "Mixed-use",
    stage: "Construction",
    status: "Active",
    owner: "Arjun Kapoor",
    ownerUserId: "demo-u-arjun",
    team: ["Arjun Kapoor", "Sneha Iyer"],
    description: "Fictional retail-plus-residential development.",
  },
  {
    id: "p5",
    organisationId: DEMO_ORGANISATION.id,
    name: "Specimen Courtyard Homes",
    location: "Demo City South (fictional)",
    type: "Residential",
    stage: "Completion",
    status: "On hold",
    owner: "Sneha Iyer",
    ownerUserId: "demo-u-sneha",
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

const D = (
  id: string,
  name: string,
  requirementId: string,
  projectId: string,
  version: string,
  status: DocumentRecord["status"],
  dateAdded: string,
  reviewDate: string | null,
  mimeType: string | null,
  fileSizeBytes: number | null,
  uploaderUserId: string | null,
): DocumentRecord => ({
  id,
  name,
  fileName: name,
  storagePath: null, // demo metadata only — no file exists in storage
  mimeType,
  fileSizeBytes,
  uploaderUserId,
  requirementId,
  projectId,
  version,
  status,
  uploadedAt: dateAdded,
  dateAdded,
  reviewDate,
});

export const documents: DocumentRecord[] = [
  D(
    "d1",
    "Title_Deed_Sample.pdf",
    "r1",
    "p1",
    "v2",
    "Received",
    "2026-08-08",
    null,
    "application/pdf",
    482_000,
    "demo-u-ananya",
  ),
  D(
    "d2",
    "Site_Plan_Demo.dwg",
    "r2",
    "p1",
    "v3",
    "Under review",
    "2026-10-04",
    "2026-11-04",
    "application/acad",
    1_240_000,
    "demo-u-vikram",
  ),
  D(
    "d3",
    "Env_Assessment_Draft.docx",
    "r3",
    "p1",
    "v1",
    "Pending",
    "2026-10-09",
    null,
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    96_000,
    "demo-u-ananya",
  ),
  D(
    "d4",
    "Structural_Cert_Example.pdf",
    "r5",
    "p1",
    "v1",
    "Received",
    "2026-10-11",
    "2027-10-11",
    "application/pdf",
    210_000,
    "demo-u-ananya",
  ),
  D(
    "d5",
    "Title_Records_TradeCentre.pdf",
    "r8",
    "p2",
    "v1",
    "Received",
    "2026-07-28",
    null,
    "application/pdf",
    388_000,
    "demo-u-priya",
  ),
  D(
    "d6",
    "Drainage_Study_Draft.pdf",
    "r10",
    "p3",
    "v1",
    "Pending",
    "2026-10-14",
    null,
    "application/pdf",
    154_000,
    "demo-u-priya",
  ),
  D(
    "d7",
    "Plan_Sanction_Record.pdf",
    "r11",
    "p4",
    "v1",
    "Received",
    "2026-05-10",
    "2027-05-10",
    "application/pdf",
    502_000,
    "demo-u-arjun",
  ),
  D(
    "d8",
    "Water_Application_Old.pdf",
    "r13",
    "p4",
    "v1",
    "Expired",
    "2025-09-01",
    "2026-09-01",
    "application/pdf",
    88_000,
    "demo-u-arjun",
  ),
  D(
    "d9",
    "Completion_Pack_Draft.zip",
    "r15",
    "p5",
    "v2",
    "Under review",
    "2026-09-25",
    null,
    "application/zip",
    2_140_000,
    "demo-u-sneha",
  ),
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

const A = (
  id: string,
  projectId: string,
  type: Activity["type"],
  entityType: Activity["entityType"],
  entityId: string,
  text: string,
  actorUserId: string,
  when: string,
): Activity => ({
  id,
  organisationId: DEMO_ORGANISATION.id,
  projectId,
  type,
  entityType,
  entityId,
  text,
  actorUserId,
  who: DEMO_USERS.find((u) => u.id === actorUserId)?.displayName ?? "Demo user (fictional)",
  timestamp: `${when}T09:00:00.000Z`,
  when,
});

export const activity: Activity[] = [
  A(
    "ac1",
    "p4",
    "approval.status_updated",
    "approval",
    "a5",
    "Approval DEMO-APP-0160 marked as submitted",
    "demo-u-sneha",
    "2026-10-18",
  ),
  A(
    "ac2",
    "p3",
    "document.registered",
    "document",
    "d6",
    "Drainage study draft added to register",
    "demo-u-priya",
    "2026-10-14",
  ),
  A(
    "ac3",
    "p1",
    "requirement.status_updated",
    "requirement",
    "r3",
    "Changes requested on environmental assessment",
    "demo-u-ananya",
    "2026-10-12",
  ),
  A(
    "ac4",
    "p1",
    "document.registered",
    "document",
    "d4",
    "Structural certificate uploaded — awaiting verification",
    "demo-u-ananya",
    "2026-10-11",
  ),
  A(
    "ac5",
    "p1",
    "requirement.status_updated",
    "requirement",
    "r2",
    "Site plan v3 submitted",
    "demo-u-vikram",
    "2026-10-04",
  ),
  A(
    "ac6",
    "p5",
    "project.location_updated",
    "project",
    "p5",
    "Project placed on hold",
    "demo-u-sneha",
    "2026-09-30",
  ),
];

export const COMPLETE_STATUSES: ReqStatus[] = ["Approved", "Not applicable"];
