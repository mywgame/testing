/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const REDIS_KEYS = {
  /**
   * Generates the key for storing a registration OTP
   */
  registrationOtp: (email: string) => `otp:register:${email.toLowerCase()}`,

  /**
   * Generates the key for tracking registration OTP resend cooldown (1 minute)
   */
  registrationCooldown: (email: string) => `otp:register:cooldown:${email.toLowerCase()}`,

  /**
   * Generates the key for counting failed registration OTP attempts
   */
  registrationAttempts: (email: string) => `otp:register:attempts:${email.toLowerCase()}`,

  /**
   * Generates the key for storing a forgot password OTP
   */
  forgotPasswordOtp: (email: string) => `otp:forgot-password:${email.toLowerCase()}`,

  /**
   * Generates the key for tracking forgot password OTP resend cooldown (1 minute)
   */
  forgotPasswordCooldown: (email: string) => `otp:forgot-password:cooldown:${email.toLowerCase()}`,

  /**
   * Generates the key for counting failed forgot password OTP attempts
   */
  forgotPasswordAttempts: (email: string) => `otp:forgot-password:attempts:${email.toLowerCase()}`,

  /**
   * Generates the key for storing a withdrawal OTP
   */
  withdrawalOtp: (email: string) => `otp:withdrawal:${email.toLowerCase()}`,

  /**
   * Generates the key for tracking withdrawal OTP resend cooldown
   */
  withdrawalCooldown: (email: string) => `otp:withdrawal:cooldown:${email.toLowerCase()}`,

  /**
   * Generates the key for counting failed withdrawal OTP attempts
   */
  withdrawalAttempts: (email: string) => `otp:withdrawal:attempts:${email.toLowerCase()}`,

  /**
   * Generates the key for storing a withdrawal address OTP
   */
  withdrawalAddressOtp: (email: string) => `otp:withdrawal-address:${email.toLowerCase()}`,

  /**
   * Generates the key for tracking withdrawal address OTP resend cooldown
   */
  withdrawalAddressCooldown: (email: string) => `otp:withdrawal-address:cooldown:${email.toLowerCase()}`,

  /**
   * Generates the key for counting failed withdrawal address OTP attempts
   */
  withdrawalAddressAttempts: (email: string) => `otp:withdrawal-address:attempts:${email.toLowerCase()}`,

  /**
   * Generates keys for Admin MFA login OTP
   */
  adminMfaOtp: (email: string) => `otp:admin-mfa:${email.toLowerCase()}`,
  adminMfaCooldown: (email: string) => `otp:admin-mfa:cooldown:${email.toLowerCase()}`,
  adminMfaAttempts: (email: string) => `otp:admin-mfa:attempts:${email.toLowerCase()}`,
};

export const CACHE_TTL = {
  OTP_EXPIRY_SECONDS: 600, // 10 minutes for OTP validity
  COOLDOWN_SECONDS: 60,    // 1 minute before user can request a new OTP
  MAX_ATTEMPTS: 5,         // Max 5 attempts before lock/blacklist
  ADMIN_MFA_EXPIRY_SECONDS: 300, // 5 minutes for Admin MFA OTP validity
  ADMIN_MFA_COOLDOWN_SECONDS: 30, // 30 seconds resend cooldown for Admin MFA
};
