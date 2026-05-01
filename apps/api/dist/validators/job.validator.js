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
export const outreachSchema = z.object({
    jobId: z.string().min(1),
    recruiterLeadId: z.string().optional(),
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
//# sourceMappingURL=job.validator.js.map