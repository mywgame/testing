/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  jwt: {
    secret: process.env.JWT_SECRET || 'super-secret-key-change-in-production',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'super-refresh-secret-key-change-in-production',
    expiresIn: '15m',
    refreshExpiresIn: '7d',
  },
  database: {
    host: process.env.SQL_HOST,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    dbName: process.env.SQL_DB_NAME,
    adminUser: process.env.SQL_ADMIN_USER,
    adminPassword: process.env.SQL_ADMIN_PASSWORD,
  },
  email: {
    // No fallback defaults — these are required. EmailService/ResendProvider
    // fail fast (throw) at construction time if either is missing.
    resendApiKey: process.env.RESEND_API_KEY,
    fromAddress: process.env.EMAIL_FROM,
  }
};
