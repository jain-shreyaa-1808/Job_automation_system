import type { NextFunction, Request, Response } from "express";
export declare function asyncHandler(handler: (request: Request, response: Response, next: NextFunction) => Promise<unknown>): (request: Request, response: Response, next: NextFunction) => void;
