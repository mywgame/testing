/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import userRoutes from './userRoutes.ts';
import authRoutes from './authRoutes.ts';
import adminRoutes from './adminRoutes.ts';
import webhookRoutes from './webhookRoutes.ts';
import taskRoutes from './taskRoutes.ts';
import systemRoutes from './systemRoutes.ts';

const router = Router();

// Mount public system configuration routes (app versioning, force update policies)
router.use('/system', systemRoutes);

// Mount auth routes
router.use('/auth', authRoutes);

// Mount user routes
router.use('/users', userRoutes);

// Mount task routes
router.use('/tasks', taskRoutes);

// Mount admin routes
router.use('/admin', adminRoutes);

// Mount webhook routes
router.use('/webhooks', webhookRoutes);

// Future endpoints placeholder (Wallets, Yield claims, Referrals, Salaries, Admin reports, etc.)
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

export default router;
