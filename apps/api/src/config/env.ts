import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { z } from "zod";

const emptyStringToUndefined = (value: unknown) => {
  if (typeof value === "string" && value.trim() === "") {
    return undefined;
  }
  return value;
};

// Load .env from project root - works both in dev (workspace) and production
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../../../.env") });
dotenv.config(); // also try cwd for production (Render sets env vars directly)

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().default(4000),
  API_PREFIX: z.string().default("/api/v1"),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  AES_SECRET: z.string().min(32, "AES_SECRET must be at least 32 characters"),
  REDIS_URL: z.string().optional(),
  RESUME_STORAGE_DIR: z.string().default("uploads"),
  EMAIL_FROM: z.string().default("no-reply@example.com"),
  SMTP_HOST: z.string().default("localhost"),
  SMTP_PORT: z.coerce.number().default(1025),
  SMTP_USER: z.string().default(""),
  SMTP_PASS: z.string().default(""),
  FRONTEND_URL: z.string().default("http://localhost:5173"),
  JOB_SOURCE_MODE: z.enum(["mock", "remote"]).default("mock"),
  JOB_PROVIDER_URL: z.preprocess(
    emptyStringToUndefined,
    z.string().url().optional(),
  ),
  GREENHOUSE_BOARD_TOKENS: z.preprocess(
    emptyStringToUndefined,
    z.string().optional(),
  ),
  WORKDAY_BOARD_URLS: z.preprocess(
    emptyStringToUndefined,
    z.string().optional(),
  ),
  PUBLIC_JOB_SCRAPE_SOURCES: z.preprocess(
    emptyStringToUndefined,
    z.string().optional(),
  ),
  PUBLIC_JOB_SCRAPE_PAGES: z.coerce.number().int().min(1).max(5).default(2),
  MYJOBAI_SEARCH_URL: z.preprocess(
    emptyStringToUndefined,
    z.string().url().optional(),
  ),
  GOOGLE_CSE_API_KEY: z.preprocess(
    emptyStringToUndefined,
    z.string().min(1).optional(),
  ),
  GOOGLE_CSE_ENGINE_ID: z.preprocess(
    emptyStringToUndefined,
    z.string().min(1).optional(),
  ),
  GOOGLE_CSE_TARGET_SITES: z.preprocess(
    emptyStringToUndefined,
    z.string().optional(),
  ),
  INTERNAL_API_TOKEN: z.preprocess(
    emptyStringToUndefined,
    z.string().min(16).optional(),
  ),
  AI_SIDECAR_URL: z.preprocess(
    emptyStringToUndefined,
    z.string().url().optional(),
  ),
  AI_SIDECAR_TIMEOUT_MS: z.coerce.number().int().min(1000).default(30000),
  AI_MODEL_API_URL: z.preprocess(
    emptyStringToUndefined,
    z.string().url().optional(),
  ),
  AI_MODEL_API_KEY: z.preprocess(emptyStringToUndefined, z.string().optional()),
  AI_MODEL_NAME: z.preprocess(
    emptyStringToUndefined,
    z.string().default("gpt-4.1-mini"),
  ),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(`Invalid environment configuration: ${parsed.error.message}`);
}

export const env = parsed.data;
