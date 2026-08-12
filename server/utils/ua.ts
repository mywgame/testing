/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UAInfo {
  browser: string;
  device: string;
}

/**
 * Highly responsive user agent string parser for browser and device detection
 */
export function parseUserAgent(userAgentString: string | undefined): UAInfo {
  if (!userAgentString) {
    return { browser: 'Unknown Browser', device: 'Desktop' };
  }

  let browser = 'Unknown Browser';
  let device = 'Desktop';
  const ua = userAgentString.toLowerCase();

  // Simple browser detection
  if (ua.includes('firefox')) {
    browser = 'Firefox';
  } else if (ua.includes('edg/')) {
    browser = 'Edge';
  } else if (ua.includes('chrome') && !ua.includes('chromium')) {
    browser = 'Chrome';
  } else if (ua.includes('safari') && !ua.includes('chrome') && !ua.includes('chromium')) {
    browser = 'Safari';
  } else if (ua.includes('opera') || ua.includes('opr/')) {
    browser = 'Opera';
  } else if (ua.includes('msie') || ua.includes('trident/')) {
    browser = 'Internet Explorer';
  }

  // Simple device detection
  if (ua.includes('mobi') || ua.includes('android') || ua.includes('iphone') || ua.includes('ipad')) {
    if (ua.includes('iphone')) {
      device = 'iPhone';
    } else if (ua.includes('ipad')) {
      device = 'iPad';
    } else if (ua.includes('android')) {
      device = 'Android Device';
    } else {
      device = 'Mobile Device';
    }
  }

  return { browser, device };
}
