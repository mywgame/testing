/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme.ts';
import { IncomeAccent } from '../../types/index.ts';

interface IncomeStatCardProps {
  label: string;
  today: number;
  total: number;
  icon: LucideIcon;
  accent: IncomeAccent;
}

// Static class lookup (Tailwind can't resolve `bg-${accent}-500/15` at build
// time, so every accent variant is spelled out explicitly).
const ACCENT_CLASSES: Record<IncomeAccent, { iconBg: string; iconText: string; valueText: string }> = {
  emerald: { iconBg: 'bg-emerald-500/15', iconText: 'text-emerald-500', valueText: 'text-emerald-500' },
  cyan: { iconBg: 'bg-cyan-500/15', iconText: 'text-cyan-500', valueText: 'text-cyan-500' },
  purple: { iconBg: 'bg-purple-500/15', iconText: 'text-purple-500', valueText: 'text-purple-500' },
  amber: { iconBg: 'bg-amber-500/15', iconText: 'text-amber-500', valueText: 'text-amber-500' },
};

/**
 * Single income card (Daily Yield / Referral / Team / Incentive) —
 * pixel-matched to the figma reference. Purely props-driven so it can be
 * mapped over both mock data now and live `earnings.*` data in Phase 2.
 */
export const IncomeStatCard: React.FC<IncomeStatCardProps> = ({ label, today, total, icon: Icon, accent }) => {
  const { t } = useTheme();
  const a = ACCENT_CLASSES[accent];

  return (
    <div className={`backdrop-blur-lg rounded-2xl p-5 border transition-all duration-300 ${t.card}`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-xl ${a.iconBg}`}>
          <Icon className={`w-4 h-4 ${a.iconText}`} />
        </div>
        <span className={`text-xs font-semibold uppercase tracking-wider ${t.textMuted}`}>{label}</span>
      </div>

      {/* Total Earned (Primary Metric) */}
      <div className={`rounded-xl px-3 py-2 mb-2 ${t.inset}`}>
        <p className={`text-[10px] uppercase tracking-widest mb-0.5 ${t.textMuted}`}>Total Earned</p>
        <p className={`text-lg font-extrabold ${a.valueText}`}>
          ${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>

      {/* Today (Secondary Metric) */}
      <div className="px-1">
        <p className={`text-[10px] uppercase tracking-widest mb-0.5 ${t.textMuted}`}>Today</p>
        <p className={`text-sm font-bold ${t.text}`}>
          +${today.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>
    </div>
  );
};

export default IncomeStatCard;
