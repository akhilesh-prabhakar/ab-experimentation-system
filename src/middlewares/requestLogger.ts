import { Request, Response, NextFunction } from 'express';

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(
            JSON.stringify({
                timestamp: new Date().toISOString(),
                method: req.method,
                url: req.originalUrl,
                status: res.statusCode,
                duration_ms: duration,
            })
        );
    });

    next();
}