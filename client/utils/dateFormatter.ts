/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Utility to format UTC timestamps from backend into User's Local Timezone
 * while providing precise UTC details.
 */

export interface FormattedDateResult {
  localDate: string;        // e.g. "Aug 22, 2026, 08:30:15 AM"
  localShort: string;       // e.g. "Aug 22, 08:30 AM"
  localTime: string;        // e.g. "08:30 AM"
  utcFull: string;          // e.g. "2026-08-22 03:00:15 UTC"
  timeZoneAbbr: string;     // e.g. "IST" or "+05:30"
  relative: string;         // e.g. "5 mins ago", "Just now"
}

/**
 * Format any ISO date string, timestamp number, or Date object into localized and UTC representations.
 */
export function formatDateTime(rawDate: string | number | Date | null | undefined): FormattedDateResult {
  if (!rawDate) {
    return {
      localDate: 'N/A',
      localShort: 'N/A',
      localTime: 'N/A',
      utcFull: 'N/A',
      timeZoneAbbr: '',
      relative: 'N/A',
    };
  }

  const d = new Date(rawDate);
  if (isNaN(d.getTime())) {
    return {
      localDate: String(rawDate),
      localShort: String(rawDate),
      localTime: String(rawDate),
      utcFull: String(rawDate),
      timeZoneAbbr: '',
      relative: String(rawDate),
    };
  }

  // Local formats
  const localDate = d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const localShort = d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const localTime = d.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  // UTC Format
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  const hours = String(d.getUTCHours()).padStart(2, '0');
  const minutes = String(d.getUTCMinutes()).padStart(2, '0');
  const seconds = String(d.getUTCSeconds()).padStart(2, '0');
  const utcFull = `${year}-${month}-${day} ${hours}:${minutes}:${seconds} UTC`;

  // Timezone identifier/offset
  let timeZoneAbbr = '';
  try {
    const tzString = Intl.DateTimeFormat().resolvedOptions().timeZone;
    timeZoneAbbr = tzString ? tzString.split('/').pop()?.replace(/_/g, ' ') || 'Local' : 'Local';
  } catch {
    timeZoneAbbr = 'Local';
  }

  // Relative calculation
  const now = Date.now();
  const diffSec = Math.floor((now - d.getTime()) / 1000);
  let relative = 'Just now';
  if (diffSec >= 86400) {
    const days = Math.floor(diffSec / 86400);
    relative = `${days}d ago`;
  } else if (diffSec >= 3600) {
    const hrs = Math.floor(diffSec / 3600);
    relative = `${hrs}h ago`;
  } else if (diffSec >= 60) {
    const mins = Math.floor(diffSec / 60);
    relative = `${mins}m ago`;
  } else if (diffSec > 10) {
    relative = `${diffSec}s ago`;
  }

  return {
    localDate,
    localShort,
    localTime,
    utcFull,
    timeZoneAbbr,
    relative,
  };
}
