import { StatusCodes } from "http-status-codes";
export class AppError extends Error {
    statusCode;
    constructor(message, statusCode = StatusCodes.INTERNAL_SERVER_ERROR) {
        super(message);
        this.statusCode = statusCode;
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
//# sourceMappingURL=app-error.js.map