/**
 * @file apps/api/server.js
 * @description Application server entrypoint with DB connection and graceful shutdown
 */

import colors from 'colors';
import env from './config/env.js';
import { connectDB, closeDB } from './config/db.js';
import { ensureAllCategoryFormsSeeded } from './controllers/sellerForm.controller.js';
import app from './app.js';

const startServer = async () => {
  // Connect to database
  const conn = await connectDB();
  if (conn) {
    await ensureAllCategoryFormsSeeded();
  }

  const server = app.listen(env.PORT, '0.0.0.0', () => {
    console.log(
      `[SERVER] MyBigBazaar Platform Core running on https://backend.mybigbazaar.com (${env.NODE_ENV})`
        .bgBlue.white
    );
    console.log(`[SERVER] API v1 root: http://localhost:${env.PORT}/api/v1`.cyan);
  });

  server.on('error', (err) => {
    console.error('[SERVER] Server listen error:'.red, err);
  });

  // Graceful shutdown handling
  const shutdown = async (signal) => {
    console.log(`\n[SERVER] Received ${signal}. Shutting down gracefully...`.yellow);
    server.close(async () => {
      await closeDB();
      console.log('[SERVER] Closed all active connections. Exiting process.'.green);
      process.exit(0);
    });

    // Force exit after 10s if connections linger
    setTimeout(() => {
      console.error('[SERVER] Forced shutdown due to timeout.'.red);
      process.exit(1);
    }, 10000);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
};

startServer().catch((err) => {
  console.error('[SERVER] Startup fatal error:'.red, err);
  process.exit(1);
});