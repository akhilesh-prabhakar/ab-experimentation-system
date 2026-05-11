import express, { Application, Request, Response } from 'express';
import experimentRoutes from './routes/experiment.routes';
import { requestLogger } from './middlewares/requestLogger';
import { errorHandler } from './middlewares/errorHandler';

const app: Application = express();

// Middlewares
app.use(express.json());
app.use(requestLogger);

// Health check
app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
        status: 'success',
        message: 'Service is healthy',
        timestamp: new Date().toISOString(),
    });
});

// Routes
app.use('/', experimentRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
    res.status(404).json({
        status: 'error',
        message: 'Route not found',
        code: 'ROUTE_NOT_FOUND',
    });
});

// Global error handler — must be last
app.use(errorHandler);

export default app;