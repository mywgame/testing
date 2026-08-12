/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { EmailContent } from './otpEmail.ts';

export interface WelcomeEmailParams {
  username: string;
}

/**
 * Pure template function — takes a username and returns rendered welcome
 * email content. No side effects, no DB access, no I/O.
 */
export function welcomeEmailTemplate({ username }: WelcomeEmailParams): EmailContent {
  return {
    subject: 'Welcome to MetaFirm',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #111827;">Welcome to MetaFirm, ${username}!</h2>
        <p style="color: #374151; font-size: 15px;">
          Your account has been created successfully. You're all set to explore
          deposits, VIP rewards, referrals, and more on the MetaFirm platform.
        </p>
        <p style="color: #6b7280; font-size: 13px;">
          If you did not create this account, please contact our support team immediately.
        </p>
      </div>
    `,
  };
}
