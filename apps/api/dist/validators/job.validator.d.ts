import { z } from "zod";
export declare const resumeGenerateSchema: z.ZodObject<{
    jobId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    jobId: string;
}, {
    jobId: string;
}>;
export declare const applyJobSchema: z.ZodObject<{
    jobId: z.ZodString;
    manualOverride: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    jobId: string;
    manualOverride: boolean;
}, {
    jobId: string;
    manualOverride?: boolean | undefined;
}>;
export declare const hrFindSchema: z.ZodObject<{
    jobId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    jobId: string;
}, {
    jobId: string;
}>;
export declare const outreachSchema: z.ZodObject<{
    jobId: z.ZodString;
    recruiterLeadId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    jobId: string;
    recruiterLeadId?: string | undefined;
}, {
    jobId: string;
    recruiterLeadId?: string | undefined;
}>;
export declare const salarySchema: z.ZodObject<{
    currentCtc: z.ZodNumber;
    expectedCtc: z.ZodNumber;
    preferredRoles: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    currentCtc: number;
    expectedCtc: number;
    preferredRoles: string[];
}, {
    currentCtc: number;
    expectedCtc: number;
    preferredRoles?: string[] | undefined;
}>;
export declare const leadStateSchema: z.ZodObject<{
    leadId: z.ZodString;
    state: z.ZodEnum<["pending", "action-taken", "finished"]>;
}, "strip", z.ZodTypeAny, {
    state: "finished" | "pending" | "action-taken";
    leadId: string;
}, {
    state: "finished" | "pending" | "action-taken";
    leadId: string;
}>;
