import { z } from "zod";

export const resumeGenerateSchema = z.object({
  jobId: z.string().min(1),
});

export const applyJobSchema = z.object({
  jobId: z.string().min(1),
  manualOverride: z.boolean().optional().default(false),
});

export const hrFindSchema = z.object({
  jobId: z.string().min(1),
});

export const hrFindByDomainSchema = z.object({
  domain: z.string().min(2),
  limit: z.number().int().min(1).max(12).optional(),
});

export const outreachSchema = z.object({
  jobId: z.string().min(1),
  recruiterLeadId: z.string().optional(),
});

export const outreachFromDescriptionSchema = z.object({
  roleDescription: z.string().min(20),
  company: z.string().min(1).optional(),
  jobTitle: z.string().min(1).optional(),
  recruiterName: z.string().min(1).optional(),
});

export const salarySchema = z.object({
  currentCtc: z.number().nonnegative(),
  expectedCtc: z.number().nonnegative(),
  preferredRoles: z.array(z.string()).default([]),
});

export const leadStateSchema = z.object({
  leadId: z.string().min(1),
  state: z.enum(["pending", "action-taken", "finished"]),
});

export const updateJobStatusSchema = z.object({
  status: z.enum([
    "new",
    "applied",
    "in-progress",
    "finished",
    "bookmarked",
    "closed",
  ]),
});
