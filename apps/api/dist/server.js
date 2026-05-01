import { createServer } from "node:http";
import mongoose from "mongoose";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { connectDatabase } from "./lib/database.js";
import { logger } from "./lib/logger.js";
async function bootstrap() {
    await connectDatabase();
    const app = createApp();
    const server = createServer(app);
    server.listen(env.PORT, () => {
        logger.info(`API listening on port ${env.PORT}`);
    });
    const shutdown = () => {
        server.close(() => {
            mongoose.disconnect().then(() => process.exit(0));
        });
        setTimeout(() => process.exit(1), 3000);
    };
    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
}
bootstrap().catch((error) => {
    logger.error({ error }, "Failed to bootstrap API");
    process.exitCode = 1;
});
//# sourceMappingURL=server.js.map