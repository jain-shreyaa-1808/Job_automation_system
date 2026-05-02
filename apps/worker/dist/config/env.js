import dotenv from "dotenv";
import path from "path";
import { z } from "zod";
dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });
const envSchema = z.object({
    NODE_ENV: z
        .enum(["development", "test", "production"])
        .default("development"),
    REDIS_URL: z.string().default("redis://127.0.0.1:6379"),
    API_BASE_URL: z.string().default("http://localhost:4000/api/v1"),
    INTERNAL_API_TOKEN: z.string().optional(),
    SCRAPE_REFRESH_INTERVAL_MINUTES: z.coerce.number().default(0),
    PLAYWRIGHT_HEADLESS: z.coerce.boolean().default(true),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    throw new Error(`Invalid worker environment: ${parsed.error.message}`);
}
export const env = parsed.data;
//# sourceMappingURL=env.js.map