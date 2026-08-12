/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

interface CacheEntry {
  value: string;
  expiresAt: number | null; // Timestamp in milliseconds, or null if permanent
}

export class RedisClient {
  private cache = new Map<string, CacheEntry>();

  /**
   * Get a key's value. Returns null if key does not exist or has expired.
   */
  async get(key: string): Promise<string | null> {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  /**
   * Set a key to hold a string value.
   * Supports 'EX' option for setting expiration in seconds.
   */
  async set(
    key: string,
    value: string,
    mode?: 'EX',
    duration?: number
  ): Promise<'OK'> {
    let expiresAt: number | null = null;
    if (mode === 'EX' && typeof duration === 'number') {
      expiresAt = Date.now() + duration * 1000;
    }

    this.cache.set(key, { value, expiresAt });
    return 'OK';
  }

  /**
   * Delete a key. Returns 1 if deleted, 0 if did not exist.
   */
  async del(key: string): Promise<number> {
    const existed = this.cache.has(key);
    if (existed) {
      this.cache.delete(key);
      return 1;
    }
    return 0;
  }

  /**
   * Check if a key exists. Returns 1 if exists and not expired, 0 otherwise.
   */
  async exists(key: string): Promise<number> {
    const val = await this.get(key);
    return val !== null ? 1 : 0;
  }

  /**
   * Increment the integer value of a key by 1.
   * If key does not exist, set it to 0 before performing increment.
   */
  async incr(key: string): Promise<number> {
    const currentStr = await this.get(key);
    let currentVal = 0;

    if (currentStr !== null) {
      const parsed = parseInt(currentStr, 10);
      if (!isNaN(parsed)) {
        currentVal = parsed;
      }
    }

    const newVal = currentVal + 1;
    const entry = this.cache.get(key);
    const expiresAt = entry ? entry.expiresAt : null;

    this.cache.set(key, { value: newVal.toString(), expiresAt });
    return newVal;
  }

  /**
   * Set a timeout on key in seconds.
   */
  async expire(key: string, seconds: number): Promise<number> {
    const entry = this.cache.get(key);
    if (!entry) return 0;

    // Check if already expired
    if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return 0;
    }

    entry.expiresAt = Date.now() + seconds * 1000;
    this.cache.set(key, entry);
    return 1;
  }

  /**
   * Flush all keys (for testing/debugging).
   */
  async flushAll(): Promise<'OK'> {
    this.cache.clear();
    return 'OK';
  }
}

export const redisClient = new RedisClient();
export default redisClient;
