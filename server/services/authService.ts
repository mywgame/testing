/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import crypto from 'crypto';
import { redisClient } from '../cache/redisClient.ts';
import { adminSecurityRepository } from '../repositories/adminSecurityRepository.ts';
import { settingsRepository } from '../repositories/settingsRepository.ts';
import { encryptText, decryptText, hashCode } from '../utils/encryption.ts';
import { totp } from '../utils/totp.ts';
import { authRepository } from '../repositories/authRepository.ts';
import { userRepository } from '../repositories/userRepository.ts';
import { sessionRepository } from '../repositories/sessionRepository.ts';
import { hashPassword, comparePassword } from '../utils/password.ts';
import { SecurityLogger } from '../utils/securityLogger.ts';
import { otpService } from '../cache/services/otpService.ts';
import { emailService } from './emailService.ts';
import { userService } from './userService.ts';
import { referralService } from './referralService.ts';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  TokenPayload
} from '../utils/jwt.ts';
import { UserRole } from '../../shared/types/index.ts';

// Helper to hash refresh tokens for secure storage
function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// In-memory store for secure hashed reset tokens with expiration mapping:
// key: string (hashed reset token) -> value: { uid: string, expiresAt: Date }
interface ResetTokenPayload {
  uid: string;
  expiresAt: Date;
}
const resetTokensStore = new Map<string, ResetTokenPayload>();

interface PendingRegistration {
  uid: string;
  email: string;
  username: string;
  name: string | null;
  phone: string | null;
  country: string | null;
  passwordHash: string;
  role: UserRole;
  userId: string;
  referralCode: string;
  parentReferralId: string | null;
  status: string;
  expiresAt: number;
}
const pendingRegistrationsStore = new Map<string, PendingRegistration>();

export class AuthService {
  /**
   * Helper to hash a plain reset token using SHA-256
   */
  private hashResetToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Helper to generate a unique random 8-character uppercase referral code
   */
  private async generateUniqueReferralCode(): Promise<string> {
    for (let attempt = 0; attempt < 10; attempt++) {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase(); // 8 characters
      const existing = await authRepository.findByReferralCode(code);
      if (!existing) {
        return code;
      }
    }
    throw new Error('Failed to generate unique referral code. Please retry.');
  }

  /**
   * Helper to generate a unique random 8-character visible User ID (e.g. DS322256)
   */
  private async generateUniqueUserId(): Promise<string> {
    for (let attempt = 0; attempt < 10; attempt++) {
      const digits = Math.floor(100000 + Math.random() * 900000).toString();
      const userIdCandidate = `DS${digits}`;
      const existing = await authRepository.findByUserId(userIdCandidate);
      if (!existing) {
        return userIdCandidate;
      }
    }
    throw new Error('Failed to generate unique public user ID. Please retry.');
  }

