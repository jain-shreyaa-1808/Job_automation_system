import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import type { ZodSchema } from "zod";

export function validateBody<T>(schema: ZodSchema<T>) {
  return (request: Request, response: Response, next: NextFunction) => {
    const parsed = schema.safeParse(request.body);

    if (!parsed.success) {
      response.status(StatusCodes.BAD_REQUEST).json({
        message: "Validation failed",
        issues: parsed.error.flatten(),
      });
      return;
    }

    request.body = parsed.data;
    next();
  };
}
