import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { verifyAccessToken } from "../utils/jwt.js";

export function requireAuth(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  const header = request.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    response
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Missing bearer token" });
    return;
  }

  const token = header.slice("Bearer ".length);

  try {
    request.user = verifyAccessToken(token);
    next();
  } catch {
    response
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Invalid access token" });
  }
}
