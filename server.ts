/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import { createServer as createViteServer } from 'vite';
import { config } from './server/config/index.ts';
import { logger } from './server/utils/logger.ts';
import { errorHandler } from './server/middlewares/errorHandler.ts';
import { helmetMiddleware, corsMiddleware, rateLimiter } from './server/middlewares/security.ts';
import apiRoutes from './server/routes/index.ts';
import { transactionMonitor } from './server/services/transactionMonitor.ts';
import { rpcDepositScanner } from './server/blockchain/services/RpcDepositScanner.ts';
import { treasuryService } from './server/blockchain/services/TreasuryService.ts';
import { sweepQueueProcessor } from './server/blockchain/services/SweepQueueProcessor.ts';

async function bootstrap() {
  const app = express();
  const PORT = config.port;

  // Initialize treasury configurations if they don't exist
  try {
    await treasuryService.ensureAllTreasuryWallets();
    logger.info('[Bootstrap] Treasury wallets verified/seeded successfully.');
  } catch (err: any) {
    logger.error('[Bootstrap] Failed to verify/seed treasury wallets:', err.message);
  }

  // Enable trust proxy so Express resolves the client's real IP behind Cloud Run reverse proxies
  app.set('trust proxy', true);

  logger.info(`Starting CeFi Platform Foundation in [${config.nodeEnv}] mode...`);

  // 1. Core Security Middlewares
  app.use(helmetMiddleware);
  app.use(corsMiddleware);

  // 2. Body Parsers & Cookie Parser
  app.use(express.json({
    verify: (req: any, res, buf) => {
      req.rawBody = buf;
    }
  }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // 3. API Routes mounted FIRST (Required to prevent Vite SPA routing collision)
  // Apply rate limiting specifically on API endpoints to prevent static resource/chunk loads from exhausting limits
  app.use('/api', rateLimiter(15 * 60 * 1000, 300), apiRoutes);

  // 4. Vite Dev Middleware / Production Static Asset Handling
  if (config.nodeEnv !== 'production') {
    logger.info('Mounting Vite middleware for Hot-Module replacement and client builds...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    logger.info('Mounting production static assets build directories...');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // 5. Centralized Error Handler (Mounted last)
  app.use(errorHandler);

  // 6. Bind and Listen
  const server = app.listen(PORT, '0.0.0.0', () => {
    logger.info(`Server successfully bound to host 0.0.0.0, listening on port ${PORT}`);
    // Start background background routines
    transactionMonitor.start();
    // TODO: Automatic deposit scanning is temporarily disabled to prevent continuous RPC background polling.
    // Re-enable automatic deposit scanning in a future release.
    // rpcDepositScanner.start();
    sweepQueueProcessor.start();
  });

  // Graceful shutdown handling
  const shutdown = () => {
    logger.info('Received shutdown signal. Commencing graceful termination...');
    transactionMonitor.stop();
    rpcDepositScanner.stop();
    sweepQueueProcessor.stop();
    server.close(() => {
      logger.info('Express server successfully closed. Process exiting.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

bootstrap().catch((error) => {
  logger.error('Fatal initialization error during bootstrap sequence:', error);
  process.exit(1);
});
