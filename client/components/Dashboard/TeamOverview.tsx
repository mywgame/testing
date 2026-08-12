/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Users2, ShieldAlert, Award, ArrowUpRight, TrendingUp, Coins } from 'lucide-react';
import { Card } from '../ui/Cards/index.tsx';

export const TeamOverview: React.FC = () => {
  const teamTiers = [
    { label: 'Direct Referrals (Level A)', count: 18, volume: '$124,500 USD', rate: '5% Comm.' },
    { label: 'Sub-Referrals (Level B)', count: 42, volume: '$280,000 USD', rate: '3% Comm.' },
    { label: 'Sub-Referrals (Level C)', count: 95, volume: '$435,000 USD', rate: '2% Comm.' },
    { label: 'Sub-Referrals (Level D)', count: 210, volume: '$890,000 USD', rate: '1% Comm.' },
  ];

  return (
    <Card hoverEffect={true} id="team-overview" className="border border-gray-100 text-left h-full flex flex-col justify-between">
      
      {/* Header Info */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono text-amber-600 font-bold uppercase tracking-wider block">
              Global Referral Tree
            </span>
            <h3 className="text-base font-display font-extrabold text-gray-950 tracking-tight">
              Affiliate Matrix Dashboard
            </h3>
          </div>
          <div className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider">
            Active Tree
          </div>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed font-sans">
          Earn multi-level downline commissions credited directly in real-time. Share your referral address securely to start expanding.
        </p>
      </div>

      {/* Main Aggregates stats line */}
      <div className="grid grid-cols-3 gap-3 p-3.5 bg-gray-50/80 border border-gray-100/50 rounded-2xl mb-6 text-center">
        <div className="space-y-0.5">
          <span className="text-[8px] font-mono text-gray-400 font-bold uppercase block">Total Members</span>
          <span className="text-base font-display font-extrabold text-gray-950 block">365 Nodes</span>
        </div>
        <div className="space-y-0.5 border-x border-gray-200/50">
          <span className="text-[8px] font-mono text-gray-400 font-bold uppercase block">Team Business</span>
          <span className="text-base font-display font-extrabold text-blue-600 block">$1.72M</span>
        </div>
        <div className="space-y-0.5">
          <span className="text-[8px] font-mono text-gray-400 font-bold uppercase block">Earned Commission</span>
          <span className="text-base font-display font-extrabold text-emerald-600 block">$14,845</span>
        </div>
      </div>

      {/* 4-level referral breakdown checklist list */}
      <div className="space-y-3 flex-grow">
        <span className="text-[9px] font-mono text-gray-400 font-bold uppercase tracking-wider block mb-1">
          Downline Tier Matrix
        </span>
        <div className="space-y-2.5" role="list">
          {teamTiers.map((tier, idx) => (
            <div
              key={idx}
              className="p-3 bg-white border border-gray-100 rounded-2xl flex items-center justify-between hover:border-blue-100 transition-colors"
              role="listitem"
            >
              <div className="flex items-center space-x-3 text-left">
                {/* Visual marker dot */}
                <div className="w-8 h-8 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-blue-600 shadow-3xs font-display font-bold text-xs">
                  {idx === 0 ? 'A' : idx === 1 ? 'B' : idx === 2 ? 'C' : 'D'}
                </div>
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-gray-950 block leading-tight">{tier.label}</span>
                  <span className="text-[10px] font-mono text-gray-400 font-bold uppercase block leading-none">{tier.count} members synced</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-mono font-extrabold text-blue-600 block">{tier.volume}</span>
                <span className="text-[9px] font-mono text-emerald-600 font-extrabold block">{tier.rate}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer hint */}
      <div className="mt-6 pt-4 border-t border-gray-50 flex items-center space-x-2 text-[10px] font-mono text-gray-400">
        <ShieldAlert className="w-4 h-4 text-amber-500 animate-pulse" />
        <span>Strict compliance rules: no self-referral structures allowed.</span>
      </div>

    </Card>
  );
};

export default TeamOverview;
