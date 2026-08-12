/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from '../../../hooks/useTheme.ts';
import { DashboardLayout } from '../Layout/DashboardLayout.tsx';
import { SearchInput } from '../../ui/Inputs/index.tsx';
import { TeamStats } from './TeamStats.tsx';
import { TeamTable } from './TeamTable.tsx';
import { TeamMember, ReferralLevel } from './types.ts';
import { motion, AnimatePresence } from 'motion/react';
import { Users2, ShieldCheck, Sparkles, UserPlus } from 'lucide-react';
import { DashboardData } from '../../../types/index.ts';
import { api } from '../../../services/api.ts';

interface TeamViewProps {
  dashboardData: DashboardData | null;
}

export const TeamView: React.FC<TeamViewProps> = ({ dashboardData }) => {
  const { t } = useTheme();
  const [selectedLevel, setSelectedLevel] = useState<ReferralLevel>('Level A');
  const [searchQuery, setSearchQuery] = useState('');
  const [dbMembers, setDbMembers] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    async function fetchMembers() {
      try {
        const response = await api.get<any[]>('/users/team/members');
        if (response.success && response.data && isMounted) {
          setDbMembers(response.data);
        }
      } catch (err) {
        console.error('Failed to load team members:', err);
      }
    }
    fetchMembers();
    return () => { isMounted = false; };
  }, []);

  // Extract dynamic stats from live dashboardData if available
  const totalMembers = useMemo(() => {
    if (dashboardData?.team) {
      return (
        dashboardData.team.levelACount +
        dashboardData.team.levelBCount +
        dashboardData.team.levelCCount +
        dashboardData.team.levelDCount
      );
    }
    return dbMembers.length;
  }, [dashboardData, dbMembers]);

  const totalValidCount = useMemo(() => {
    if (dashboardData?.team) {
      return dashboardData.team.teamTotalValidCount || (dashboardData.team.levelAValidCount + dashboardData.team.levelBcdValidCount);
    }
    return dbMembers.filter(m => parseFloat(m.totalDeposited || '0') >= 50).length;
  }, [dashboardData, dbMembers]);

  const levelACount = dashboardData?.team?.levelACount ?? dbMembers.filter(m => m.referralLevel === 1).length;
  const levelBCount = dashboardData?.team?.levelBCount ?? dbMembers.filter(m => m.referralLevel === 2).length;
  const levelCCount = dashboardData?.team?.levelCCount ?? dbMembers.filter(m => m.referralLevel === 3).length;
  const levelDCount = dashboardData?.team?.levelDCount ?? dbMembers.filter(m => m.referralLevel === 4).length;

  // Map real database members by level
  const allTeamMembers: Record<ReferralLevel, TeamMember[]> = useMemo(() => {
    const grouped: Record<ReferralLevel, TeamMember[]> = {
      'Level A': [],
      'Level B': [],
      'Level C': [],
      'Level D': [],
    };

    dbMembers.forEach((m) => {
      const levelKey: ReferralLevel =
        m.referralLevel === 1 ? 'Level A' :
        m.referralLevel === 2 ? 'Level B' :
        m.referralLevel === 3 ? 'Level C' : 'Level D';

      grouped[levelKey].push({
        username: m.username,
        vipRank: m.vipRank || 'VIP1',
        todaysIncome: m.todaysIncome || '+$0.00',
      });
    });

    return grouped;
  }, [dbMembers]);

  // Calculate today's total commission generated
  const todaysTotalGeneration = useMemo(() => {
    let total = 0;
    Object.values(allTeamMembers).forEach((levelMembers) => {
      levelMembers.forEach((member) => {
        const value = parseFloat(member.todaysIncome.replace(/[^0-9.-]/g, ''));
        if (!isNaN(value)) {
          total += value;
        }
      });
    });
    return `+$${total.toFixed(2)}`;
  }, [allTeamMembers]);

  // Filter members for active view
  const activeLevelMembers = useMemo(() => {
    const list = allTeamMembers[selectedLevel] || [];
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase().trim();
    return list.filter((member) => member.username.toLowerCase().includes(q));
  }, [selectedLevel, searchQuery]);

  return (
    <DashboardLayout
      title="My Team"
      description="Monitor multi-level referral contributions and verify active VIP tier partners in real-time."
    >
      <div className="space-y-6 text-left" id="team-view-feature-container">
        
        {/* Statistics Grid Component */}
        <TeamStats
          totalMembers={totalMembers}
          totalValidCount={totalValidCount}
          todaysTotalGeneration={todaysTotalGeneration}
          levelACount={levelACount}
          levelBCount={levelBCount}
          levelCCount={levelCCount}
          levelDCount={levelDCount}
          t={t}
        />

        {/* Level Switcher sliding tabs and Search row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Glassmorphic level tab selectors */}
          <div className={`flex flex-wrap gap-1 p-1 rounded-2xl border transition-all duration-300 ${
            t.isDark ? 'bg-white/3 border-white/5' : 'bg-black/3 border-black/5'
          }`}>
            {(['Level A', 'Level B', 'Level C', 'Level D'] as ReferralLevel[]).map((level) => {
              const isActive = selectedLevel === level;
              const count = level === 'Level A' ? levelACount : level === 'Level B' ? levelBCount : level === 'Level C' ? levelCCount : levelDCount;

              return (
                <button
                  key={level}
                  onClick={() => setSelectedLevel(level)}
                  className={`relative text-[10px] xs:text-xs font-bold px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl transition-colors duration-200 cursor-pointer focus:outline-none select-none z-10 ${
                    isActive
                      ? t.isDark ? 'text-cyan-400' : 'text-blue-600'
                      : `${t.textSub} hover:${t.text}`
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTeamTabGlow"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      className={`absolute inset-0 rounded-xl -z-10 border ${
                        t.isDark
                          ? 'bg-white/8 border-white/12 shadow-[0_0_12px_rgba(34,211,238,0.12)]'
                          : 'bg-white border-black/5 shadow-xs'
                      }`}
                    />
                  )}
                  <span>{level} ({count})</span>
                </button>
              );
            })}
          </div>

          {/* Member Search filter */}
          <div className="w-full lg:max-w-xs relative">
            <SearchInput
              placeholder="Search partner username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Team Table list container */}
        <TeamTable
          members={activeLevelMembers}
          levelLabel={selectedLevel}
          t={t}
        />
      </div>
    </DashboardLayout>
  );
};

export default TeamView;
