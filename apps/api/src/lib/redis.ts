import { env } from "../config/env.js";

let connection:
  | {
      host: string;
      port: number;
      password?: string;
    }
  | undefined;

export function getRedisConnection() {
  if (!connection) {
    const parsed = new URL(env.REDIS_URL);
    connection = {
      host: parsed.hostname,
      port: Number(parsed.port || 6379),
      ...(parsed.password ? { password: parsed.password } : {}),
    };
  }

  return connection;
}
