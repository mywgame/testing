/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Users, Search, HelpCircle, UserPlus, FileUp } from 'lucide-react';
import { Card, TableContainer } from '../ui/Cards/index.tsx';
import { Badge } from '../ui/Feedback/index.tsx';
import { SearchInput } from '../ui/Inputs/index.tsx';

interface TeamMember {
  id: string;
  email: string;
  tier: string;
  level: 'Level A' | 'Level B' | 'Level C';
  joinedDate: string;
  volume: string;
  commEarned: string;
}

export const MyTeamView: React.FC = () => {
  const teamList: TeamMember[] = [
    { id: 'NODE-001', email: 'mercer@capstone-funds.com', tier: 'Gold', level: 'Level A', joinedDate: '2026-06-25', volume: '$45,000', commEarned: '$2,250' },
    { id: 'NODE-002', email: 'vance@apex-capital.net', tier: 'Silver', level: 'Level A', joinedDate: '2026-06-26', volume: '$30,000', commEarned: '$1,500' },
    { id: 'NODE-003', email: 'chen@nexus-ledger.org', tier: 'Bronze', level: 'Level A', joinedDate: '2026-06-27', volume: '$15,000', commEarned: '$750' },
    { id: 'NODE-004', email: 'partner@bento-invest.io', tier: 'Silver', level: 'Level B', joinedDate: '2026-06-27', volume: '$25,000', commEarned: '$750' },
    { id: 'NODE-005', email: 'client@titan-ventures.com', tier: 'Silver', level: 'Level B', joinedDate: '2026-06-28', volume: '$18,000', commEarned: '$540' },
    { id: 'NODE-006', email: 'user@quantum-nodes.co', tier: 'Bronze', level: 'Level C', joinedDate: '2026-06-28', volume: '$10,000', commEarned: '$200' },
  ];

  return (
    <div className="space-y-6 text-left" id="team-view-tab">
      
      {/* Overview Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-gray-100 rounded-3xl text-left shadow-2xs">
          <span className="text-[9px] font-mono text-gray-400 font-bold uppercase block">Total Partners</span>
          <span className="text-xl font-display font-extrabold text-gray-950 mt-1 block">365 Operators</span>
        </div>
        <div className="p-5 bg-white border border-gray-100 rounded-3xl text-left shadow-2xs">
          <span className="text-[9px] font-mono text-gray-400 font-bold uppercase block">Active Branches</span>
          <span className="text-xl font-display font-extrabold text-blue-600 mt-1 block">14 Countries</span>
        </div>
        <div className="p-5 bg-white border border-gray-100 rounded-3xl text-left shadow-2xs">
          <span className="text-[9px] font-mono text-gray-400 font-bold uppercase block">Group Reserves</span>
          <span className="text-xl font-display font-extrabold text-emerald-600 mt-1 block">$1,729,500</span>
        </div>
        <div className="p-5 bg-white border border-gray-100 rounded-3xl text-left shadow-2xs">
          <span className="text-[9px] font-mono text-gray-400 font-bold uppercase block">Payout Frequency</span>
          <span className="text-xl font-display font-extrabold text-purple-600 mt-1 block">Real-time Node</span>
        </div>
      </div>

      {/* Main partner list */}
      <Card hoverEffect={true} className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h3 className="text-sm font-display font-extrabold text-gray-950 tracking-tight">
              Network Downline Audit Node List
            </h3>
            <p className="text-xs text-gray-400 font-sans">
              Search and analyze all verified, active, and pending downline referral nodes linked to your account authority.
            </p>
          </div>
          <div className="max-w-xs w-full">
            <SearchInput placeholder="Filter nodes by ID or Email..." />
          </div>
        </div>

        <TableContainer>
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-4 px-6 font-semibold text-gray-500 font-display text-[11px] tracking-wider uppercase">Node ID</th>
                <th className="py-4 px-6 font-semibold text-gray-500 font-display text-[11px] tracking-wider uppercase">Verified Email</th>
                <th className="py-4 px-6 font-semibold text-gray-500 font-display text-[11px] tracking-wider uppercase">Referral Tier</th>
                <th className="py-4 px-6 font-semibold text-gray-500 font-display text-[11px] tracking-wider uppercase">Downline Level</th>
                <th className="py-4 px-6 font-semibold text-gray-500 font-display text-[11px] tracking-wider uppercase">Sync Date</th>
                <th className="py-4 px-6 font-semibold text-gray-500 font-display text-[11px] tracking-wider uppercase">Reserve scale</th>
                <th className="py-4 px-6 font-semibold text-gray-500 font-display text-[11px] tracking-wider uppercase">Your Commission</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-gray-700">
              {teamList.map((node) => (
                <tr key={node.id} className="hover:bg-gray-50/40 transition-colors">
                  <td className="py-3 px-6 font-mono font-bold text-gray-950">{node.id}</td>
                  <td className="py-3 px-6 font-semibold text-gray-800">{node.email}</td>
                  <td className="py-3 px-6">
                    <Badge variant={node.tier === 'Gold' ? 'amber' : node.tier === 'Silver' ? 'primary' : 'neutral'}>
                      {node.tier}
                    </Badge>
                  </td>
                  <td className="py-3 px-6 font-mono text-[10px] font-bold text-blue-600">{node.level}</td>
                  <td className="py-3 px-6 text-gray-400 font-mono text-xs">{node.joinedDate}</td>
                  <td className="py-3 px-6 font-mono text-gray-900 font-bold">{node.volume}</td>
                  <td className="py-3 px-6 font-mono text-emerald-600 font-extrabold">{node.commEarned}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableContainer>
      </Card>

    </div>
  );
};

export default MyTeamView;
