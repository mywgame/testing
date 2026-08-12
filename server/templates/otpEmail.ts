/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface OtpEmailParams {
  otp: string;
  purpose?: string;
}

export interface EmailContent {
  subject: string;
  html: string;
}

/**
 * Pure template function — takes an OTP and returns rendered email content.
 * No side effects, no OTP generation, no OTP verification, no I/O.
 */
export function otpEmailTemplate({ otp, purpose = 'verify your account' }: OtpEmailParams): EmailContent {
  return {
    subject: 'Your MetaFirm Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #111827;">MetaFirm Verification Code</h2>
        <p style="color: #374151; font-size: 15px;">
          Use the code below to ${purpose}. This code is valid for a limited time.
        </p>
        <div style="font-size: 32px; font-weight: 700; letter-spacing: 8px; background: #f3f4f6; padding: 16px 24px; border-radius: 8px; text-align: center; margin: 24px 0;">
          ${otp}
        </div>
        <p style="color: #6b7280; font-size: 13px;">
          If you did not request this code, you can safely ignore this email.
        </p>
      </div>
    `,
  };
}
