/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * A single outgoing email, already fully rendered (subject + HTML body).
 * Templates produce this shape; providers only know how to transport it.
 */
export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

/**
 * EmailProvider — the abstraction boundary between EmailService and any
 * concrete vendor SDK (Resend today, SES / Mailgun / Postmark / SendGrid
 * tomorrow).
 *
 * EmailService depends ONLY on this interface, never on a concrete
 * implementation, so swapping vendors never requires changing EmailService.
 */
export interface EmailProvider {
  send(params: SendEmailParams): Promise<void>;
}
