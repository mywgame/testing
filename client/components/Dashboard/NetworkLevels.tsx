/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Link as LinkIcon, Copy, Check, ChevronRight } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme.ts';
import { MockNetworkSummary } from '../../types/index.ts';

export interface NetworkSummaryData {
  referralLink: string;
  commissionRateLabel: string;
  thisMonthEarnings: number;
  totalMembers: number;
  levels: Array<{
    level: string;
    count: number;
    earnings: number;
  }>;
}

interface NetworkLevelsProps {
  network: NetworkSummaryData;
}

const LEVEL_COLORS = [
  'from-cyan-500 to-blue-500',
  'from-purple-500 to-pink-500',
  'from-emerald-500 to-teal-500',
  'from-orange-500 to-red-500',
];

/**
 * Network Levels + Referral Link card — pixel-matched to the figma
 * reference. All values (member counts, per-level earnings, referral link,
 * commission rate, this-month total) arrive via the `network` prop, so
 * Phase 2 can feed this from the real `/users/dashboard` team payload
 * without touching this component.
 */
export const NetworkLevels: React.FC<NetworkLevelsProps> = ({ network }) => {
  const { t } = useTheme();
  const [copied, setCopied] = useState(false);

  const copyReferral = () => {
    navigator.clipboard.writeText(network.referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`backdrop-blur-lg rounded-2xl p-5 border transition-all duration-300 ${t.card}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-base font-semibold ${t.text}`}>Network Levels</h3>
        <ChevronRight className={`w-4 h-4 ${t.textMuted}`} />
      </div>

      <div className="space-y-3">
        {network.levels.map((lvl, i) => {
          const pct = Math.round((lvl.count / (network.totalMembers || 1)) * 100);
          return (
            <div key={lvl.level}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className={`bg-gradient-to-br ${LEVEL_COLORS[i]} w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white`}>
                    {lvl.level}
                  </div>
                  <span className={`text-sm font-medium ${t.text}`}>{lvl.count} members</span>
                </div>
                <span className={`text-xs ${t.textSub}`}>${lvl.earnings.toLocaleString()}</span>
              </div>
              <div className={`w-full rounded-full h-1.5 ${t.bar}`}>
                <div className={`bg-gradient-to-r ${LEVEL_COLORS[i]} h-1.5 rounded-full`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Referral link */}
      <div className={`mt-5 pt-4 border-t ${t.sep}`}>
        <div className="flex items-center gap-2 mb-3">
          <LinkIcon className="w-4 h-4 text-cyan-500" />
          <span className={`text-sm font-semibold ${t.text}`}>Your Referral Link</span>
        </div>
        <div className={`flex items-center gap-2 rounded-xl px-3 py-2 ${t.inset}`}>
          <span className={`text-xs truncate flex-1 font-mono ${t.textSub}`}>{network.referralLink}</span>
          <button
            onClick={copyReferral}
            className="shrink-0 bg-gradient-to-r from-cyan-500 to-purple-500 p-1.5 rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5 text-white" />}
          </button>
        </div>
        {copied && <p className="text-xs text-green-500 mt-1.5 text-center">Copied to clipboard!</p>}

        <div className="flex justify-between text-xs mt-3">
          <span className={t.textSub}>Commission Rate</span>
          <span className="font-semibold text-cyan-500">{network.commissionRateLabel}</span>
        </div>
        <div className="flex justify-between text-xs mt-1.5">
          <span className={t.textSub}>This Month</span>
          <span className="font-semibold text-green-500">
            ${network.thisMonthEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default NetworkLevels;
