import { z } from "zod";
export const signupSchema = z.object({
    fullName: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    currentCtc: z.number().nonnegative().optional(),
    expectedCtc: z.number().nonnegative().optional(),
    preferredRoles: z.array(z.string()).default([]),
    preferredLocations: z.array(z.string()).default([]),
});
export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});
//# sourceMappingURL=auth.validator.js.map