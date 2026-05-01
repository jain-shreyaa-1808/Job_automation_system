import { z } from "zod";
export const settingsSchema = z.object({
    currentCtc: z.number().nonnegative().optional(),
    expectedCtc: z.number().nonnegative().optional(),
    preferredRoles: z.array(z.string()).optional(),
    preferredLocations: z.array(z.string()).optional(),
    autoApplyEnabled: z.boolean().optional(),
    portalCredentials: z
        .array(z.object({
        platform: z.string().min(2),
        username: z.string().min(2),
        password: z.string().min(1),
    }))
        .optional(),
});
//# sourceMappingURL=settings.validator.js.map