// Activity event model and factory. Local events use real timestamps.
// This is NOT a secure or immutable audit log — real audit guarantees
// will be implemented through the backend.
import { DEMO_ORGANISATION, DEMO_SESSION_USER, type UserProfile } from "./types";

export const ACTIVITY_EVENT_TYPES = [
  "project.created",
  "project.location_updated",
  "requirement.status_updated",
  "requirement.responsibility_changed",
  "task.created",
  "task.status_updated",
  "task.responsibility_changed",
  "task.deadline_changed",
  "approval.status_updated",
  "document.registered",
  "document.updated",
] as const;
export type ActivityEventType = (typeof ACTIVITY_EVENT_TYPES)[number];

export type ActivityEntityType = "project" | "requirement" | "task" | "approval" | "document";

export interface ActivityEventInput {
  type: ActivityEventType;
  projectId: string;
  entityType: ActivityEntityType;
  entityId: string;
  text: string;
  actor?: UserProfile;
}

export function makeActivityEvent(input: ActivityEventInput) {
  const actor = input.actor ?? DEMO_SESSION_USER;
  const now = new Date();
  return {
    id: crypto.randomUUID(),
    organisationId: DEMO_ORGANISATION.id,
    projectId: input.projectId,
    type: input.type,
    entityType: input.entityType,
    entityId: input.entityId,
    text: input.text,
    actorUserId: actor.id,
    who: actor.displayName,
    timestamp: now.toISOString(),
    when: now.toISOString().slice(0, 10),
  };
}
