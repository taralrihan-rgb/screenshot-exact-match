// Zod input validation — single source of truth for create/register inputs.
import { z } from "zod";
import { PROJECT_TYPES, STAGES, TEAM, type ProjectStage } from "./demo-data";

export const projectInputSchema = z.object({
  name: z.string().trim().min(3, "Enter a project name (min 3 characters)."),
  location: z.string().trim().min(1, "Enter a location."),
  type: z.string().refine((v) => PROJECT_TYPES.includes(v), "Choose a project type."),
  stage: z.enum(STAGES as [ProjectStage, ...ProjectStage[]], { message: "Choose a stage." }),
  owner: z.string().refine((v) => TEAM.includes(v), "Assign a team member."),
  description: z.string(),
  talukaId: z.string().min(1),
  villageId: z.string().min(1),
  preApprovalOptions: z.array(z.string()).optional(),
});

/** Strict YYYY-MM-DD validation; Date.parse alone normalizes impossible days. */
export function isValidCalendarDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(`${value}T00:00:00Z`);
  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() + 1 === month &&
    parsed.getUTCDate() === day
  );
}

export const calendarDateSchema = z
  .string()
  .refine(isValidCalendarDate, "Enter a valid calendar date.");

export const taskDeadlineSchema = z
  .string()
  .refine((value) => value === "" || isValidCalendarDate(value), "Enter a valid calendar date.");

export const documentMetadataSchema = z.object({
  name: z.string().trim().min(3, "Enter a document name (min 3 characters)."),
  projectId: z.string().min(1, "Choose a project."),
  requirementId: z.string().min(1, "Choose a requirement."),
  version: z.string().trim().min(1, "Enter a version label."),
  status: z.enum(["Pending", "Received", "Under review", "Expired"]),
  reviewDate: calendarDateSchema.nullable(),
});

export type DocumentMetadataInput = z.infer<typeof documentMetadataSchema>;

/** Throws an Error with the first validation message, for toast display. */
export function parseOrThrow<S extends z.ZodType>(schema: S, input: unknown): z.infer<S> {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new Error(result.error.issues[0]?.message ?? "Invalid input.");
  }
  return result.data;
}
