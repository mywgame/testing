/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserRole {
  USER = 'USER',
  VIP = 'VIP',
  ADMIN = 'ADMIN',
  SUPERADMIN = 'SUPERADMIN',
}

export interface User {
  id: string;
  uid: string; // Unique authentication identifier (e.g. standard user ID or JWT subject)
  email: string;
  role: UserRole;
  name?: string;
  phone?: string;
  status?: string;
  userId?: string;
  referralCode?: string;
  vipTier?: string;
  walletBalance?: number;
  passwordChangedAt?: Date | string;
  createdAt: Date;
  updatedAt: Date;
}

// Global Standard API Response interface
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}
