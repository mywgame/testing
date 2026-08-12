/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Resend } from 'resend';
import { config } from '../config/index.ts';
import type { EmailProvider, SendEmailParams } from './emailProvider.ts';

/**
 * ResendProvider — the ONLY file in the entire codebase allowed to import or
 * call the Resend SDK. Every other file must go through EmailService, which
 * depends only on the EmailProvider interface, never on this class directly.
 *
 * Configuration is REQUIRED — no hardcoded defaults. Missing configuration
 * fails fast (throws) at construction time rather than failing silently
 * later when an email is actually sent.
 */
function formatResendFromAddress(rawFrom: string | undefined): string {
  if (!rawFrom) return '';
  let cleaned = rawFrom.replace(/^['"]|['"]$/g, '').trim();

  const emailMatch = cleaned.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  if (!emailMatch) {
    return cleaned;
  }
  const email = emailMatch[1];

  let name = '';
  if (cleaned.includes('<')) {
    name = cleaned.substring(0, cleaned.indexOf('<')).replace(/['"]/g, '').trim();
  } else {
    const beforeEmail = cleaned.substring(0, cleaned.indexOf(email)).replace(/['"]/g, '').trim();
    if (beforeEmail) {
      name = beforeEmail;
    }
  }

  if (name) {
    return `${name} <${email}>`;
  }
  return email;
}

export class ResendProvider implements EmailProvider {
  private readonly client: Resend;
  private readonly fromAddress: string;

  constructor(apiKey: string | undefined = config.email.resendApiKey, fromAddress: string | undefined = config.email.fromAddress) {
    const cleanApiKey = apiKey ? apiKey.replace(/^['"]|['"]$/g, '').trim() : '';
    const cleanFromAddress = formatResendFromAddress(fromAddress);

    if (!cleanApiKey) {
      throw new Error('RESEND_API_KEY is not configured in the environment. Real email delivery is required.');
    }
    if (!cleanFromAddress) {
      throw new Error('EMAIL_FROM is not configured in the environment. Real email delivery is required.');
    }

    this.client = new Resend(cleanApiKey);
    this.fromAddress = cleanFromAddress;
  }

  async send({ to, subject, html }: SendEmailParams): Promise<void> {
    console.log(`[Resend] Initiating real email delivery to ${to} with subject: "${subject}"`);
    try {
      const response = await this.client.emails.send({
        from: this.fromAddress,
        to,
        subject,
        html,
      });

      console.log('[Resend API Response]:', JSON.stringify(response, null, 2));

      if (response.error) {
        throw new Error(`Resend API Error (HTTP ${response.error.statusCode || '422'}): ${response.error.message} [Name: ${response.error.name}]`);
      }
    } catch (err: any) {
      console.error('[Resend Send Exception]:', err);
      throw err;
    }
  }
}

export default ResendProvider;
