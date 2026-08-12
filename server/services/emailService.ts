/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { EmailProvider } from '../providers/emailProvider.ts';
import { ResendProvider } from '../providers/resendProvider.ts';
import { otpEmailTemplate } from '../templates/otpEmail.ts';
import { resetPasswordEmailTemplate } from '../templates/resetPasswordEmail.ts';
import { welcomeEmailTemplate } from '../templates/welcomeEmail.ts';

/**
 * BUSINESS RULE — Single Source of Truth:
 * EmailService is the ONLY place in the codebase responsible for sending
 * email. Every future module (Authentication, Deposit, Withdrawal, VIP,
 * Notifications, Support, Security, Admin, etc.) MUST call EmailService
 * instead of talking to an email provider directly.
 *
 * EmailService depends on the EmailProvider INTERFACE (Dependency Injection),
 * never on a concrete provider like ResendProvider. Swapping to a different
 * vendor (SES, Mailgun, Postmark, SendGrid) never requires changing this file
 * — only a new class implementing EmailProvider.
 *
 * Scope (infrastructure only):
 * - No OTP generation.
 * - No OTP verification.
 * - No database access.
 * - No repository access.
 * - No controller access.
 * - No business logic of any kind — EmailService only renders a template and
 *   asks the provider to send it.
 */
export class EmailService {
  private readonly provider: EmailProvider;

  constructor(provider: EmailProvider = new ResendProvider()) {
    this.provider = provider;
  }

  /**
   * Send a one-time-password email (e.g. registration / login verification).
   * Not wired into any auth flow yet — infrastructure only, ready for future use.
   */
  async sendOtpEmail(to: string, otp: string, purpose?: string): Promise<void> {
    const { subject, html } = otpEmailTemplate({ otp, purpose });
    await this.provider.send({ to, subject, html });
  }

  /**
   * Send a password-reset OTP email.
   * Not wired into any auth flow yet — infrastructure only, ready for future use.
   */
  async sendPasswordResetOtp(to: string, otp: string): Promise<void> {
    const { subject, html } = resetPasswordEmailTemplate({ otp });
    await this.provider.send({ to, subject, html });
  }

  /**
   * Send a welcome email after successful registration.
   * Not wired into any registration flow yet — infrastructure only, ready for future use.
   */
  async sendWelcomeEmail(to: string, username: string): Promise<void> {
    const { subject, html } = welcomeEmailTemplate({ username });
    await this.provider.send({ to, subject, html });
  }
}

export const emailService = new EmailService();
export default emailService;
