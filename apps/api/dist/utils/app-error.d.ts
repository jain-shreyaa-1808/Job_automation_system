export declare class AppError extends Error {
    readonly statusCode: number;
    constructor(message: string, statusCode?: number);
    static notFound(message?: string): AppError;
    static badRequest(message?: string): AppError;
    static conflict(message?: string): AppError;
}
