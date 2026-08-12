/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { redisClient } from '../redisClient.ts';
import { REDIS_KEYS, CACHE_TTL } from '../redisKeys.ts';
import { generateOTP } from '../../utils/otp.ts';

export type OtpType = 'register' | 'forgot-password' | 'withdrawal' | 'withdrawal-address' | 'admin-mfa';

export class OtpService {
  /**
   * Helper to resolve keys based on type
   */
  private getKeys(email: string, type: OtpType) {
    const trimmed = email.trim().toLowerCase();
    switch (type) {
      case 'register':
        return {
          otp: REDIS_KEYS.registrationOtp(trimmed),
          cooldown: REDIS_KEYS.registrationCooldown(trimmed),
          attempts: REDIS_KEYS.registrationAttempts(trimmed)
        };
      case 'forgot-password':
        return {
          otp: REDIS_KEYS.forgotPasswordOtp(trimmed),
          cooldown: REDIS_KEYS.forgotPasswordCooldown(trimmed),
          attempts: REDIS_KEYS.forgotPasswordAttempts(trimmed)
        };
      case 'withdrawal':
        return {
          otp: REDIS_KEYS.withdrawalOtp(trimmed),
          cooldown: REDIS_KEYS.withdrawalCooldown(trimmed),
          attempts: REDIS_KEYS.withdrawalAttempts(trimmed)
        };
      case 'withdrawal-address':
        return {
          otp: REDIS_KEYS.withdrawalAddressOtp(trimmed),
          cooldown: REDIS_KEYS.withdrawalAddressCooldown(trimmed),
          attempts: REDIS_KEYS.withdrawalAddressAttempts(trimmed)
        };
      case 'admin-mfa':
        return {
          otp: REDIS_KEYS.adminMfaOtp(trimmed),
          cooldown: REDIS_KEYS.adminMfaCooldown(trimmed),
          attempts: REDIS_KEYS.adminMfaAttempts(trimmed)
        };
    }
  }

  /**
   * Check if a cooldown is active for a given email and type.
   * Returns remaining seconds, or 0 if no cooldown is active.
   */
  async getCooldownRemaining(email: string, type: OtpType): Promise<number> {
    const keys = this.getKeys(email, type);
    const exists = await redisClient.exists(keys.cooldown);
    if (!exists) return 0;
    return type === 'admin-mfa' ? CACHE_TTL.ADMIN_MFA_COOLDOWN_SECONDS : CACHE_TTL.COOLDOWN_SECONDS;
  }

  /**
   * Generates a new 6-digit secure OTP, checks for active cooldown, and stores it.
   */
  async generateAndStoreOtp(
    email: string,
    type: OtpType
  ): Promise<{ otp: string }> {
    const trimmedEmail = email.trim().toLowerCase();
    const keys = this.getKeys(trimmedEmail, type);

    const isAdminMfa = type === 'admin-mfa';
    const cooldownSec = isAdminMfa ? CACHE_TTL.ADMIN_MFA_COOLDOWN_SECONDS : CACHE_TTL.COOLDOWN_SECONDS;
    const expirySec = isAdminMfa ? CACHE_TTL.ADMIN_MFA_EXPIRY_SECONDS : CACHE_TTL.OTP_EXPIRY_SECONDS;

    // 1. Cooldown Rate-Limiting Check
    const isCooldownActive = await redisClient.exists(keys.cooldown);
    if (isCooldownActive) {
      throw new Error(`Please wait ${cooldownSec} seconds before requesting a new verification code.`);
    }

    // 2. Generate secure numeric OTP
    const otp = generateOTP(6);

    // 3. Store OTP in Redis
    await redisClient.set(keys.otp, otp, 'EX', expirySec);

    // 4. Store Cooldown Key
    await redisClient.set(keys.cooldown, '1', 'EX', cooldownSec);

    // 5. Reset verification attempts counter
    await redisClient.set(keys.attempts, '0', 'EX', expirySec);

    return { otp };
  }

  /**
   * Verifies an OTP with brute-force prevention.
   * Throws errors on failures, returns true on success.
   */
  async verifyOtp(
    email: string,
    otpCandidate: string,
    type: OtpType
  ): Promise<boolean> {
    const trimmedEmail = email.trim().toLowerCase();
    const cleanOtp = otpCandidate.trim();
    const keys = this.getKeys(trimmedEmail, type);

    const isAdminMfa = type === 'admin-mfa';
    const expirySec = isAdminMfa ? CACHE_TTL.ADMIN_MFA_EXPIRY_SECONDS : CACHE_TTL.OTP_EXPIRY_SECONDS;

    // 1. Retrieve failed attempts and enforce maximum limit
    const attemptsStr = await redisClient.get(keys.attempts);
    const attempts = attemptsStr ? parseInt(attemptsStr, 10) : 0;

    if (attempts >= CACHE_TTL.MAX_ATTEMPTS) {
      // Evict OTP to force user to generate a brand new code
      await redisClient.del(keys.otp);
      throw new Error('Too many failed attempts. This verification code has been invalidated. Please request a new one.');
    }

    // 2. Retrieve actual stored OTP
    const storedOtp = await redisClient.get(keys.otp);
    if (!storedOtp) {
      throw new Error('The verification code is invalid or has expired. Please request a new one.');
    }

    // 3. Verify OTP code
    if (storedOtp !== cleanOtp) {
      const newAttempts = await redisClient.incr(keys.attempts);
      // Ensure attempts key expires if not already set
      await redisClient.expire(keys.attempts, expirySec);

      const remaining = CACHE_TTL.MAX_ATTEMPTS - newAttempts;
      if (remaining <= 0) {
        await redisClient.del(keys.otp);
        throw new Error('Too many failed attempts. This verification code has been invalidated. Please request a new one.');
      }

      throw new Error(`Invalid verification code. You have ${remaining} attempts remaining.`);
    }

    // 4. Success — Evict keys to prevent reuse/replay attacks
    await redisClient.del(keys.otp);
    await redisClient.del(keys.attempts);
    await redisClient.del(keys.cooldown);

    return true;
  }
}

export const otpService = new OtpService();
export default otpService;
