/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import { authController } from '../../controllers/authController.ts';
import { requireAuth } from '../../middlewares/auth.ts';
import { validateRequest } from '../../middlewares/validate.ts';
import {
  RegisterSchema,
  LoginSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
} from '../../../shared/validators/index.ts';

const router = Router();

/**
 * @route POST /api/v1/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', validateRequest(RegisterSchema), authController.register);

/**
 * @route POST /api/v1/auth/verify-otp
 * @desc Verify registration OTP to activate account
 * @access Public
 */
router.post('/verify-otp', authController.verifyRegistrationOtp);

/**
 * @route POST /api/v1/auth/resend-otp
 * @desc Resend registration OTP
 * @access Public
 */
router.post('/resend-otp', authController.resendRegistrationOtp);

/**
 * @route POST /api/v1/auth/login
 * @desc Login user and retrieve JWT tokens
 * @access Public
 */
router.post('/login', validateRequest(LoginSchema), authController.login);

/**
 * @route POST /api/v1/auth/admin/verify-mfa
 * @desc Verify Admin MFA (Email OTP + Google Authenticator)
 * @access Public
 */
router.post('/admin/verify-mfa', authController.verifyAdminMfa);

/**
 * @route POST /api/v1/auth/admin/resend-mfa-otp
 * @desc Resend Admin MFA Email OTP
 * @access Public
 */
router.post('/admin/resend-mfa-otp', authController.resendAdminMfaOtp);

/**
 * @route POST /api/v1/auth/refresh
 * @desc Rotate expired Access Tokens using a valid Refresh Token
 * @access Public
 */
router.post('/refresh', authController.refresh);

/**
 * @route POST /api/v1/auth/logout
 * @desc Invalidate Refresh Token and clear session
 * @access Public
 */
router.post('/logout', authController.logout);

/**
 * @route POST /api/v1/auth/forgot-password
 * @desc Initiate password reset process
 * @access Public
 */
router.post('/forgot-password', validateRequest(ForgotPasswordSchema), authController.forgotPassword);

/**
 * @route POST /api/v1/auth/reset-password
 * @desc Apply new password using a valid reset token
 * @access Public
 */
router.post('/reset-password', validateRequest(ResetPasswordSchema), authController.resetPassword);

/**
 * @route GET /api/v1/auth/me
 * @desc Fetch current authenticated user's profile info
 * @access Private
 */
router.get('/me', requireAuth, authController.me);

export default router;
