/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { EmailContent } from './otpEmail.ts';

export interface ResetPasswordEmailParams {
  otp: string;
}

/**
 * Pure template function — takes a password-reset OTP and returns rendered
 * email content. No side effects, no OTP generation/verification, no I/O.
 */
export function resetPasswordEmailTemplate({ otp }: ResetPasswordEmailParams): EmailContent {
  return {
    subject: 'Reset Your MetaFirm Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #111827;">Password Reset Request</h2>
        <p style="color: #374151; font-size: 15px;">
          We received a request to reset your MetaFirm password. Use the code below to continue.
          This code is valid for a limited time.
        </p>
        <div style="font-size: 32px; font-weight: 700; letter-spacing: 8px; background: #f3f4f6; padding: 16px 24px; border-radius: 8px; text-align: center; margin: 24px 0;">
          ${otp}
        </div>
        <p style="color: #6b7280; font-size: 13px;">
          If you did not request a password reset, please ignore this email or contact support —
          your account remains secure.
        </p>
      </div>
    `,
  };
}
