/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import crypto from 'crypto';

/**
 * Generate a cryptographically secure numeric OTP of specified length.
 * Default length is 6.
 */
export function generateOTP(length: number = 6): string {
  if (length <= 0) return '';
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return crypto.randomInt(min, max + 1).toString();
}
