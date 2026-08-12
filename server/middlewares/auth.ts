/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Request, Response, NextFunction } from 'express';
import { config } from '../config/index.ts';
import { ApiError } from './errorHandler.ts';
import { UserRole } from '../../shared/types/index.ts';
import { verifyAccessToken } from '../utils/jwt.ts';

// Extend Express Request type to attach the authenticated user
export interface AuthRequest extends Request {
  user?: {
    uid: string;
    email: string;
    role: UserRole;
  };
}

/**
 * Authentication Middleware: Validates Bearer Access Tokens or HttpOnly Cookies
 */
export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  // 1. Try to read token from HttpOnly cookie first
  let token = req.cookies?.accessToken || null;

  // 2. Fall back to Authorization Bearer header to preserve API-based or simulated client access
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split('Bearer ')[1];
    }
  }

  if (!token) {
    return next(new ApiError(401, 'Unauthorized: Missing or malformed access token', 'MISSING_TOKEN'));
  }

  try {
    // Verify standard JWT token with configure secrets, issuer, and audience
    const decoded = verifyAccessToken(token);
    
    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      role: decoded.role || UserRole.USER,
    };
    
    next();
  } catch (error) {
    console.error('Error verifying identity token:', error);
    return next(new ApiError(401, 'Unauthorized: Invalid or expired access token', 'INVALID_TOKEN'));
  }
};

/**
 * Authorization Middleware: Restricts endpoints to specific Roles
 */
export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ApiError(401, 'Unauthorized: Authentication required', 'AUTHENTICATION_REQUIRED'));
    }

    const hasRole = allowedRoles.includes(req.user.role);
    if (!hasRole) {
      return next(new ApiError(403, 'Forbidden: Insufficient platform permissions', 'INSUFFICIENT_PERMISSIONS'));
    }

    next();
  };
};
