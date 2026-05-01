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
    // Production-ready CORS configuration
    const allowedOrigins = [
        env.FRONTEND_URL,
        "http://localhost:5173",
        "http://localhost:3000",
    ];
    app.use(cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (mobile apps, curl, server-to-server)
            if (!origin)
                return callback(null, true);
            // Allow configured origins and any *.onrender.com deployment
            if (allowedOrigins.includes(origin) ||
                /\.onrender\.com$/.test(origin) ||
                /\.vercel\.app$/.test(origin) ||
                /\.netlify\.app$/.test(origin)) {
                return callback(null, true);
            }
            callback(new Error(`Origin ${origin} not allowed by CORS`));
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: [
            "Content-Type",
            "Authorization",
            "X-Requested-With",
            "Accept",
            "Origin",
        ],
        exposedHeaders: ["Content-Disposition"],
        maxAge: 86400, // Cache preflight for 24 hours
    }));
    // Explicitly handle OPTIONS preflight requests
    app.options("*", cors());
    app.use(express.json({ limit: "5mb" }));
    app.use(express.urlencoded({ extended: true }));
    app.use((request, _response, next) => {
        logger.debug({
            method: request.method,
            path: request.path,
        }, "Incoming request");
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
//# sourceMappingURL=app.js.map