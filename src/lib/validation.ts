// Zod input validation — single source of truth for create/register inputs.
import { z } from "zod";
import { PROJECT_TYPES, STAGES, TEAM } from "./demo-data";

export const projectInputSchema = z.object({
  name: z.string().trim().min(3, "Enter a project name (min 3 characters)."),
  location: z.string().trim().min(1, "Enter a location."),
  type: z.string().refine((v) => PROJECT_TYPES.includes(v), "Choose a project type."),
  stage: z.string().refine((v) => (STAGES as string[]).includes(v), "Choose a stage."),
  owner: z.string().refine((v) => TEAM.includes(v), "Assign a team member."),
  description: z.string(),
  talukaId: z.string().min(1),
  villageId: z.string().min(1),
  preApprovalOptions: z.array(z.string()).optional(),
});

export const documentMetadataSchema = z.object({
  name: z.string().trim().min(3, "Enter a document name (min 3 characters)."),
  projectId: z.string().min(1, "Choose a project."),
  requirementId: z.string(),
  version: z.string().trim().min(1, "Enter a version label."),
  status: z.enum(["Pending", "Received", "Under review", "Expired"]),
  reviewDate: z.string().nullable(),
});

/** Throws an Error with the first validation message, for toast display. */
export function parseOrThrow<S extends z.ZodType>(schema: S, input: unknown): z.infer<S> {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new Error(result.error.issues[0]?.message ?? "Invalid input.");
  }
  return result.data;
}
