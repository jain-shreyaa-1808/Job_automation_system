import { z } from "zod";
export declare const signupSchema: z.ZodObject<{
    fullName: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    currentCtc: z.ZodOptional<z.ZodNumber>;
    expectedCtc: z.ZodOptional<z.ZodNumber>;
    preferredRoles: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    preferredLocations: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    password: string;
    fullName: string;
    email: string;
    preferredRoles: string[];
    preferredLocations: string[];
    currentCtc?: number | undefined;
    expectedCtc?: number | undefined;
}, {
    password: string;
    fullName: string;
    email: string;
    currentCtc?: number | undefined;
    expectedCtc?: number | undefined;
    preferredRoles?: string[] | undefined;
    preferredLocations?: string[] | undefined;
}>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    password: string;
    email: string;
}, {
    password: string;
    email: string;
}>;
