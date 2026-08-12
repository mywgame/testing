/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import jwt from 'jsonwebtoken';
import { config } from '../config/index.ts';
import { UserRole } from '../../shared/types/index.ts';

export interface TokenPayload {
  uid: string;
  email: string;
  role: UserRole;
}

const JWT_ISSUER = 'cefi-platform-auth';
const JWT_AUDIENCE = 'cefi-platform-client';

/**
 * Generate a JWT Access Token.
 */
export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as any,
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
  });
}

/**
 * Generate a JWT Refresh Token.
 */
export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn as any,
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
  });
}

/**
 * Verify a JWT Access Token.
 */
export function verifyAccessToken(token: string): TokenPayload {
  if (!token) {
    throw new Error('Token is undefined or empty');
  }
  return jwt.verify(token, config.jwt.secret, {
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
  }) as TokenPayload;
}

/**
 * Verify a JWT Refresh Token.
 */
export function verifyRefreshToken(token: string): TokenPayload {
  if (!token) {
    throw new Error('Token is undefined or empty');
  }
  return jwt.verify(token, config.jwt.refreshSecret, {
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
  }) as TokenPayload;
}

