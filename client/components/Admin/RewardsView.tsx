/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Gift,
  Plus,
  Edit,
  X,
  ToggleLeft,
  ToggleRight,
  Activity,
  Award,
  DollarSign,
  RefreshCw,
  AlertCircle,
  Search,
  CheckCircle2,
  Users,
  Sparkles,
  ArrowDownLeft,
  Share2,
  SlidersHorizontal,
  Clock,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { Card, Button, Input, Select, Badge } from '../ui/index.ts';
import { ThemeTokens } from '../ui/themeTokens.ts';
import { Toast } from '../ui/Feedback/index.tsx';
import { api } from '../../services/api.ts';

export interface TaskDefinitionDTO {
  id: string;
  taskCode: string;
  title: string;
  description: string;
  category: 'ACTIVITY' | 'DEPOSIT' | 'REFERRAL';
  rewardType: 'CASH' | 'TRIAL_FUND' | 'BONUS';
  rewardAmount: string;
  rewardPerUnit: string;
  triggerType: string;
  targetProgress: string;
  unit: string;
  minDepositRequired: string;
  maxClaimsPerUser: number;
  isActive: boolean;
  displayOrder: number;
  claimsCount?: number;
  totalPaidOut?: string;
  ruleConfig?: string;
}

export interface RewardsPoolMetricsDTO {
  totalTasks: number;
  activeTasks: number;
  totalClaimsProcessed: number;
  totalRewardsPaidOutUsdt: string;
  totalTrialFundDistributed: string;
}

export interface TaskClaimLogDTO {
  id: string;
  userId: string;
  taskCode: string;
  claimKey: string;
  rewardAmount: string;
  rewardType: string;
  claimedAt: string;
  userName: string;
  userEmail: string;
}

interface RewardsViewProps {
  t: ThemeTokens;
  isDark: boolean;
}

