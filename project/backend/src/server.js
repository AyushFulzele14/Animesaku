import dotenv from 'dotenv';
// Load environment variables early in execution
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';
import { connectRedis } from './config/redis.js';
import { configureCloudinary } from './config/cloudinary.js';
import { configureRazorpay } from './config/razorpay.js';
import { logger } from './config/logger.js';
import { ensureBootstrap } from './utils/ensureBootstrap.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Establish Database Connections
    await connectDB();
    await ensureBootstrap();
    await connectRedis();

    // 2. Initialize Third-Party Integrations
    configureCloudinary();
    configureRazorpay();

    // 3. Start Listening on HTTP Port
    const server = app.listen(PORT, () => {
      logger.info(`Server operating in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      logger.info(`API: http://localhost:${PORT}/api`);
      logger.info(`API Docs: http://localhost:${PORT}/api-docs`);
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(
          `Port ${PORT} is already in use. Stop the other backend (Ctrl+C in its terminal), or run: netstat -ano | findstr :${PORT} then taskkill /PID <pid> /F`
        );
        process.exit(1);
      }
      throw error;
    });

    // Graceful Shutdown Handler
    const shutdown = () => {
      logger.info('Shutting down server gracefully...');
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    logger.error(`Critical server initialization crash: ${error.message}`);
    process.exit(1);
  }
};

// Start the server
startServer();
