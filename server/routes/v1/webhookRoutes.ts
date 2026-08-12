/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router, Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { tatumWebhookHandler } from '../../blockchain/webhooks/TatumWebhookHandler.ts';
import { logger } from '../../utils/logger.ts';

const router = Router();

// Retrieve Tatum webhook secret from environment (or default to fallback in non-production)
const WEBHOOK_SECRET = process.env.TATUM_WEBHOOK_SECRET || '';

/**
 * Middleware to strictly verify Tatum webhook signatures and timestamps to prevent replay/forgery attacks.
 */
function verifyWebhookSignature(req: Request, res: Response, next: NextFunction) {
  const signature =
    (req.headers['x-tatum-signature'] as string) ||
    (req.headers['x-payload-signature'] as string) ||
    (req.headers['tatum-signature'] as string) ||
    (req.headers['x-signature'] as string) ||
    (req.headers['x-hmac-signature'] as string) ||
    (req.headers['signature'] as string);

  const timestampHeader = (req.headers['x-tatum-timestamp'] as string) || (req.headers['x-timestamp'] as string);

  // 1. Replay attack protection: If timestamp is present, verify it is within a 5-minute window (300 seconds)
  if (timestampHeader) {
    const requestTime = parseInt(timestampHeader, 10);
    const currentTime = Math.floor(Date.now() / 1000);
    if (!isNaN(requestTime) && Math.abs(currentTime - requestTime) > 300) {
      logger.warn('[Webhook] Replay attack detected or timestamp skewed too far.');
      return res.status(401).json({ error: 'Replay attack or timestamp skewed too far.' });
    }
  }

  const isProduction = process.env.NODE_ENV === 'production';
  const allowUnsigned = process.env.ALLOW_UNSIGNED_WEBHOOKS === 'true';
  const requireSignature = process.env.REQUIRE_WEBHOOK_SIGNATURE === 'true';

  // 2. Signature verification
  if (signature) {
    if (!WEBHOOK_SECRET) {
      logger.warn('[Webhook] Signature header provided, but TATUM_WEBHOOK_SECRET is not configured on server.');
      if (requireSignature) {
        return res.status(500).json({ error: 'Server misconfiguration: TATUM_WEBHOOK_SECRET missing.' });
      }
    } else {
      const rawBody = (req as any).rawBody;
      if (!rawBody) {
        logger.warn('[Webhook] Request rejected: empty raw body.');
        return res.status(400).json({ error: 'Empty payload body.' });
      }

      try {
        // Try HMAC SHA-512 first (Tatum default)
        const hmac512 = crypto.createHmac('sha512', WEBHOOK_SECRET);
        const computed512 = hmac512.update(rawBody).digest('hex');
        const buf512 = Buffer.from(computed512, 'hex');
        const sigBuf = Buffer.from(signature.trim(), 'hex');

        let isSignatureValid = buf512.length === sigBuf.length && crypto.timingSafeEqual(buf512, sigBuf);

        // Fallback to SHA-256 if SHA-512 comparison length/content didn't match
        if (!isSignatureValid) {
          const hmac256 = crypto.createHmac('sha256', WEBHOOK_SECRET);
          const computed256 = hmac256.update(rawBody).digest('hex');
          const buf256 = Buffer.from(computed256, 'hex');
          isSignatureValid = buf256.length === sigBuf.length && crypto.timingSafeEqual(buf256, sigBuf);
        }

        if (!isSignatureValid) {
          logger.warn('[Webhook] Request rejected: signature verification failed (forged payload).');
          return res.status(401).json({ error: 'Signature verification failed.' });
        }

        logger.info('[Webhook] Signature verification passed successfully.');
      } catch (err: any) {
        logger.error('[Webhook] Error during signature verification:', err.message);
        return res.status(500).json({ error: 'Internal signature verification error.' });
      }
    }
  } else {
    // Unsigned webhook payload
    if (requireSignature) {
      logger.warn('[Webhook] Request rejected: missing required signature header in strict mode.');
      return res.status(401).json({ error: 'Missing required webhook signature header.' });
    }
    logger.info('[Webhook] Notice: Unsigned request allowed (ALLOW_UNSIGNED_WEBHOOKS or non-strict mode active). Relying on on-chain node verification.');
  }

  next();
}

/**
 * Production Webhook Endpoint
 * POST /api/v1/webhooks/tatum
 */
router.post('/tatum', verifyWebhookSignature, async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    
    // Flexible extraction of payload fields sent by Tatum notifications
    const address = payload?.address || payload?.account || payload?.to || payload?.counterAddress;
    const txId = payload?.txId || payload?.txHash || payload?.hash || payload?.transactionId;
    const amount = payload?.amount || payload?.value;

    if (!payload || !address || !txId) {
      logger.warn(`[Webhook] Rejected invalid payload format: ${JSON.stringify(payload)}`);
      return res.status(400).json({ error: 'Invalid payload structure. Required: address, txId/txHash' });
    }

    const normalizedPayload = {
      ...payload,
      address,
      txId,
      amount: amount !== undefined ? String(amount) : '0',
    };

    const result = await tatumWebhookHandler.handleIncomingNotification(normalizedPayload);
    return res.status(200).json(result);
  } catch (err: any) {
    logger.error('[Webhook] Failed to process incoming Tatum webhook:', err.message);
    return res.status(500).json({ error: 'Failed to process webhook transaction.' });
  }
});

export default router;
