/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import crypto from 'crypto';

const ENCRYPTION_KEY = crypto
  .createHash('sha256')
  .update(process.env.JWT_SECRET || 'metafirm_secure_jwt_secret_key_2026')
  .digest(); // 32 bytes key

/**
 * Encrypts plain text using AES-256-CBC
 */
export function encryptText(text: string): string {
  if (!text) return '';
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts cipher text using AES-256-CBC
 */
export function decryptText(encryptedText: string): string {
  if (!encryptedText) return '';
  if (!encryptedText.includes(':')) return encryptedText; // Fallback if plain
  try {
    const [ivHex, encrypted] = encryptedText.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error('Decryption failed:', err);
    return '';
  }
}

/**
 * Hashes a string using SHA-256
 */
export function hashCode(code: string): string {
  return crypto.createHash('sha256').update(code.trim().toUpperCase()).digest('hex');
}
