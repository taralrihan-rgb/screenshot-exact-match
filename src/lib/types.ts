// Future-facing identity and tenancy model for the Supabase backend.
// All demo identities below are FICTIONAL. No authentication exists yet.

export interface Organisation {
  id: string;
  name: string;
  fictional: true;
}

export interface UserProfile {
  id: string;
  displayName: string;
  fictional: true;
}

/**
 * INTEGRATION POINT — the four application roles are intentionally NOT
 * defined here. Replace this placeholder with the approved permission
 * model (role names + rules) before backend/RLS work begins. Client-side
 * role checks must never be treated as security; enforcement belongs in
 * backend Row Level Security.
 */
export type AppRole = string;

export interface OrganisationMembership {
  organisationId: string;
  userId: string;
  role: AppRole;
}

/** A project may have multiple assigned members (future project-level access). */
export interface ProjectMembership {
  projectId: string;
  userId: string;
}

export const DEMO_ORGANISATION: Organisation = {
  id: "demo-org",
  name: "Demo Organisation (fictional)",
  fictional: true,
};

/** Stable fictional user IDs — display names are presentation only. */
export const DEMO_USERS: UserProfile[] = [
  { id: "demo-u-ananya", displayName: "Ananya Rao", fictional: true },
  { id: "demo-u-vikram", displayName: "Vikram Mehta", fictional: true },
  { id: "demo-u-priya", displayName: "Priya Nair", fictional: true },
  { id: "demo-u-arjun", displayName: "Arjun Kapoor", fictional: true },
  { id: "demo-u-sneha", displayName: "Sneha Iyer", fictional: true },
];

/** Placeholder actor for local demo mutations until real authentication exists. */
export const DEMO_SESSION_USER: UserProfile = {
  id: "demo-session-user",
  displayName: "Demo user (fictional)",
  fictional: true,
};

export function demoUserId(displayName: string): string | null {
  return DEMO_USERS.find((u) => u.displayName === displayName)?.id ?? null;
}
