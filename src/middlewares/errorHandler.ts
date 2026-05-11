import { Request, Response, NextFunction } from 'express';

export function errorHandler(
    err: Error,
    req: Request,
    res: Response,
    _next: NextFunction
): void {
    console.error(
        JSON.stringify({
            timestamp: new Date().toISOString(),
            level: 'error',
            message: err.message,
            stack: err.stack,
            url: req.originalUrl,
        })
    );

    res.status(500).json({
        status: 'error',
        message: 'Internal server error',
        code: 'INTERNAL_ERROR',
    });
}