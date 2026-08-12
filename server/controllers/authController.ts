/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService.ts';
import { ApiError } from '../middlewares/errorHandler.ts';
import { authRepository } from '../repositories/authRepository.ts';
import { parseUserAgent } from '../utils/ua.ts';

const isProduction = process.env.NODE_ENV === 'production';

// Central secure Cookie configurations for enterprise-grade protection
export const cookieOptions = {
  accessToken: {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax' as const,
    maxAge: 15 * 60 * 1000, // 15 minutes
    path: '/',
  },
  refreshToken: {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax' as const,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  },
  clear: {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax' as const,
    path: '/',
  },
};

export class AuthController {
  /**
   * Register a new user
   */
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, username, name, phone, country, password, referralCode } = req.body;

      const result = await authService.registerUser({
        email,
        username,
        name,
        phone,
        country,
        passwordPlain: password,
        parentReferralCode: referralCode,
      });

      return res.status(201).json({
        success: true,
        message: 'Registration initiated. A 6-digit verification code has been sent to your email.',
        data: {
          email,
          user: result.user,
        },
      });
    } catch (error: any) {
      const userMessage = error.message.includes('Database') || error.message.includes('repository') || error.message.includes('persist')
        ? 'A system error occurred during registration. Please try again.'
        : error.message;

      return next(new ApiError(400, userMessage, 'REGISTRATION_FAILED'));
    }
  }

  /**
   * Verify registration OTP and activate user (with auto-login)
   */
  async verifyRegistrationOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) {
        throw new ApiError(400, 'Email and 6-digit verification code are required.', 'BAD_REQUEST');
      }

      const result = await authService.verifyRegistrationOtp(email, otp);

      // Issue tokens strictly inside secure HttpOnly cookies
      res.cookie('accessToken', result.tokens.accessToken, cookieOptions.accessToken);
      res.cookie('refreshToken', result.tokens.refreshToken, cookieOptions.refreshToken);

      return res.status(200).json({
        success: true,
        message: 'Verification successful. Your account is now active.',
        data: {
          user: result.user,
          accessToken: result.tokens.accessToken,
          refreshToken: result.tokens.refreshToken,
        },
      });
    } catch (error: any) {
      return next(new ApiError(400, error.message, 'VERIFICATION_FAILED'));
    }
  }

  /**
   * Resend registration OTP
   */
  async resendRegistrationOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      if (!email) {
        throw new ApiError(400, 'Email is required to resend verification code.', 'BAD_REQUEST');
      }

      const result = await authService.resendRegistrationOtp(email);

      return res.status(200).json({
        success: true,
        message: 'A new 6-digit verification code has been sent to your email address.',
        data: {},
      });
    } catch (error: any) {
      return next(new ApiError(400, error.message, 'RESEND_OTP_FAILED'));
    }
  }

  /**
   * Login a user and attach secure HttpOnly cookies
   */
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, emailOrUsername, password } = req.body;
      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.ip || req.socket.remoteAddress || null;
      const userAgent = req.headers['user-agent'];
      const { browser, device } = parseUserAgent(userAgent);

      const result = await authService.loginUser({
        emailOrUsername: emailOrUsername || email,
        passwordPlain: password,
        ipAddress,
        device,
        browser,
      });

      // Handle Admin Multi-Factor Authentication requirement
      if ('requiresMfa' in result && result.requiresMfa) {
        return res.status(200).json({
          success: true,
          message: result.message,
          data: {
            requiresMfa: true,
            mfaToken: result.mfaToken,
            email: result.email,
            totpRequired: result.totpRequired,
          },
        });
      }

      // Issue tokens strictly inside secure HttpOnly cookies (neutralizes XSS extraction)
      res.cookie('accessToken', result.tokens!.accessToken, cookieOptions.accessToken);
      res.cookie('refreshToken', result.tokens!.refreshToken, cookieOptions.refreshToken);

      return res.status(200).json({
        success: true,
        message: 'Authentication successful.',
        data: {
          user: result.user,
          accessToken: result.tokens!.accessToken,
          refreshToken: result.tokens!.refreshToken,
        },
      });
    } catch (error: any) {
      const userMessage = error.message.includes('Database') || error.message.includes('query')
        ? 'A system error occurred during authentication.'
        : error.message;

      return next(new ApiError(401, userMessage, 'AUTHENTICATION_FAILED'));
    }
  }

  /**
   * Verify Admin MFA (Email OTP + Google Authenticator)
   */
  async verifyAdminMfa(req: Request, res: Response, next: NextFunction) {
    try {
      const { mfaToken, emailOtp, totpCode } = req.body;
      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.ip || req.socket.remoteAddress || null;
      const userAgent = req.headers['user-agent'];
      const { browser, device } = parseUserAgent(userAgent);

      const result = await authService.verifyAdminMfa({
        mfaToken,
        emailOtp,
        totpCode,
        ipAddress,
        device,
        browser,
      });

      res.cookie('accessToken', result.tokens.accessToken, cookieOptions.accessToken);
      res.cookie('refreshToken', result.tokens.refreshToken, cookieOptions.refreshToken);

      return res.status(200).json({
        success: true,
        message: 'Admin authentication and multi-factor verification successful.',
        data: {
          user: result.user,
          accessToken: result.tokens.accessToken,
          refreshToken: result.tokens.refreshToken,
        },
      });
    } catch (error: any) {
      return next(new ApiError(401, error.message, 'MFA_VERIFICATION_FAILED'));
    }
  }

  /**
   * Resend Admin MFA Email OTP
   */
  async resendAdminMfaOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { mfaToken } = req.body;
      const result = await authService.resendAdminMfaOtp(mfaToken);
      return res.status(200).json({
        success: true,
        message: result.message,
        data: {},
      });
    } catch (error: any) {
      return next(new ApiError(400, error.message, 'RESEND_OTP_FAILED'));
    }
  }

  /**
   * Refresh the access and refresh tokens (Rotation-enabled)
   */
  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      // Extract refresh token from secure HttpOnly cookies, or fall back to payload body
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
      if (!refreshToken) {
        throw new ApiError(400, 'Refresh token is required.', 'BAD_REQUEST');
      }

      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.ip || req.socket.remoteAddress || null;
      const userAgent = req.headers['user-agent'];
      const { browser, device } = parseUserAgent(userAgent);

      // Perform cryptographic validation and database rotation
      const result = await authService.refreshSession(refreshToken, ipAddress, device, browser);

      // Issue brand new rotated tokens inside secure HttpOnly cookies
      res.cookie('accessToken', result.accessToken, cookieOptions.accessToken);
      res.cookie('refreshToken', result.refreshToken, cookieOptions.refreshToken);

      return res.status(200).json({
        success: true,
        message: 'Tokens refreshed successfully.',
        data: {},
      });
    } catch (error: any) {
      const isRevoked = error.message.includes('revoked') || error.message.includes('validation') || error.message.includes('revocation') || error.message.includes('terminated');
      return next(new ApiError(isRevoked ? 401 : 400, error.message, 'SESSION_REFRESH_FAILED'));
    }
  }

  /**
   * Logout a user and clear secure session cookies
   */
  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
      
      if (refreshToken) {
        await authService.logoutUser(refreshToken);
      }

      // Evict secure session cookies from client browser
      res.clearCookie('accessToken', cookieOptions.clear);
      res.clearCookie('refreshToken', cookieOptions.clear);

      return res.status(200).json({
        success: true,
        message: 'Logged out successfully. Session invalidated.',
      });
    } catch (error: any) {
      return next(error);
    }
  }

  /**
   * Forgot password: Create reset token
   */
  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;

      const result = await authService.forgotPassword(email);

      return res.status(200).json({
        success: true,
        message: result.message,
        data: {},
      });
    } catch (error: any) {
      return next(error);
    }
  }

  /**
   * Reset password: Apply new password
   */
  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, token, password } = req.body;
      if (!email || !token || !password) {
        throw new ApiError(400, 'Email, verification code (OTP), and password are required.', 'BAD_REQUEST');
      }

      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.ip || req.socket.remoteAddress || null;
      const userAgent = req.headers['user-agent'];
      const { browser, device } = parseUserAgent(userAgent);

      const result = await authService.resetPassword({
        email,
        tokenPlain: token,
        passwordPlain: password,
        ipAddress,
        device,
        browser,
      });

      // Clear cookies to invalidate any active session upon password reset
      res.clearCookie('accessToken', cookieOptions.clear);
      res.clearCookie('refreshToken', cookieOptions.clear);

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      return next(new ApiError(400, error.message, 'PASSWORD_RESET_FAILED'));
    }
  }

  /**
   * Get current user details
   */
  async me(req: any, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Unauthorized: Access token missing or invalid.', 'UNAUTHORIZED');
      }

      const userDetails = await authRepository.findByEmail(req.user.email);
      if (!userDetails) {
        throw new ApiError(404, 'User profile not found.', 'NOT_FOUND');
      }

      const { passwordHash: _, ...safeUser } = userDetails;

      return res.status(200).json({
        success: true,
        message: 'Current user profile retrieved.',
        data: { user: safeUser },
      });
    } catch (error: any) {
      return next(error);
    }
  }
}

export const authController = new AuthController();
export default authController;
