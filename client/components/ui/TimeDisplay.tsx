/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { formatDateTime } from '../../utils/dateFormatter.ts';

interface TimeDisplayProps {
  date: string | number | Date | null | undefined;
  format?: 'full' | 'short' | 'timeOnly' | 'relative';
  showUtcTooltip?: boolean;
  className?: string;
}

/**
 * Clean UI component to render UTC dates in the user's Local Timezone with an informative UTC tooltip.
 */
export const TimeDisplay: React.FC<TimeDisplayProps> = ({
  date,
  format = 'full',
  showUtcTooltip = true,
  className = '',
}) => {
  const formatted = formatDateTime(date);

  let textToDisplay = formatted.localDate;
  if (format === 'short') textToDisplay = formatted.localShort;
  else if (format === 'timeOnly') textToDisplay = formatted.localTime;
  else if (format === 'relative') textToDisplay = formatted.relative;

  return (
    <span
      className={`inline-flex items-center gap-1 cursor-default ${className}`}
      title={showUtcTooltip ? `System Time: ${formatted.utcFull} (${formatted.timeZoneAbbr})` : undefined}
    >
      <span>{textToDisplay}</span>
    </span>
  );
};
