import { StatusCodes } from "http-status-codes";
export function validateBody(schema) {
    return (request, response, next) => {
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
//# sourceMappingURL=validate.js.map