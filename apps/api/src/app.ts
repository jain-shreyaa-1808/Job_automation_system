import cors from "cors";
import express from "express";
import helmet from "helmet";

import { env } from "./config/env.js";
import { logger } from "./lib/logger.js";
import { errorHandler } from "./middleware/error-handler.js";
import { apiRouter } from "./routes/index.js";
import { healthRouter } from "./routes/health.routes.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: [
        env.FRONTEND_URL,
        "http://localhost:5173",
        /\.onrender\.com$/,
      ],
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "5mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use((request, _response, next) => {
    logger.debug(
      {
        method: request.method,
        path: request.path,
      },
      "Incoming request",
    );
    next();
  });

  app.get("/", (_request, response) => {
    response.json({
      name: "AI Job Search Automation Platform",
      version: "1.0.0",
      apiPrefix: env.API_PREFIX,
    });
  });

  app.use(`${env.API_PREFIX}/health`, healthRouter);
  app.use(env.API_PREFIX, apiRouter);
  app.use(errorHandler);

  return app;
}
