/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Utility to generate public production-grade referral links.
 * Never uses Cloud Run URL, Railway URL, localhost, or request/backend origin.
 */
export function getReferralLink(referralCode: string): string {
  if (!referralCode) return '';

  const configuredUrl = (
    import.meta.env.VITE_FRONTEND_URL ||
    import.meta.env.VITE_APP_URL ||
    'https://metafirm.app'
  ).trim().replace(/\/+$/, '');

  // Safety fallback: if configured URL contains dev/cloudrun/railway/localhost patterns,
  // enforce the public production domain 'https://metafirm.app'
  if (
    configuredUrl.includes('run.app') ||
    configuredUrl.includes('railway') ||
    configuredUrl.includes('localhost') ||
    configuredUrl.includes('127.0.0.1')
  ) {
    return `https://metafirm.app/register?ref=${referralCode}`;
  }

  return `${configuredUrl}/register?ref=${referralCode}`;
}
