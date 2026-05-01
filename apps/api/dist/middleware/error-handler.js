import { StatusCodes } from "http-status-codes";
import { logger } from "../lib/logger.js";
import { AppError } from "../utils/app-error.js";
export function errorHandler(error, _request, response, _next) {
    if (error instanceof AppError) {
        response.status(error.statusCode).json({ message: error.message });
        return;
    }
    logger.error({ error }, "Unhandled request error");
    response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Internal server error",
    });
}
//# sourceMappingURL=error-handler.js.map