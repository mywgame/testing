/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TrendingUp, ArrowUpRight } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme.ts';
import { useAvatar } from '../../hooks/useAvatar.ts';
import usdtIcon from '../../../assets/icons/usdt-svg.svg';

interface HeroBalanceCardProps {
  totalBalance: number;
  totalEarned: number;
  totalWithdrawn: number;
  identity?: {
    name: string;
    id: string;
    rankLabel: string;
    rankColor: string;
    rankBg: string;
    rankIcon: string;
  };
}

const fmt = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

/**
 * Total Balance hero card — now with User Profile integrated as requested.
 * Shows the user avatar, name, user ID, VIP level, wallet balance, total earned, and total withdrawn.
 */
export const HeroBalanceCard: React.FC<HeroBalanceCardProps> = ({
  totalBalance,
  totalEarned,
  totalWithdrawn,
  identity,
}) => {
  const { t } = useTheme();
  const { avatarUrl } = useAvatar();

  const subStats = [
    { label: 'Total Earned', value: fmt(totalEarned), color: 'text-emerald-500', Icon: TrendingUp },
    { label: 'Total Withdrawn', value: fmt(totalWithdrawn), color: 'text-red-400', Icon: ArrowUpRight },
  ];

  return (
    <div className={`relative backdrop-blur-xl rounded-3xl border overflow-hidden transition-all duration-300 ${t.card}`} id="total-balance-card">
      {/* Decorative glow blobs */}
      <div className={`absolute -right-16 -top-16 w-64 h-64 rounded-full blur-3xl pointer-events-none ${t.isDark ? 'bg-cyan-500/20' : 'bg-violet-400/20'}`} />
      <div className={`absolute -left-10 -bottom-10 w-48 h-48 rounded-full blur-3xl pointer-events-none ${t.isDark ? 'bg-purple-600/20' : 'bg-sky-400/20'}`} />

      <div className="relative flex flex-col p-7 space-y-6">
        
        {/* Top: User Avatar, Name, User ID, VIP Level */}
        {identity && (
          <div className={`flex items-center justify-between pb-5 border-b ${t.sep}`}>
            <div className="flex items-center gap-4">
              <div className={`relative w-12 h-12 rounded-2xl bg-gradient-to-br ${identity.rankBg} border border-white/20 flex items-center justify-center shrink-0 overflow-hidden shadow-lg shadow-black/10`}>
                <img src={avatarUrl} alt={identity.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col leading-tight text-left min-w-0">
                <span className={`font-bold text-base sm:text-lg truncate max-w-[150px] sm:max-w-xs ${t.text}`}>
                  {identity.name}
                </span>
                <span className={`text-xs font-mono mt-0.5 ${t.textSub}`}>
                  {identity.id}
                </span>
              </div>
            </div>

            <div
              className="flex items-center gap-1 px-3 py-1 rounded-xl font-bold text-xs sm:text-sm shadow-sm"
              style={{ color: identity.rankColor, background: `${identity.rankColor}15`, border: `1px solid ${identity.rankColor}25` }}
            >
              <span>{identity.rankIcon}</span>
              <span>{identity.rankLabel}</span>
            </div>
          </div>
        )}

        {/* Bottom content: Balance + Substats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          {/* Left: label + big number */}
          <div className="text-left">
            <div className="flex items-center gap-2 mb-2">
              <div className={`p-2 rounded-xl ${t.isDark ? 'bg-cyan-500/20' : 'bg-cyan-500/15'}`}>
                <img src={usdtIcon} alt="USDT" className="w-5 h-5 object-contain" />
              </div>
              <span className={`text-xs font-semibold uppercase tracking-widest ${t.textSub}`}>Total Balance</span>
            </div>
            <p className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-none bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <p className={`text-xs mt-2 ${t.textSub}`}>USDT · MetaFirm Wallet</p>
          </div>

          {/* Right: sub-stats card */}
          <div className={`flex-shrink-0 w-full sm:w-auto rounded-2xl border px-5 py-4 backdrop-blur-sm transition-all duration-300 ${t.isDark ? 'bg-white/5 border-white/10' : 'bg-black/4 border-black/8'}`}>
            <div className="grid grid-cols-2 gap-0">
              {subStats.map(({ label, value, color, Icon }, i) => (
                <div key={label} className={`flex flex-col items-center text-center px-4 sm:px-6 ${i > 0 ? `border-l ${t.sep}` : ''}`}>
                  <div className={`p-1.5 rounded-lg mb-2 ${t.isDark ? 'bg-white/8' : 'bg-black/6'}`}>
                    <Icon className={`w-3.5 h-3.5 ${color}`} />
                  </div>
                  <p className={`text-base font-extrabold ${color}`}>{value}</p>
                  <p className={`text-[10px] uppercase tracking-wider mt-0.5 ${t.textMuted}`}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HeroBalanceCard;