  private getPendingRegistration(email: string): PendingRegistration | null {
    const trimmed = email.toLowerCase().trim();
    const entry = pendingRegistrationsStore.get(trimmed);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      pendingRegistrationsStore.delete(trimmed);
      return null;
    }
    return entry;
  }

  private setPendingRegistration(email: string, data: Omit<PendingRegistration, 'expiresAt'>): void {
    const trimmed = email.toLowerCase().trim();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    pendingRegistrationsStore.set(trimmed, { ...data, expiresAt });
  }

  private deletePendingRegistration(email: string): void {
    const trimmed = email.toLowerCase().trim();
    pendingRegistrationsStore.delete(trimmed);
  }

  /**
   * Enterprise registration logic with OTP verification
   */
  async registerUser(data: {
    email: string;
    username: string;
    name?: string;
    phone?: string;
    country?: string;
    passwordPlain: string;
    parentReferralCode?: string;
  }) {
    const trimmedEmail = data.email.trim().toLowerCase();
    const trimmedUsername = data.username.trim().toLowerCase();

    // 1. Prevent duplicate emails
    const existingEmail = await authRepository.findByEmail(trimmedEmail);
    if (existingEmail) {
      throw new Error('Email address is already registered on this platform.');
    }

    // 1b. Prevent duplicate usernames
    const existingUsername = await authRepository.findByUsername(trimmedUsername);
    if (existingUsername) {
      throw new Error('Username is already registered on this platform.');
    }

    // 2. Validate referral code if provided
    let parentReferralId: string | null = null;
    if (data.parentReferralCode) {
      const parentUser = await authRepository.findByReferralCode(data.parentReferralCode);
      if (!parentUser) {
        throw new Error('The provided referral code is invalid or does not exist.');
      }
      parentReferralId = parentUser.id;
    }

    // 3. Generate unique identifiers securely
    const userId = await this.generateUniqueUserId();
    const referralCode = await this.generateUniqueReferralCode();
    const uid = crypto.randomUUID(); // Unique system authority UID for security and JWT mapping

    // 4. Hash the password before saving
    const passwordHash = await hashPassword(data.passwordPlain);

    // 5. Build temporary registration payload
    const pendingData = {
      uid,
      email: trimmedEmail,
      username: trimmedUsername,
      name: data.name || null,
      phone: data.phone || null,
      country: data.country || null,
      passwordHash,
      role: UserRole.USER,
      userId,
      referralCode,
      parentReferralId,
      status: 'PENDING_VERIFICATION',
    };

    // 6. Store temporary registration data ONLY in memory (with short TTL)
    this.setPendingRegistration(trimmedEmail, pendingData);

    // 7. Generate and store OTP in Redis
    const { otp } = await otpService.generateAndStoreOtp(trimmedEmail, 'register');

    // 8. Send registration OTP email
    await emailService.sendOtpEmail(trimmedEmail, otp, 'verify your account');

    // Strip password hash from returned object
    const { passwordHash: _, ...safeUser } = pendingData;
    return {
      user: safeUser,
    };
  }

  /**
   * Verify the registration OTP and activate the user.
   * On success, generates Access/Refresh tokens so the user is instantly authenticated.
   */
  async verifyRegistrationOtp(email: string, otp: string) {
    const trimmedEmail = email.trim().toLowerCase();

    // 1. Verify OTP with OTP Service
    await otpService.verifyOtp(trimmedEmail, otp, 'register');

    // 2. Retrieve temporary registration data from memory
    const pendingData = this.getPendingRegistration(trimmedEmail);
    if (!pendingData) {
      throw new Error('Registration session has expired or does not exist. Please register again.');
    }

    // 3. Prevent duplicate emails or usernames at the time of insertion (race condition check)
    const existingEmail = await authRepository.findByEmail(trimmedEmail);
    if (existingEmail) {
      throw new Error('Email address is already registered on this platform.');
    }

    const existingUsername = await authRepository.findByUsername(pendingData.username);
    if (existingUsername) {
      throw new Error('Username is already registered on this platform.');
    }

    // 4. Create actual user record in database with status set to ACTIVE
    const user = await authRepository.createUser({
      uid: pendingData.uid,
      email: pendingData.email,
      username: pendingData.username,
      name: pendingData.name,
      phone: pendingData.phone,
      country: pendingData.country,
      passwordHash: pendingData.passwordHash,
      role: pendingData.role,
      userId: pendingData.userId,
      referralCode: pendingData.referralCode,
      parentReferralId: pendingData.parentReferralId,
      status: 'ACTIVE',
    });

    // Initialize configured Trial Fund, Wallet, and VIP1 status automatically
    await userService.ensureUserResources(user.id);

    // Link referral relationship if registered via a referral link
    if (pendingData.parentReferralId) {
      try {
        await referralService.linkReferral(user.id, pendingData.parentReferralId);
      } catch (err) {
        console.error('Failed to link referral relationship during registration:', err);
      }
    }

    // 5. Evict temporary registration data from memory
    this.deletePendingRegistration(trimmedEmail);

    // 6. Send Welcome Email
    try {
      await emailService.sendWelcomeEmail(trimmedEmail, user.username || 'Investor');
    } catch (err) {
      console.error('Failed to send welcome email:', err);
    }

    // 7. Auto-login: Generate session and tokens
    const payload: TokenPayload = {
      uid: user.uid,
      email: user.email,
      role: user.role as UserRole,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // 8. Persist session with refresh token hash in Postgres
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await sessionRepository.createSession({
      userId: user.id,
      tokenHash,
      device: 'Web Client',
      browser: 'Browser',
      ipAddress: null,
      expiresAt,
    });

    const { passwordHash: _, ...safeUser } = user;
    (safeUser as any).status = 'ACTIVE';
    return {
      user: safeUser,
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  /**
   * Resend a registration OTP if the account is pending verification.
   */
  async resendRegistrationOtp(email: string) {
    const trimmedEmail = email.trim().toLowerCase();

    // Check if there is pending registration data in memory
    const pendingData = this.getPendingRegistration(trimmedEmail);
    if (!pendingData) {
      throw new Error('Registration session has expired or does not exist. Please register again.');
    }

    const { otp } = await otpService.generateAndStoreOtp(trimmedEmail, 'register');
    await emailService.sendOtpEmail(trimmedEmail, otp, 'verify your account');

    return {
      success: true,
    };
  }

  /**
   * Enterprise login logic
   */
  async loginUser(data: {
    emailOrUsername: string;
    passwordPlain: string;
    ipAddress?: string | null;
    device?: string | null;
    browser?: string | null;
  }) {
    const trimmedIdentifier = data.emailOrUsername.trim().toLowerCase();

    // 1. Retrieve the user record
    let user = await authRepository.findByEmail(trimmedIdentifier);
    if (!user) {
      user = await authRepository.findByUsername(trimmedIdentifier);
    }
    if (!user) {
      // Use generic error for security to prevent username harvesting
      throw new Error('Invalid username, email address or password.');
    }

    // 2. Lockout protection check
    if (user.lockUntil && user.lockUntil > new Date()) {
      const minutesRemaining = Math.ceil((user.lockUntil.getTime() - Date.now()) / 60000);
      throw new Error(`This account is temporarily locked due to multiple failed login attempts. Please try again in ${minutesRemaining} minutes.`);
    }

    // If lockout has expired, reset attempts
    if (user.lockUntil && user.lockUntil <= new Date()) {
      await authRepository.resetFailedLoginAttempts(user.id);
      user.failedLoginAttempts = 0;
      user.lockUntil = null;
    }

    // 3. Prevent inactive/suspended user login
    if (user.status !== 'ACTIVE') {
      throw new Error('This user account has been suspended or is pending verification.');
    }

    // 4. Verify user password securely
    if (!user.passwordHash) {
      throw new Error('Invalid email address or password.');
    }

    const isMatch = await comparePassword(data.passwordPlain, user.passwordHash);
    if (!isMatch) {
      // Increment failed attempts and track
      const updatedUser = await authRepository.incrementFailedLoginAttempts(user.id, user.failedLoginAttempts);
      
      // Log failed login event
      await SecurityLogger.logActivity({
        userId: user.id,
        event: 'LOGIN',
        status: 'FAILED',
        ipAddress: data.ipAddress,
        device: data.device ? `${data.browser || ''} on ${data.device}` : null,
        details: `Incorrect password. Failed attempt count: ${updatedUser.failedLoginAttempts}`,
      });

      if (updatedUser.failedLoginAttempts >= 5) {
        // Log account lock event
        await SecurityLogger.logActivity({
          userId: user.id,
          event: 'SECURITY_EVENT',
          status: 'FAILED',
          ipAddress: data.ipAddress,
          device: data.device ? `${data.browser || ''} on ${data.device}` : null,
          details: `Account temporarily locked due to 5 consecutive failed login attempts.`,
        });
        throw new Error('This account has been temporarily locked due to too many failed login attempts. Please try again in 15 minutes.');
      }

      throw new Error('Invalid email address or password.');
    }

    // Reset attempts on successful password match
    if (user.failedLoginAttempts > 0) {
      await authRepository.resetFailedLoginAttempts(user.id);
    }

    // Check if role is ADMIN or SUPERADMIN -> Require Multi-Factor Authentication
    const userRoleNormalized = (user.role || '').toUpperCase();
    if (userRoleNormalized === 'ADMIN' || userRoleNormalized === 'SUPERADMIN' || userRoleNormalized === 'OPERATOR') {
      // Check if TOTP 2FA is configured and enabled in Admin Security settings or User Settings
      const sec = await adminSecurityRepository.findByUserId(user.id);
      const userSettings = await settingsRepository.findUserSettingsByUserId(user.id);

      const isTotpInAdminSec = !!(sec && (sec.totpEnabled === true || String(sec.totpEnabled) === 'true') && sec.totpSecret);
      const isTotpInUserSettings = !!(userSettings && (userSettings.mfaEnabled === true || String(userSettings.mfaEnabled) === 'true') && userSettings.mfaSecret);
      const hasSecSecret = !!(sec && sec.totpSecret && sec.totpSecret.trim().length > 0);
      const hasUserSettingsSecret = !!(userSettings && userSettings.mfaSecret && userSettings.mfaSecret.trim().length > 0);

      const totpRequired = isTotpInAdminSec || isTotpInUserSettings || hasSecSecret || hasUserSettingsSecret;

      // Generate temporary MFA token (valid 5 mins)
      const mfaToken = crypto.randomBytes(32).toString('hex');
      const mfaKey = `admin:mfa:${mfaToken}`;
      const sessionData = {
        userId: user.id,
        email: user.email,
        role: user.role,
        totpRequired,
        ipAddress: data.ipAddress,
        device: data.device,
        browser: data.browser,
      };

      // Store in Redis with 5 min (300s) TTL
      await redisClient.set(mfaKey, JSON.stringify(sessionData), 'EX', 300);

      // Generate & Send Email OTP
      const { otp } = await otpService.generateAndStoreOtp(user.email, 'admin-mfa');
      await emailService.sendOtpEmail(user.email, otp, 'admin multi-factor authentication');

      // Return response indicating MFA step required — DO NOT generate JWT yet
      return {
        requiresMfa: true,
        mfaToken,
        email: user.email,
        totpRequired,
        message: totpRequired
          ? 'Password verified. Multi-factor verification required (Email OTP + Google Authenticator).'
          : 'Password verified. Email verification OTP required.',
      };
    }

    // Standard User Login Flow (USER role) — completely unchanged
    const payload: TokenPayload = {
      uid: user.uid,
      email: user.email,
      role: user.role as UserRole,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    const tokenHash = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await sessionRepository.createSession({
      userId: user.id,
      tokenHash,
      device: data.device,
      browser: data.browser,
      ipAddress: data.ipAddress,
      expiresAt,
    });

    await SecurityLogger.logActivity({
      userId: user.id,
      event: 'LOGIN',
      status: 'SUCCESS',
      ipAddress: data.ipAddress,
      device: data.device ? `${data.browser || ''} on ${data.device}` : null,
      details: 'Successful credentials authentication.',
    });

    const { passwordHash: _, ...safeUser } = user;
    return {
      user: safeUser,
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  /**
   * Resends Email OTP for Admin MFA step
   */
  async resendAdminMfaOtp(mfaToken: string) {
    if (!mfaToken) {
      throw new Error('MFA token is required.');
    }
    const mfaKey = `admin:mfa:${mfaToken}`;
    const rawData = await redisClient.get(mfaKey);
    if (!rawData) {
      throw new Error('MFA session expired or invalid. Please log in again.');
    }
    const sessionData = JSON.parse(rawData);
    const { otp } = await otpService.generateAndStoreOtp(sessionData.email, 'admin-mfa');
    await emailService.sendOtpEmail(sessionData.email, otp, 'admin multi-factor authentication');
    return { success: true, message: 'Verification OTP sent to your admin email address.' };
  }

  /**
   * Verifies Admin MFA (Email OTP always required; Google Authenticator TOTP required if enabled in admin settings)
   */
  async verifyAdminMfa(data: {
    mfaToken: string;
    emailOtp: string;
    totpCode?: string;
    ipAddress?: string | null;
    device?: string | null;
    browser?: string | null;
  }) {
    if (!data.mfaToken) {
      throw new Error('MFA token is required.');
    }
    if (!data.emailOtp || !data.emailOtp.trim()) {
      throw new Error('Email verification OTP code is required.');
    }

    const mfaKey = `admin:mfa:${data.mfaToken}`;
    const rawData = await redisClient.get(mfaKey);
    if (!rawData) {
      throw new Error('MFA session expired or invalid. Please start login again.');
    }

    const sessionData = JSON.parse(rawData);
    const user = await userRepository.findById(sessionData.userId);
    if (!user || user.status !== 'ACTIVE') {
      throw new Error('User account is invalid or suspended.');
    }

    // Check admin security lock
    const sec = await adminSecurityRepository.findByUserId(user.id);
    if (sec?.lockedUntil && new Date(sec.lockedUntil) > new Date()) {
      const mins = Math.ceil((new Date(sec.lockedUntil).getTime() - Date.now()) / 60000);
      throw new Error(`Account security temporarily locked due to multiple failed 2FA attempts. Try again in ${mins} minutes.`);
    }

    // 1. Verify Email OTP
    try {
      await otpService.verifyOtp(user.email, data.emailOtp, 'admin-mfa');
    } catch (err: any) {
      await adminSecurityRepository.incrementFailedAttempts(user.id);
      await SecurityLogger.logActivity({
        userId: user.id,
        event: 'LOGIN',
        status: 'FAILED',
        ipAddress: data.ipAddress || sessionData.ipAddress,
        device: data.device ? `${data.browser || ''} on ${data.device}` : null,
        details: `Admin MFA Email OTP verification failed: ${err.message}`,
      });
      throw err;
    }

    // 2. Verify Google Authenticator TOTP or Recovery Code ONLY IF enabled or required
    const userSettings = await settingsRepository.findUserSettingsByUserId(user.id);
    const isTotpInAdminSec = !!(sec && (sec.totpEnabled === true || String(sec.totpEnabled) === 'true') && sec.totpSecret);
    const isTotpInUserSettings = !!(userSettings && (userSettings.mfaEnabled === true || String(userSettings.mfaEnabled) === 'true') && userSettings.mfaSecret);
    const hasSecSecret = !!(sec && sec.totpSecret && sec.totpSecret.trim().length > 0);
    const hasUserSettingsSecret = !!(userSettings && userSettings.mfaSecret && userSettings.mfaSecret.trim().length > 0);

    const isTotpEnabled = sessionData.totpRequired || isTotpInAdminSec || isTotpInUserSettings || hasSecSecret || hasUserSettingsSecret;

    if (isTotpEnabled) {
      const totpCandidate = (data.totpCode || '').trim();
      if (!totpCandidate) {
        throw new Error('Google Authenticator 2FA is active on your account. Please enter your 6-digit code or recovery code.');
      }

      let totpVerified = false;

      // 2a. Check admin_security table secret
      if (sec && sec.totpSecret) {
        try {
          const decryptedSecret = decryptText(sec.totpSecret);
          totpVerified = totp.verifyToken(decryptedSecret, totpCandidate);
        } catch (e) {
          totpVerified = totp.verifyToken(sec.totpSecret, totpCandidate);
        }

        if (!totpVerified && sec.recoveryCodes) {
          // Check recovery codes
          let hashedCodes: string[] = [];
          try {
            hashedCodes = JSON.parse(sec.recoveryCodes);
          } catch (e) {
            hashedCodes = [];
          }

          const inputHash = hashCode(totpCandidate);
          const codeIndex = hashedCodes.indexOf(inputHash);
          if (codeIndex !== -1) {
            totpVerified = true;
            hashedCodes.splice(codeIndex, 1);
            await adminSecurityRepository.upsertAdminSecurity(user.id, {
              recoveryCodes: JSON.stringify(hashedCodes),
            });
            await SecurityLogger.logActivity({
              userId: user.id,
              event: 'SECURITY_EVENT',
              status: 'SUCCESS',
              ipAddress: data.ipAddress || sessionData.ipAddress,
              device: data.device ? `${data.browser || ''} on ${data.device}` : null,
              details: 'Admin logged in using a one-time recovery code.',
            });
          }
        }
      }

      // 2b. Check user_settings fallback if not verified yet
      if (!totpVerified && userSettings && userSettings.mfaSecret) {
        try {
          const decrypted = decryptText(userSettings.mfaSecret);
          totpVerified = totp.verifyToken(decrypted, totpCandidate);
        } catch (e) {
          totpVerified = totp.verifyToken(userSettings.mfaSecret, totpCandidate);
        }
      }

      if (!totpVerified) {
        const { lockedUntil } = await adminSecurityRepository.incrementFailedAttempts(user.id);
        await SecurityLogger.logActivity({
          userId: user.id,
          event: 'LOGIN',
          status: 'FAILED',
          ipAddress: data.ipAddress || sessionData.ipAddress,
          device: data.device ? `${data.browser || ''} on ${data.device}` : null,
          details: 'Admin MFA TOTP/Recovery code verification failed.',
        });

        if (lockedUntil) {
          throw new Error('Too many failed 2FA attempts. Account locked for 15 minutes.');
        }
        throw new Error('Invalid Google Authenticator code or recovery code.');
      }
    }

    // Both Email OTP + TOTP/Recovery Code verified successfully!
    await redisClient.del(mfaKey);

    await adminSecurityRepository.resetFailedAttempts(user.id);
    await authRepository.resetFailedLoginAttempts(user.id);

    const payload: TokenPayload = {
      uid: user.uid,
      email: user.email,
      role: user.role as UserRole,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    const tokenHash = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await sessionRepository.createSession({
      userId: user.id,
      tokenHash,
      device: data.device || sessionData.device,
      browser: data.browser || sessionData.browser,
      ipAddress: data.ipAddress || sessionData.ipAddress,
      expiresAt,
    });

    await SecurityLogger.logActivity({
      userId: user.id,
      event: 'LOGIN',
      status: 'SUCCESS',
      ipAddress: data.ipAddress || sessionData.ipAddress,
      device: data.device ? `${data.browser || ''} on ${data.device}` : null,
      details: 'Admin Multi-Factor Authentication successfully completed.',
    });

    const { passwordHash: _, ...safeUser } = user;
    return {
      user: safeUser,
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  /**
   * Refresh token rotation logic (DB-backed and multi-device safe)
   */
  async refreshSession(refreshToken: string, ipAddress?: string | null, device?: string | null, browser?: string | null) {
    // 1. Verify and decode token structure
    let decoded: TokenPayload;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (err) {
      throw new Error('Session validation failed. Please sign in again.');
    }

    // 2. Hash incoming token and query Postgres
    const tokenHash = hashToken(refreshToken);
    const session = await sessionRepository.findByTokenHash(tokenHash);

    if (!session) {
      throw new Error('Refresh token is invalid or has been revoked.');
    }

    // 3. Reject if revoked or expired
    if (session.revoked) {
      throw new Error('This session has been terminated or the token is revoked.');
    }

    if (session.expiresAt < new Date()) {
      throw new Error('The secure session has expired. Please log in again.');
    }

    // 4. Invalidate the previous refresh token (Rotation)
    await sessionRepository.revokeSession(tokenHash);

    // 5. Generate brand new token pair
    const payload: TokenPayload = {
      uid: decoded.uid,
      email: decoded.email,
      role: decoded.role,
    };

    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    // 6. Persist the new rotated session
    const newHash = hashToken(newRefreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await sessionRepository.createSession({
      userId: session.userId,
      tokenHash: newHash,
      device: device || session.device,
      browser: browser || session.browser,
      ipAddress: ipAddress || session.ipAddress,
      expiresAt,
    });

    // 7. Log token rotation activity
    await SecurityLogger.logActivity({
      userId: session.userId,
      event: 'SECURITY_EVENT',
      status: 'SUCCESS',
      ipAddress: ipAddress || session.ipAddress,
      device: device ? `${browser || ''} on ${device}` : (session.device ? `${session.browser || ''} on ${session.device}` : null),
      details: 'Successful refresh token rotation.',
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Revoke session upon logout (DB-backed)
   */
  async logoutUser(refreshToken: string) {
    if (refreshToken) {
      const tokenHash = hashToken(refreshToken);
      const session = await sessionRepository.findByTokenHash(tokenHash);
      if (session) {
        await sessionRepository.revokeSession(tokenHash);
        
        // Log logout event
        await SecurityLogger.logActivity({
          userId: session.userId,
          event: 'LOGOUT',
          status: 'SUCCESS',
          ipAddress: session.ipAddress,
          device: session.device ? `${session.browser || ''} on ${session.device}` : null,
          details: 'Session invalidated on user request.',
        });
      }
    }
  }

  /**
   * Forgot password: Create secure reset OTP code, store, and set expiration in Redis
   */
  async forgotPassword(email: string) {
    const trimmedEmail = email.trim().toLowerCase();
    const user = await authRepository.findByEmail(trimmedEmail);

    let otp: string | undefined;

    if (user) {
      if (user.status !== 'ACTIVE') {
        throw new Error('This account is pending verification or is not active.');
      }

      // Generate a 6-digit secure reset OTP
      const result = await otpService.generateAndStoreOtp(trimmedEmail, 'forgot-password');
      otp = result.otp;

      // Send the reset OTP email
      try {
        await emailService.sendPasswordResetOtp(trimmedEmail, otp);
      } catch (err) {
        console.error('Failed to send forgot password OTP email:', err);
      }
    }

    // Always return success message for security to prevent username harvesting.
    return {
      message: 'If the email is registered, a 6-digit verification code has been sent to your email address.',
    };
  }

  /**
   * Reset password: Confirm OTP validity and apply new password securely
   */
  async resetPassword(data: {
    email: string;
    tokenPlain: string;
    passwordPlain: string;
    ipAddress?: string | null;
    device?: string | null;
    browser?: string | null;
  }) {
    const trimmedEmail = data.email.trim().toLowerCase();

    // 1. Verify forgot password OTP with OTP Service
    await otpService.verifyOtp(trimmedEmail, data.tokenPlain, 'forgot-password');

    // 2. Retrieve user record
    const userRecord = await authRepository.findByEmail(trimmedEmail);
    if (!userRecord) {
      throw new Error('The account associated with this request could not be found.');
    }

    // 3. Hash the brand new password
    const newPasswordHash = await hashPassword(data.passwordPlain);

    // 4. Update database credentials
    await authRepository.updatePassword(userRecord.uid, newPasswordHash);

    // 5. Invalidate all active sessions for this user on password change
    await sessionRepository.revokeAllUserSessions(userRecord.id);

    // 6. Log password change event
    await SecurityLogger.logActivity({
      userId: userRecord.id,
      event: 'PASSWORD_CHANGE',
      status: 'SUCCESS',
      ipAddress: data.ipAddress,
      device: data.device ? `${data.browser || ''} on ${data.device}` : null,
      details: 'Password successfully updated via OTP. All active sessions invalidated.',
    });

    return {
      message: 'Your account password has been updated successfully.',
    };
  }
}

export const authService = new AuthService();
export default authService;
