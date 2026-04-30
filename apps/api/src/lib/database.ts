import mongoose from "mongoose";

import { env } from "../config/env.js";
import { logger } from "./logger.js";

export async function connectDatabase(): Promise<void> {
  try {
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    logger.info("Connected to MongoDB");
  } catch (error) {
    logger.error({ error }, "MongoDB connection failed");
    throw error;
  }
}
