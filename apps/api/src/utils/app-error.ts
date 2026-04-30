import { StatusCodes } from "http-status-codes";

export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR,
  ) {
    super(message);
    this.name = "AppError";
  }

  static notFound(message = "Resource not found") {
    return new AppError(message, StatusCodes.NOT_FOUND);
  }

  static badRequest(message = "Bad request") {
    return new AppError(message, StatusCodes.BAD_REQUEST);
  }

  static conflict(message = "Conflict") {
    return new AppError(message, StatusCodes.CONFLICT);
  }
}
