import { z } from "zod";
export declare const settingsSchema: z.ZodObject<{
    currentCtc: z.ZodOptional<z.ZodNumber>;
    expectedCtc: z.ZodOptional<z.ZodNumber>;
    preferredRoles: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    preferredLocations: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    autoApplyEnabled: z.ZodOptional<z.ZodBoolean>;
    portalCredentials: z.ZodOptional<z.ZodArray<z.ZodObject<{
        platform: z.ZodString;
        username: z.ZodString;
        password: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        platform: string;
        username: string;
        password: string;
    }, {
        platform: string;
        username: string;
        password: string;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    currentCtc?: number | undefined;
    expectedCtc?: number | undefined;
    preferredRoles?: string[] | undefined;
    preferredLocations?: string[] | undefined;
    autoApplyEnabled?: boolean | undefined;
    portalCredentials?: {
        platform: string;
        username: string;
        password: string;
    }[] | undefined;
}, {
    currentCtc?: number | undefined;
    expectedCtc?: number | undefined;
    preferredRoles?: string[] | undefined;
    preferredLocations?: string[] | undefined;
    autoApplyEnabled?: boolean | undefined;
    portalCredentials?: {
        platform: string;
        username: string;
        password: string;
    }[] | undefined;
}>;
