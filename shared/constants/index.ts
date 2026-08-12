/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Global rate limiting defaults for production and development
export const RATE_LIMIT = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 100, // Limit each IP to 100 requests per window
} as const;
