/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';
import { UserRole } from '../types/index.ts';

// Password criteria validation
export const PasswordSchema = z.string()
  .min(8, 'Password must be at least 8 characters long')
  .refine((val) => /[A-Z]/.test(val), { message: 'Password must contain at least one uppercase letter' })
  .refine((val) => /[a-z]/.test(val), { message: 'Password must contain at least one lowercase letter' })
  .refine((val) => /\d/.test(val), { message: 'Password must contain at least one number' })
  .refine((val) => /[@$!%*?&()_+\-=\[\]{};':"\\|,.<>\/?#^]/.test(val), { message: 'Password must contain at least one special character' });

// User registration validation schema
export const RegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: PasswordSchema,
  referralCode: z.string().optional(),
});

// User login validation schema
export const LoginSchema = z.object({
  email: z.string().optional(),
  emailOrUsername: z.string().optional(),
  password: z.string().min(1, 'Password is required'),
}).refine((data) => data.email !== undefined || data.emailOrUsername !== undefined, {
  message: 'Username or Email is required',
  path: ['emailOrUsername'],
});

// Forgot password validation schema
export const ForgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

// Reset password validation schema
export const ResetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
  token: z.string().min(1, 'Verification code (OTP) is required'),
  password: PasswordSchema,
});

// User registration validation schema (legacy placeholder)
export const RegisterUserSchema = z.object({
  email: z.string().email('Invalid email address'),
});

// Admin User Role Update schema
export const UpdateUserAdminSchema = z.object({
  role: z.nativeEnum(UserRole).optional(),
});
