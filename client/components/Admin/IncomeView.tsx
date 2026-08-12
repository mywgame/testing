/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  TrendingUp,
  Layers,
  Award,
  Info,
  ShieldCheck,
  CheckCircle2,
  Users,
  Percent,
  Compass
} from 'lucide-react';
import { Card, TableContainer } from '../ui/index.ts';
import { ThemeTokens } from '../ui/themeTokens.ts';

interface IncomeViewProps {
  t: ThemeTokens;
  isDark: boolean;
}

export const IncomeView: React.FC<IncomeViewProps> = ({ t, isDark }) => {
  const matrixData = [
    { level: 'VIP1', a: '—', b: '—', c: '—', d: '—' },
    { level: 'VIP2', a: '10%', b: '5%', c: '3%', d: '2%' },
    { level: 'VIP3', a: '12%', b: '6%', c: '4%', d: '3%' },
    { level: 'VIP4', a: '15%', b: '8%', c: '5%', d: '4%' },
    { level: 'VIP5', a: '17%', b: '9%', c: '6%', d: '5%' },
    { level: 'VIP6', a: '20%', b: '10%', c: '7%', d: '6%' },
    { level: 'VIP7', a: '22%', b: '11%', c: '8%', d: '7%' },
    { level: 'VIP8', a: '24%', b: '12%', c: '9%', d: '8%' },
  ];

  return (
    <div className="space-y-6 text-left relative animate-fade-in">
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className={`text-xl font-bold tracking-tight ${t.text}`}>Team Commission Engine</h2>
            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-extrabold uppercase tracking-wider ${
              isDark 
                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                : 'bg-blue-50 text-blue-700 border border-blue-100'
            }`}>
              Business Logic • Read Only
            </span>
          </div>
          <p className={`text-xs mt-1 ${t.textSub}`}>
            Official read-only business logic ledger representing MetaFirm's multi-tier team commission rules.
          </p>
        </div>
      </div>

      {/* Information Card: How Team Commission Works */}
      <Card className="p-6 relative overflow-hidden group border border-blue-500/20">
        {/* Subtle decorative background gradient */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-start gap-4">
          <div className={`p-2.5 rounded-xl flex-shrink-0 ${
            isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'
          }`}>
            <Compass className="w-5 h-5 animate-pulse" />
          </div>
          
          <div className="space-y-4 w-full">
            <div>
              <h3 className={`font-display font-extrabold text-sm sm:text-base tracking-tight ${t.text}`}>
                How Team Commission Works
              </h3>
              <p className={`text-xs mt-0.5 ${t.textSub}`}>
                Instant automatic distribution rules for downline interest payouts.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
              {[
                "Team Commission is generated ONLY when a downline user successfully claims Daily DPY.",
                "Commission is distributed instantly after a successful DPY Claim.",
                "Distribution is limited to qualified uplines across Level A, Level B, Level C and Level D.",
                "The commission percentage is determined by the CURRENT VIP level of the receiving upline.",
                "The downline user's VIP level never affects the commission percentage.",
                "This page represents MetaFirm's core business rules and is read-only."
              ].map((text, idx) => (
                <div key={idx} className="flex items-start space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span className={`text-xs leading-relaxed ${t.textSub}`}>
                    {text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Official Team Commission Matrix Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-purple-500" />
          <h3 className={`font-display font-bold text-sm tracking-tight ${t.text}`}>
            Official Team Commission Matrix
          </h3>
        </div>

        <TableContainer>
          <table className="w-full text-left border-collapse font-sans">
            <thead>
              <tr className={`border-b ${t.sep} ${isDark ? 'bg-white/3' : 'bg-black/2'}`}>
                <th className={`px-6 py-4 text-[10px] font-mono font-bold uppercase tracking-wider ${t.textMuted} w-1/5`}>
                  VIP Level
                </th>
                <th className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${t.text}`}>Level A (Direct)</span>
                  </div>
                </th>
                <th className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${t.text}`}>Level B (Tier 2)</span>
                  </div>
                </th>
                <th className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                    <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${t.text}`}>Level C (Tier 3)</span>
                  </div>
                </th>
                <th className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${t.text}`}>Level D (Tier 4)</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {matrixData.map((row, index) => {
                const isVip1 = row.level === 'VIP1';
                return (
                  <tr 
                    key={row.level} 
                    className={`transition-colors duration-150 ${
                      isDark 
                        ? 'hover:bg-white/2' 
                        : 'hover:bg-black/[0.015]'
                    } ${index % 2 === 1 ? (isDark ? 'bg-white/[0.01]' : 'bg-black/[0.005]') : ''}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2.5">
                        <div className={`p-1.5 rounded-lg flex items-center justify-center ${
                          isDark ? 'bg-white/5 text-gray-300' : 'bg-white border text-gray-700'
                        }`}>
                          <Award className="w-3.5 h-3.5 text-amber-500" />
                        </div>
                        <span className={`text-xs font-bold font-mono tracking-tight ${t.text}`}>
                          {row.level}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-mono font-bold ${isVip1 ? t.textMuted : 'text-blue-500'}`}>
                        {isVip1 ? '—' : `A ${row.a}`}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-mono font-bold ${isVip1 ? t.textMuted : 'text-purple-500'}`}>
                        {isVip1 ? '—' : `B ${row.b}`}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-mono font-bold ${isVip1 ? t.textMuted : 'text-cyan-500'}`}>
                        {isVip1 ? '—' : `C ${row.c}`}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-mono font-bold ${isVip1 ? t.textMuted : 'text-indigo-500'}`}>
                        {isVip1 ? '—' : `D ${row.d}`}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </TableContainer>
      </div>

      {/* Security Reference card at the bottom */}
      <div className={`p-4 rounded-xl border flex items-start gap-3 bg-gradient-to-r from-amber-500/5 to-transparent ${
        isDark ? 'border-amber-500/10' : 'border-amber-500/15'
      }`}>
        <Info className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-amber-500 font-display">Mathematical Integrity Notice</h4>
          <p className={`text-[11px] leading-relaxed ${t.textSub}`}>
            Multi-level referral rewards calculation utilizes full-precision floating math on decentralized ledger cycles. All system checks operate exclusively server-side to guarantee system integrity. Refer to the master architecture blueprints for detailed ledger event definitions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default IncomeView;
