/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import crypto from 'crypto';

/**
 * Decodes a base32 string into a Buffer.
 */
export function base32Decode(base32: string): Buffer {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const cleaned = base32.toUpperCase().replace(/[\s=]/g, '');
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (let i = 0; i < cleaned.length; i++) {
    const character = cleaned[i];
    const idx = alphabet.indexOf(character);
    if (idx === -1) {
      throw new Error('Invalid base32 character: ' + character);
    }
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

/**
 * Verifies a 6-digit TOTP token against a base32 secret.
 * Allows a configurable clock drift window (default +/- 1 step of 30 seconds).
 */
export function verifyTOTP(token: string, secret: string, windowSteps: number = 1): boolean {
  try {
    const key = base32Decode(secret);
    const epoch = Math.round(Date.now() / 1000);
    const counter = Math.floor(epoch / 30);

    for (let i = -windowSteps; i <= windowSteps; i++) {
      const currentCounter = counter + i;
      
      // Convert counter value to an 8-byte big-endian buffer
      const buffer = Buffer.alloc(8);
      let tmp = currentCounter;
      for (let j = 7; j >= 0; j--) {
        buffer[j] = tmp & 0xff;
        tmp = Math.floor(tmp / 256);
      }

      const hmac = crypto.createHmac('sha1', key);
      hmac.update(buffer);
      const hmacResult = hmac.digest();

      // Dynamic Truncation
      const offset = hmacResult[hmacResult.length - 1] & 0xf;
      const code =
        ((hmacResult[offset] & 0x7f) << 24) |
        ((hmacResult[offset + 1] & 0xff) << 16) |
        ((hmacResult[offset + 2] & 0xff) << 8) |
        (hmacResult[offset + 3] & 0xff);

      const otp = (code % 1000000).toString().padStart(6, '0');
      if (otp === token.trim()) {
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('TOTP validation failed:', error);
    return false;
  }
}

/**
 * Generates a random Base32 secret.
 */
export function generateTOTPSecret(length: number = 16): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const bytes = crypto.randomBytes(length);
  let result = '';
  for (let i = 0; i < bytes.length; i++) {
    result += alphabet[bytes[i] % alphabet.length];
  }
  return result;
}

/**
 * Unified TOTP helper interface
 */
export const totp = {
  generateSecret: () => generateTOTPSecret(16),
  verifyToken: (secret: string, token: string) => verifyTOTP(token, secret),
  getOtpauthUrl: (email: string, secret: string, issuer: string = 'MetaFirm') => {
    return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(email)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`;
  }
};
