import { createServer } from "node:http";

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
}

bootstrap().catch((error) => {
  logger.error({ error }, "Failed to bootstrap API");
  process.exitCode = 1;
});
