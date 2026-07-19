import dotenv from 'dotenv';
dotenv.config();

import { validateEnv } from './config/env';
import { initDatabase } from './config/database';
import { initRedis } from './config/redis';
import { initEmail } from './config/email';
import logger from './utils/logger';
import app from './app';

async function startServer() {
  // Validate environment
  validateEnv();
  
  // Initialize services
  initDatabase();
  initRedis();
  initEmail();

  const PORT = process.env.PORT || 4000;

  app.listen(PORT, () => {
    logger.info(`🚀 PLACE@ASET API Server running`, {
      port: PORT,
      env: process.env.NODE_ENV || 'development',
      api: `http://localhost:${PORT}/api/v1`,
      health: `http://localhost:${PORT}/api/v1/health`,
    });
  });
}

startServer().catch((err: any) => {
  logger.error('Failed to start server', { error: err.message });
  process.exit(1);
});
