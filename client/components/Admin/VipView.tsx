/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Users,
  Percent,
  Plus,
  Trash2,
  Edit,
  X,
  PlusCircle,
  Gem,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { Card, Button, Input, Select } from '../ui/index.ts';
import { ThemeTokens } from '../ui/themeTokens.ts';
import { Toast } from '../ui/Feedback/index.tsx';
import { api } from '../../services/api.ts';

interface VipTier {
  tier: string;
  name?: string;
  minBalance?: string;
  walletReq?: string;
  dailyYield?: string;
  dpy?: string;
  levelA?: number;
  levelAReq?: string;
  levelBCD?: number;
  levelBCDReq?: string;
  teamTotal?: number | string;
  activeUsersCount?: number;
  members?: number;
  badge?: string;
  color?: string;
  icon?: string;
}

interface VipViewProps {
  t: ThemeTokens;
  isDark: boolean;
}

export const VipView: React.FC<VipViewProps> = ({ t, isDark }) => {
  const [tiers, setTiers] = useState<VipTier[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<VipTier | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadTiers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getVipTiers();
      if (res.success && res.data) {
        // Map backend tier matrix data with UI styles
        const formatted = res.data.map((item: any) => {
          const name = item.name || item.tier;
          const icon = item.icon || (name === 'VIP1' ? '🥉' : name === 'VIP2' ? '🥈' : name === 'VIP3' ? '🥇' : name === 'VIP4' ? '💎' : '👑');
          const color = item.color || (name === 'VIP1' ? 'from-orange-500/10 to-orange-600/5 border-orange-500/20' : name === 'VIP2' ? 'from-slate-500/10 to-slate-600/5 border-slate-500/20' : 'from-amber-500/10 to-amber-600/5 border-amber-500/20');
          const badge = item.badge || (name === 'VIP1' ? 'BRONZE' : name === 'VIP2' ? 'SILVER' : name === 'VIP3' ? 'GOLD' : 'DIAMOND');
          return {
            ...item,
            name,
            icon,
            color,
            badge,
            walletReq: item.walletReq || item.minBalance || '$10',
            dailyYield: item.dailyYield || item.dpy || '0.60%',
            levelAReq: item.levelAReq || String(item.levelA ?? 0),
            levelBCDReq: item.levelBCDReq || String(item.levelBCD ?? 0),
            teamTotal: item.teamTotal !== undefined ? String(item.teamTotal) : '0',
            members: item.activeUsersCount !== undefined ? item.activeUsersCount : (item.members || 0),
          };
        });
        setTiers(formatted);
      } else {
        setError(res.error?.message || 'Failed to retrieve VIP matrix configuration.');
      }
    } catch (err: any) {
      setError(err.message || 'Error connecting to backend services.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTiers();
  }, []);

  // Handle Edit Tier
  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTier) return;

    try {
      const tierName = selectedTier.name || selectedTier.tier;
      const res = await api.updateVipTier(tierName, selectedTier);
      if (res.success) {
        showToast(`${tierName} VIP configuration updated successfully.`);
        setSelectedTier(null);
        loadTiers();
      } else {
        showToast(res.error?.message || 'Failed to update VIP configuration.');
      }
    } catch (err: any) {
      showToast(err.message || 'Error saving changes.');
    }
  };

  if (loading) {
    return (
      <Card className="p-12 text-center flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
        <p className={`text-xs font-bold ${t.textMuted}`}>Loading VIP Matrix parameters from backend...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center flex flex-col items-center justify-center space-y-4 border-rose-500/20 bg-rose-500/5">
        <AlertCircle className="w-8 h-8 text-rose-500" />
        <div className="space-y-1">
          <p className="text-sm font-bold text-rose-500">Failed to load VIP configurations</p>
          <p className={`text-xs ${t.textSub}`}>{error}</p>
        </div>
        <Button onClick={loadTiers} variant="secondary" size="sm" leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
          Retry Connection
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6 text-left">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">VIP Management</h2>
          <p className={`text-xs mt-1 ${t.textSub}`}>Design class configurations, edit compound yield percentages, and view level distributions.</p>
        </div>
        <Button onClick={loadTiers} variant="secondary" size="sm" leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
          Refresh Matrix
        </Button>
      </div>

      {tiers.length === 0 ? (
        <Card className={`p-12 text-center font-medium ${t.textMuted}`}>
          No VIP tiers configured yet.
        </Card>
      ) : (
        /* Grid List of Tiers */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {tiers.map((tier) => {
            const boxBgClass = isDark 
              ? 'bg-white/5 border-white/10' 
              : 'bg-white/60 border-black/5';
            const labelClass = isDark ? 'text-white/70' : 'text-slate-700 font-semibold';
            const valueClass = isDark ? 'text-white' : 'text-slate-900';

            return (
              <div
                key={tier.tier}
                className={`rounded-3xl border p-5 bg-gradient-to-br flex flex-col justify-between min-h-[260px] relative overflow-hidden transition-all duration-300 hover:scale-[1.01] hover:shadow-lg ${tier.color}`}
              >
                {/* Top Row: Name and Icon */}
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl select-none">{tier.icon}</span>
                      <span className="text-base font-extrabold font-display leading-none tracking-tight">{tier.tier} Tier</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider ${t.inset}`}>
                      {tier.badge}
                    </span>
                  </div>

                  {/* Daily DPY Rate Header Box */}
                  <div className={`mt-4 p-3 rounded-2xl border flex items-center justify-between ${boxBgClass}`}>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${labelClass}`}>Daily DPY Rate</span>
                    <span className="text-lg font-extrabold font-display text-emerald-500 dark:text-emerald-400">{tier.dailyYield}</span>
                  </div>

                  {/* Requirements Grid inside Card */}
                  <div className="grid grid-cols-2 gap-2.5 mt-2.5">
                    <div className={`p-2.5 rounded-2xl border text-left ${boxBgClass}`}>
                      <p className={`text-[9px] font-bold uppercase tracking-wider ${labelClass}`}>Wallet Req</p>
                      <p className={`text-xs font-extrabold font-display mt-0.5 ${valueClass}`}>{tier.walletReq}</p>
                    </div>
                    <div className={`p-2.5 rounded-2xl border text-left ${boxBgClass}`}>
                      <p className={`text-[9px] font-bold uppercase tracking-wider ${labelClass}`}>Level A (Direct)</p>
                      <p className={`text-xs font-extrabold font-display mt-0.5 ${valueClass}`}>{tier.levelAReq}</p>
                    </div>
                    <div className={`p-2.5 rounded-2xl border text-left ${boxBgClass}`}>
                      <p className={`text-[9px] font-bold uppercase tracking-wider ${labelClass}`}>Level B+C+D</p>
                      <p className={`text-xs font-extrabold font-display mt-0.5 ${valueClass}`}>{tier.levelBCDReq}</p>
                    </div>
                    <div className={`p-2.5 rounded-2xl border text-left ${boxBgClass}`}>
                      <p className={`text-[9px] font-bold uppercase tracking-wider ${labelClass}`}>Team Total</p>
                      <p className={`text-xs font-extrabold font-display mt-0.5 ${valueClass}`}>{tier.teamTotal}</p>
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Active users counter and Edit button */}
                <div className={`flex items-center justify-between border-t pt-3.5 mt-4 ${isDark ? 'border-white/10' : 'border-slate-200/50'}`}>
                  <div className={`flex items-center gap-1.5 text-xs ${isDark ? 'text-white/75' : 'text-slate-600'}`}>
                    <Users className={`w-4 h-4 shrink-0 ${isDark ? 'text-white/50' : 'text-slate-400'}`} />
                    <span className="font-bold">{(tier.members || 0).toLocaleString()} active members</span>
                  </div>
                  <button
                    onClick={() => setSelectedTier(tier)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                      isDark ? 'bg-white/10 hover:bg-white/15 text-white' : 'bg-black/5 hover:bg-black/10 text-slate-800'
                    }`}
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Configure
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Tier configuration Overlay Modal */}
      {selectedTier && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0" onClick={() => setSelectedTier(null)} />
          <div className={`rounded-3xl border p-6 shadow-2xl max-w-sm w-full relative z-10 text-left space-y-5 backdrop-blur-xl ${
            isDark ? 'bg-[#0f112e] text-white' : 'bg-white text-slate-900'
          } ${t.sep}`}>
            <div className={`flex items-center justify-between pb-3 border-b ${t.sep}`}>
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-500" />
                <span>Configure {selectedTier.tier} VIP</span>
              </h3>
              <button onClick={() => setSelectedTier(null)} className={`p-1 rounded-lg hover:bg-black/5 cursor-pointer ${t.textMuted}`}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSave} className="space-y-4">
              <Input
                label="Wallet Requirement (USDT)"
                value={selectedTier.walletReq}
                onChange={e => setSelectedTier(prev => prev ? ({ ...prev, walletReq: e.target.value }) : null)}
                required
              />
              <Input
                label="Daily DPY Rate"
                placeholder="e.g. 1.20%"
                value={selectedTier.dailyYield}
                onChange={e => setSelectedTier(prev => prev ? ({ ...prev, dailyYield: e.target.value }) : null)}
                required
              />
              <div className="grid grid-cols-3 gap-2">
                <Input
                  label="Level A"
                  placeholder="e.g. 3"
                  value={selectedTier.levelAReq}
                  onChange={e => setSelectedTier(prev => prev ? ({ ...prev, levelAReq: e.target.value }) : null)}
                  required
                />
                <Input
                  label="Level B+C+D"
                  placeholder="e.g. 6"
                  value={selectedTier.levelBCDReq}
                  onChange={e => setSelectedTier(prev => prev ? ({ ...prev, levelBCDReq: e.target.value }) : null)}
                  required
                />
                <Input
                  label="Team Total"
                  placeholder="e.g. 9"
                  value={selectedTier.teamTotal}
                  onChange={e => setSelectedTier(prev => prev ? ({ ...prev, teamTotal: e.target.value }) : null)}
                  required
                />
              </div>

              <div className="flex gap-3 pt-3">
                <Button type="button" variant="secondary" onClick={() => setSelectedTier(null)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="flex-1">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toastMessage && (
        <Toast
          message={toastMessage}
          variant="success"
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
};
export default VipView;
