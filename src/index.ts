import app from './app';

const PORT = process.env.PORT || 8080;

const server = app.listen(PORT, () => {
    console.log(
        JSON.stringify({
            timestamp: new Date().toISOString(),
            level: 'info',
            message: `Server started`,
            port: PORT,
        })
    );
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'info',
        message: 'SIGTERM received, shutting down gracefully',
    }));

    server.close(() => {
        console.log(JSON.stringify({
            timestamp: new Date().toISOString(),
            level: 'info',
            message: 'Server closed',
        }));
        process.exit(0);
    });
});

export default server;