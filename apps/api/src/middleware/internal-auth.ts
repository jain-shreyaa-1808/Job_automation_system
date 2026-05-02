import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { env } from "../config/env.js";

export function requireInternalToken(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  const configuredToken = env.INTERNAL_API_TOKEN;
  if (!configuredToken) {
    response
      .status(StatusCodes.SERVICE_UNAVAILABLE)
      .json({ message: "Internal API token is not configured" });
    return;
  }

  const providedToken = request.headers["x-internal-token"];
  if (providedToken !== configuredToken) {
    response
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Invalid internal token" });
    return;
  }

  next();
}
