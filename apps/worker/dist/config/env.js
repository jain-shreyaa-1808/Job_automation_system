import dotenv from "dotenv";
import { z } from "zod";
dotenv.config();
const envSchema = z.object({
    NODE_ENV: z
        .enum(["development", "test", "production"])
        .default("development"),
    REDIS_URL: z.string().default("redis://127.0.0.1:6379"),
    API_BASE_URL: z.string().default("http://localhost:4000/api/v1"),
    PLAYWRIGHT_HEADLESS: z.coerce.boolean().default(true),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    throw new Error(`Invalid worker environment: ${parsed.error.message}`);
}
export const env = parsed.data;
//# sourceMappingURL=env.js.map