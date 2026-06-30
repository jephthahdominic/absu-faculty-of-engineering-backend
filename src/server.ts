import './config/environment';
import http from 'http';
import app from './app';
import { connectDatabase, disconnectDatabase } from './config/database';
import { env } from './config/environment';
import { logger } from './utils/logger.util';

const server = http.createServer(app);

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();

    server.listen(env.PORT, "127.0.0.1", () => {
      logger.info(`Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
      logger.info(`API Base URL: http://localhost:${env.PORT}${env.API_PREFIX}`);
      logger.info(`Swagger Docs: http://localhost:${env.PORT}${env.API_PREFIX}/docs`);
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error}`);
    process.exit(1);
  }
};

const gracefulShutdown = async (signal: string): Promise<void> => {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  server.close(async () => {
    logger.info('HTTP server closed');

    await disconnectDatabase();
    logger.info('Graceful shutdown complete');
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('uncaughtException', (error) => {
  logger.error(`Uncaught Exception: ${error.message}`, { stack: error.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error(`Unhandled Rejection: ${reason}`);
  process.exit(1);
});

startServer();