export const RewardsView: React.FC<RewardsViewProps> = ({ t, isDark }) => {
  const [tasks, setTasks] = useState<TaskDefinitionDTO[]>([]);
  const [metrics, setMetrics] = useState<RewardsPoolMetricsDTO | null>(null);
  const [claimsLog, setClaimsLog] = useState<TaskClaimLogDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // View mode tab: 'POOL' | 'CLAIMS'
  const [activeTab, setActiveTab] = useState<'POOL' | 'CLAIMS'>('POOL');
  
  // Filters & Search
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'ACTIVITY' | 'DEPOSIT' | 'REFERRAL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [editingTask, setEditingTask] = useState<TaskDefinitionDTO | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTask, setNewTask] = useState<Partial<TaskDefinitionDTO>>({
    taskCode: '',
    title: '',
    description: '',
    category: 'ACTIVITY',
    rewardType: 'CASH',
    rewardAmount: '1.00',
    targetProgress: '1',
    unit: 'Step',
    minDepositRequired: '0',
    displayOrder: 1,
    isActive: true,
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadRewardsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getRewardsPool();
      if (res.success && res.data) {
        setTasks(res.data.tasks || []);
        setMetrics(res.data.metrics || null);
        setClaimsLog(res.data.claims || []);
      } else {
        // Fallback to legacy campaigns if task endpoint is returning default
        const legacyRes = await api.getRewardCampaigns();
        if (legacyRes.success && legacyRes.data) {
          // Format campaigns into task format
          const formatted: TaskDefinitionDTO[] = legacyRes.data.map((c: any, idx: number) => ({
            id: c.id,
            taskCode: `CAMP_${c.id}`,
            title: c.title,
            description: c.description || '',
            category: 'ACTIVITY',
            rewardType: 'CASH',
            rewardAmount: (c.bonusAmount || '$0').replace('$', ''),
            rewardPerUnit: '0',
            triggerType: 'CUSTOM',
            targetProgress: '1',
            unit: 'Claim',
            minDepositRequired: (c.minDepRequired || '$0').replace('$', ''),
            maxClaimsPerUser: 1,
            isActive: c.status === 'Active',
            displayOrder: idx + 1,
            claimsCount: c.claimsCount || 0,
            totalPaidOut: '0',
          }));
          setTasks(formatted);
        } else {
          setError(res.error?.message || 'Failed to retrieve rewards pool data.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error connecting to backend services.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRewardsData();
  }, []);

  // Toggle active status for a task
  const toggleTaskStatus = async (task: TaskDefinitionDTO) => {
    const newActiveState = !task.isActive;
    try {
      const res = await api.updateTaskDefinition(task.id, { isActive: newActiveState });
      if (res.success) {
        showToast(`Task "${task.title}" status changed to ${newActiveState ? 'ACTIVE' : 'PAUSED'}.`);
        loadRewardsData();
      } else {
        showToast(res.error?.message || 'Failed to update task active state.');
      }
    } catch (err: any) {
      showToast(err.message || 'Error executing task status update.');
    }
  };

  // Save edit changes
  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;

    try {
      const res = await api.updateTaskDefinition(editingTask.id, {
        title: editingTask.title,
        description: editingTask.description,
        rewardAmount: editingTask.rewardAmount,
        rewardType: editingTask.rewardType,
        targetProgress: editingTask.targetProgress,
        minDepositRequired: editingTask.minDepositRequired,
        displayOrder: editingTask.displayOrder,
        isActive: editingTask.isActive,
      });

      if (res.success) {
        showToast('Task configuration saved successfully.');
        setEditingTask(null);
        loadRewardsData();
      } else {
        showToast(res.error?.message || 'Failed to update task configuration.');
      }
    } catch (err: any) {
      showToast(err.message || 'Error saving task definition changes.');
    }
  };

  // Create new task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.taskCode || !newTask.title) {
      showToast('Task Code and Title are required.');
      return;
    }

    try {
      const formattedCode = (newTask.taskCode || '').toUpperCase().trim().replace(/\s+/g, '_');
      const res = await api.createTaskDefinition({
        ...newTask,
        taskCode: formattedCode,
      });

      if (res.success) {
        setIsAddOpen(false);
        setNewTask({
          taskCode: '',
          title: '',
          description: '',
          category: 'ACTIVITY',
          rewardType: 'CASH',
          rewardAmount: '1.00',
          targetProgress: '1',
          unit: 'Step',
          minDepositRequired: '0',
          displayOrder: 1,
          isActive: true,
        });
        showToast(`Task "${newTask.title}" created successfully.`);
        loadRewardsData();
      } else {
        showToast(res.error?.message || 'Failed to create task definition.');
      }
    } catch (err: any) {
      showToast(err.message || 'Error creating task definition.');
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesCategory = categoryFilter === 'ALL' || task.category === categoryFilter;
    const matchesQuery =
      !searchQuery ||
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.taskCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const getCategoryBadgeVariant = (category: string) => {
    switch (category) {
      case 'DEPOSIT':
        return 'emerald';
      case 'REFERRAL':
        return 'purple';
      case 'ACTIVITY':
      default:
        return 'blue';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'DEPOSIT':
        return <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />;
      case 'REFERRAL':
        return <Share2 className="w-3.5 h-3.5 text-purple-400" />;
      case 'ACTIVITY':
      default:
        return <Activity className="w-3.5 h-3.5 text-blue-400" />;
    }
  };

  if (loading) {
    return (
      <Card className="p-12 text-center flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
        <p className={`text-xs font-bold ${t.textMuted}`}>Loading Rewards Pool & Tasks Configuration...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center flex flex-col items-center justify-center space-y-4 border-rose-500/20 bg-rose-500/5">
        <AlertCircle className="w-8 h-8 text-rose-500" />
        <div className="space-y-1">
          <p className="text-sm font-bold text-rose-500">Failed to load Rewards Pool definitions</p>
          <p className={`text-xs ${t.textSub}`}>{error}</p>
        </div>
        <Button onClick={loadRewardsData} variant="secondary" size="sm" leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
          Retry Connection
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6 text-left">
      {/* 1. Top Header & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-rose-500/20 to-purple-500/20 border border-rose-500/30">
              <Gift className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Rewards Pool Configuration</h2>
              <p className={`text-xs mt-0.5 ${t.textSub}`}>
                Configure scalable task rules, deposit milestones, activity bonuses, and referral tier claim limits.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={loadRewardsData} variant="secondary" size="sm" leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
            Sync Pool
          </Button>
          <Button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-1.5"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create Task
          </Button>
        </div>
      </div>

      {/* 2. Operational Metrics Overview Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <p className={`text-[10px] font-mono font-bold uppercase tracking-wider ${t.textMuted}`}>Active Tasks Pool</p>
            <p className="text-lg font-extrabold tracking-tight">
              {metrics?.activeTasks || tasks.filter((t) => t.isActive).length}{' '}
              <span className={`text-xs font-normal ${t.textMuted}`}>/ {metrics?.totalTasks || tasks.length}</span>
            </p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className={`text-[10px] font-mono font-bold uppercase tracking-wider ${t.textMuted}`}>Claims Processed</p>
            <p className="text-lg font-extrabold tracking-tight text-emerald-400">
              {(metrics?.totalClaimsProcessed || claimsLog.length).toLocaleString()}
            </p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className={`text-[10px] font-mono font-bold uppercase tracking-wider ${t.textMuted}`}>Cash Distributed</p>
            <p className="text-lg font-extrabold tracking-tight text-purple-400">
              ${parseFloat(metrics?.totalRewardsPaidOutUsdt || '0').toFixed(2)}
            </p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className={`text-[10px] font-mono font-bold uppercase tracking-wider ${t.textMuted}`}>Trial Fund Claimed</p>
            <p className="text-lg font-extrabold tracking-tight text-amber-400">
              ${parseFloat(metrics?.totalTrialFundDistributed || '0').toFixed(0)}
            </p>
          </div>
        </Card>
      </div>

      {/* 3. Navigation View Mode Tabs */}
      <div className={`flex items-center justify-between border-b pb-3 ${t.sep}`}>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('POOL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'POOL'
                ? isDark
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-blue-50 text-blue-600 border border-blue-100'
                : t.textMuted + ' hover:text-white'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Gift className="w-3.5 h-3.5" />
              <span>Task Pool Definitions ({tasks.length})</span>
            </span>
          </button>

          <button
            onClick={() => setActiveTab('CLAIMS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'CLAIMS'
                ? isDark
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-blue-50 text-blue-600 border border-blue-100'
                : t.textMuted + ' hover:text-white'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              <span>User Claim Logs ({claimsLog.length})</span>
            </span>
          </button>
        </div>

        {activeTab === 'POOL' && (
          <div className="flex items-center gap-2">
            {/* Category Filter Pills */}
            <div className={`p-1 rounded-xl flex items-center gap-1 ${t.inset}`}>
              {(['ALL', 'ACTIVITY', 'DEPOSIT', 'REFERRAL'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${
                    categoryFilter === cat
                      ? 'bg-blue-600 text-white shadow-xs'
                      : t.textMuted + ' hover:text-white'
                  }`}
                >
                  {cat === 'ALL' ? 'ALL' : cat}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SEARCH BAR (When viewing Pool) */}
      {activeTab === 'POOL' && (
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <Input
            placeholder="Search by title, code (e.g. DEPOSIT_MILESTONE_100)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>
      )}

      {/* 4. MAIN CONTENT AREA */}
      {activeTab === 'POOL' ? (
        filteredTasks.length === 0 ? (
          <Card className={`p-12 text-center font-medium ${t.textMuted}`}>
            No task definitions found matching criteria.
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTasks.map((task) => (
              <Card
                key={task.id || task.taskCode}
                className={`p-5 flex flex-col justify-between min-h-[240px] transition-all border ${
                  !task.isActive ? 'opacity-60 border-dashed' : 'hover:border-blue-500/40'
                }`}
              >
                <div>
                  {/* Top Header Row */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`p-2 rounded-xl shrink-0 ${t.inset}`}>
                        {getCategoryIcon(task.category)}
                      </div>
                      <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider truncate" title={task.taskCode}>
                        {task.taskCode}
                      </span>
                    </div>
                    <Badge variant={task.isActive ? 'emerald' : 'neutral'}>
                      {task.isActive ? 'Active' : 'Paused'}
                    </Badge>
                  </div>

                  {/* Title & Description */}
                  <div className="mt-3 space-y-1">
                    <h4 className="font-display font-bold text-sm tracking-tight">{task.title}</h4>
                    <p className={`text-[11px] leading-relaxed line-clamp-2 ${t.textSub}`}>
                      {task.description}
                    </p>
                  </div>

                  {/* Configuration Highlights Grid */}
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <div className={`p-2.5 rounded-xl text-left ${t.inset}`}>
                      <span className={`text-[9px] font-mono font-bold uppercase tracking-wider block ${t.textMuted}`}>
                        Reward Amount
                      </span>
                      <p className={`text-sm font-extrabold ${task.rewardType === 'TRIAL_FUND' ? 'text-amber-400' : 'text-emerald-400'}`}>
                        ${parseFloat(task.rewardAmount || '0').toFixed(2)}{' '}
                        <span className="text-[9px] font-mono font-normal">
                          {task.rewardType === 'TRIAL_FUND' ? 'Trial' : 'USDT'}
                        </span>
                      </p>
                    </div>

                    <div className={`p-2.5 rounded-xl text-left ${t.inset}`}>
                      <span className={`text-[9px] font-mono font-bold uppercase tracking-wider block ${t.textMuted}`}>
                        Target Threshold
                      </span>
                      <p className="text-sm font-extrabold">
                        {parseFloat(task.targetProgress || '1').toLocaleString()} {task.unit || ''}
                      </p>
                    </div>
                  </div>

                  {parseFloat(task.minDepositRequired || '0') > 0 && (
                    <div className={`mt-2 p-2 rounded-lg text-left text-[10px] font-mono ${t.inset} flex items-center justify-between`}>
                      <span className={t.textMuted}>Min Deposit Required:</span>
                      <span className="font-bold text-amber-400">${parseFloat(task.minDepositRequired).toFixed(2)}</span>
                    </div>
                  )}
                </div>

                {/* Bottom Card Footer */}
                <div className={`flex items-center justify-between border-t mt-4 pt-3.5 ${t.sep}`}>
                  <div className={`text-[10px] font-mono ${t.textMuted}`}>
                    <span className="font-bold text-white">{(task.claimsCount || 0).toLocaleString()}</span> claims
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => toggleTaskStatus(task)}
                      className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                        task.isActive
                          ? 'text-amber-400 hover:bg-amber-500/10'
                          : 'text-emerald-400 hover:bg-emerald-500/10'
                      }`}
                      title={task.isActive ? 'Pause Task Definition' : 'Activate Task Definition'}
                    >
                      {task.isActive ? <ToggleRight className="w-5 h-5 text-emerald-400" /> : <ToggleLeft className="w-5 h-5 text-gray-500" />}
                    </button>
                    <button
                      onClick={() => setEditingTask(task)}
                      className="p-1.5 rounded-xl text-blue-400 hover:bg-blue-500/10 transition-colors cursor-pointer"
                      title="Edit Task Configuration"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )
      ) : (
        /* USER CLAIMS HISTORY LOG TABLE */
        <Card className="overflow-hidden">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" />
              <span>Recent User Reward Claim Audit Logs</span>
            </h3>
            <span className={`text-xs font-mono ${t.textMuted}`}>{claimsLog.length} Records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`text-[10px] font-mono uppercase tracking-wider border-b ${t.sep} ${t.inset}`}>
                  <th className="p-3 pl-4">User</th>
                  <th className="p-3">Task Code</th>
                  <th className="p-3">Reward</th>
                  <th className="p-3">Claim Key</th>
                  <th className="p-3 text-right pr-4">Claimed At</th>
                </tr>
              </thead>
              <tbody className="divide-y text-xs">
                {claimsLog.length === 0 ? (
                  <tr>
                    <td colSpan={5} className={`p-8 text-center ${t.textMuted}`}>
                      No task claims recorded yet.
                    </td>
                  </tr>
                ) : (
                  claimsLog.map((claim) => (
                    <tr key={claim.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-3 pl-4">
                        <div className="font-bold">{claim.userName || 'User'}</div>
                        <div className={`text-[10px] font-mono ${t.textMuted}`}>{claim.userEmail}</div>
                      </td>
                      <td className="p-3">
                        <span className="font-mono font-bold text-[11px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                          {claim.taskCode}
                        </span>
                      </td>
                      <td className="p-3 font-extrabold text-emerald-400">
                        ${parseFloat(claim.rewardAmount || '0').toFixed(2)}
                      </td>
                      <td className="p-3 text-[10px] font-mono text-gray-400">{claim.claimKey}</td>
                      <td className="p-3 text-right pr-4 text-[10px] font-mono text-gray-400">
                        {new Date(claim.claimedAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* 5. EDIT TASK MODAL */}
      {editingTask && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0" onClick={() => setEditingTask(null)} />
          <div
            className={`rounded-3xl border p-6 shadow-2xl max-w-md w-full relative z-10 text-left space-y-5 backdrop-blur-xl ${
              isDark ? 'bg-[#0f112e]' : 'bg-white'
            } ${t.sep}`}
          >
            <div className={`flex items-center justify-between pb-3 border-b ${t.sep}`}>
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Gift className="w-4 h-4 text-purple-400" />
                <span>Edit Task Definition ({editingTask.taskCode})</span>
              </h3>
              <button onClick={() => setEditingTask(null)} className={`p-1 rounded-lg hover:bg-black/5 cursor-pointer ${t.textMuted}`}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSave} className="space-y-4 text-xs">
              <Input
                label="Task Title"
                value={editingTask.title}
                onChange={(e) => setEditingTask((prev) => (prev ? { ...prev, title: e.target.value } : null))}
                required
              />

              <div>
                <label className={`block mb-1 font-bold text-[11px] ${t.text}`}>Description</label>
                <textarea
                  value={editingTask.description}
                  onChange={(e) => setEditingTask((prev) => (prev ? { ...prev, description: e.target.value } : null))}
                  rows={2}
                  className={`w-full p-2.5 rounded-xl border text-xs bg-transparent ${t.sep} focus:ring-2 focus:ring-blue-500`}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Reward Amount ($)"
                  value={editingTask.rewardAmount}
                  onChange={(e) => setEditingTask((prev) => (prev ? { ...prev, rewardAmount: e.target.value } : null))}
                  required
                />

                <Input
                  label="Target Progress Threshold"
                  value={editingTask.targetProgress}
                  onChange={(e) => setEditingTask((prev) => (prev ? { ...prev, targetProgress: e.target.value } : null))}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Min Deposit Required ($)"
                  value={editingTask.minDepositRequired}
                  onChange={(e) => setEditingTask((prev) => (prev ? { ...prev, minDepositRequired: e.target.value } : null))}
                />

                <Input
                  label="Display Order"
                  type="number"
                  value={editingTask.displayOrder}
                  onChange={(e) =>
                    setEditingTask((prev) => (prev ? { ...prev, displayOrder: parseInt(e.target.value) || 1 } : null))
                  }
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="font-bold">Task Active Status</span>
                <button
                  type="button"
                  onClick={() =>
                    setEditingTask((prev) => (prev ? { ...prev, isActive: !prev.isActive } : null))
                  }
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Badge variant={editingTask.isActive ? 'emerald' : 'neutral'}>
                    {editingTask.isActive ? 'ACTIVE' : 'PAUSED'}
                  </Badge>
                  {editingTask.isActive ? <ToggleRight className="w-6 h-6 text-emerald-400" /> : <ToggleLeft className="w-6 h-6 text-gray-500" />}
                </button>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button type="button" variant="secondary" onClick={() => setEditingTask(null)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="flex-1">
                  Save Task Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. CREATE TASK MODAL */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0" onClick={() => setIsAddOpen(false)} />
          <div
            className={`rounded-3xl border p-6 shadow-2xl max-w-md w-full relative z-10 text-left space-y-5 backdrop-blur-xl ${
              isDark ? 'bg-[#0f112e]' : 'bg-white'
            } ${t.sep}`}
          >
            <div className={`flex items-center justify-between pb-3 border-b ${t.sep}`}>
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-400" />
                <span>Create New Task Definition</span>
              </h3>
              <button onClick={() => setIsAddOpen(false)} className={`p-1 rounded-lg hover:bg-black/5 cursor-pointer ${t.textMuted}`}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
              <Input
                label="Task Code (Unique Uppercase Identifier)"
                placeholder="e.g. DEPOSIT_MILESTONE_2500"
                value={newTask.taskCode}
                onChange={(e) => setNewTask((prev) => ({ ...prev, taskCode: e.target.value }))}
                required
              />

              <Input
                label="Task Title"
                placeholder="e.g. First $2,500 Deposit Bonus"
                value={newTask.title}
                onChange={(e) => setNewTask((prev) => ({ ...prev, title: e.target.value }))}
                required
              />

              <div>
                <label className={`block mb-1 font-bold text-[11px] ${t.text}`}>Description</label>
                <textarea
                  placeholder="Describe eligibility criteria and reward details..."
                  value={newTask.description}
                  onChange={(e) => setNewTask((prev) => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  className={`w-full p-2.5 rounded-xl border text-xs bg-transparent ${t.sep} focus:ring-2 focus:ring-blue-500`}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Category"
                  value={newTask.category}
                  onChange={(e) => setNewTask((prev) => ({ ...prev, category: e.target.value as any }))}
                  options={[
                    { value: 'ACTIVITY', label: 'Activity Bonus' },
                    { value: 'DEPOSIT', label: 'Self Deposit' },
                    { value: 'REFERRAL', label: 'Referral Milestones' },
                  ]}
                />

                <Select
                  label="Reward Type"
                  value={newTask.rewardType}
                  onChange={(e) => setNewTask((prev) => ({ ...prev, rewardType: e.target.value as any }))}
                  options={[
                    { value: 'CASH', label: 'Cash (USDT)' },
                    { value: 'TRIAL_FUND', label: 'Trial Fund' },
                    { value: 'BONUS', label: 'Bonus Credit' },
                  ]}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Reward Amount ($)"
                  placeholder="1.00"
                  value={newTask.rewardAmount}
                  onChange={(e) => setNewTask((prev) => ({ ...prev, rewardAmount: e.target.value }))}
                  required
                />

                <Input
                  label="Target Threshold"
                  placeholder="100"
                  value={newTask.targetProgress}
                  onChange={(e) => setNewTask((prev) => ({ ...prev, targetProgress: e.target.value }))}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Min Deposit Req. ($)"
                  placeholder="50"
                  value={newTask.minDepositRequired}
                  onChange={(e) => setNewTask((prev) => ({ ...prev, minDepositRequired: e.target.value }))}
                />

                <Input
                  label="Progress Unit"
                  placeholder="e.g. USDT, Verified, Step"
                  value={newTask.unit}
                  onChange={(e) => setNewTask((prev) => ({ ...prev, unit: e.target.value }))}
                />
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button type="button" variant="secondary" onClick={() => setIsAddOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="flex-1">
                  Create Task
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toastMessage && (
        <Toast message={toastMessage} variant="success" onClose={() => setToastMessage(null)} />
      )}
    </div>
  );
};

export default RewardsView;
