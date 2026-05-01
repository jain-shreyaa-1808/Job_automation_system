import { env } from "../config/env.js";
let connection;
export function getRedisConnection() {
    if (!env.REDIS_URL) {
        throw new Error("REDIS_URL is not configured");
    }
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
//# sourceMappingURL=redis.js.map