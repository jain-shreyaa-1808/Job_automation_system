import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";
export declare function validateBody<T>(schema: ZodSchema<T>): (request: Request, response: Response, next: NextFunction) => void;
