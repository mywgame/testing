/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Users,
  Activity,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Headphones,
  AlertTriangle,
  Server,
  Database,
  Mail,
  Network,
  ShieldCheck,
  CheckCircle2,
  Clock,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Card, StatCard, Badge, LoadingSpinner } from '../ui/index.ts';
import { ThemeTokens } from '../ui/themeTokens.ts';
import { api } from '../../services/api.ts';

interface DashboardHomeProps {
  t: ThemeTokens;
  isDark: boolean;
  onNavigate: (tab: string) => void;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({ t, isDark, onNavigate }) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.getAdminDashboardOverview();
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError(response.error?.message || 'Failed to retrieve administrative overview metrics.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected connection error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const chartTooltipStyles = {
    contentStyle: {
      backgroundColor: t.tooltipBg,
      border: `1px solid ${t.tooltipBorder}`,
      borderRadius: '12px',
      fontSize: '11px',
      color: isDark ? '#ffffff' : '#111827'
    },
    labelStyle: {
      color: isDark ? '#9ca3af' : '#4b5563',
      fontWeight: 'bold'
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <LoadingSpinner size="lg" />
        <p className={`text-xs font-mono tracking-wider ${t.textMuted} animate-pulse`}>
          Retrieving System Operations Ledger...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-8 max-w-lg mx-auto text-center border-red-500/20 bg-red-500/5 mt-12">
        <div className="flex justify-center mb-4 text-red-500">
          <AlertCircle className="w-12 h-12" />
        </div>
        <h3 className="font-display font-bold text-lg mb-2">Failed to Load Dashboard</h3>
        <p className={`text-sm ${t.textMuted} mb-6`}>{error}</p>
        <button
          onClick={fetchOverview}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry Connection
        </button>
      </Card>
    );
  }

  // Active metrics values from response
  const stats = data?.stats || { totalUsers: 0, activeUsers: 0, liquidityPool: 0, totalInboundDeposits: 0 };
  const queues = data?.queues || { pendingWithdrawals: 0, pendingDeposits: 0, activeSupportTickets: 0, securityThreats: 0, suspendedUsers: 0 };
  const charts = data?.charts || { userGrowth: [], txFlow: [], revenue: [] };

  const activeRatio = stats.totalUsers > 0 ? ((stats.activeUsers / stats.totalUsers) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-6">
      {/* 4 Key Stat Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Registered Users"
          value={stats.totalUsers.toLocaleString()}
          icon={<Users className="w-4 h-4 text-blue-500" />}
          trend={`+${stats.activeUsers.toLocaleString()} active`}
          trendDirection="up"
        />
        <StatCard
          title="Active Daily Users"
          value={stats.activeUsers.toLocaleString()}
          icon={<Activity className="w-4 h-4 text-emerald-500" />}
          trend={`${activeRatio}% active user ratio`}
          trendDirection="neutral"
        />
        <StatCard
          title="Platform Liquidity Pool"
          value={`$${stats.liquidityPool.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<Wallet className="w-4 h-4 text-purple-500" />}
          trend="Secure USDT reserves"
          trendDirection="up"
        />
        <StatCard
          title="Total Inbound Deposits"
          value={`$${stats.totalInboundDeposits.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<ArrowDownLeft className="w-4 h-4 text-cyan-500" />}
          trend="All-time processed"
          trendDirection="up"
        />
      </div>

      {/* Operational Highlights Queue */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Pending Withdrawals', count: `${queues.pendingWithdrawals} requests`, status: 'amber', icon: '⏳', path: 'withdrawals' },
          { label: 'Pending Deposits', count: `${queues.pendingDeposits} deposits`, status: 'primary', icon: '🔄', path: 'deposits' },
          { label: 'Active Support Tickets', count: `${queues.activeSupportTickets} unresolved`, status: 'primary', icon: '🎫', path: 'support' },
          { label: 'Unsolved Security Alerts', count: `${queues.securityThreats} threats`, status: 'rose', icon: '🚨', path: 'security' },
        ].map((item) => (
          <div
            key={item.label}
            onClick={() => onNavigate(item.path)}
            className={`rounded-2xl p-4 border flex items-center justify-between gap-4 cursor-pointer transition-all duration-300 hover:scale-[1.01] ${
              item.status === 'rose'
                ? 'border-red-500/20 bg-red-500/5 hover:border-red-500/45'
                : item.status === 'amber'
                ? 'border-amber-500/20 bg-amber-500/5 hover:border-amber-500/45'
                : 'border-blue-500/20 bg-blue-500/5 hover:border-blue-500/45'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-2xl flex-shrink-0">{item.icon}</span>
              <div className="min-w-0">
                <p className={`text-[10px] font-bold uppercase tracking-wider ${t.textMuted} truncate`}>{item.label}</p>
                <p className="text-sm font-extrabold truncate">{item.count}</p>
              </div>
            </div>
            <span className={`text-[10px] font-bold ${isDark ? 'text-cyan-400' : 'text-blue-600'} hover:underline shrink-0`}>Review →</span>
          </div>
        ))}
      </div>

      {/* Recharts Graphical Indicators Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="p-5 flex flex-col justify-between">
          <div className="mb-4">
            <h4 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">User Growth Curve</h4>
            <p className="text-lg font-extrabold mt-0.5">{stats.totalUsers.toLocaleString()} members</p>
          </div>
          <div className="w-full h-44">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.userGrowth} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                <defs>
                  <linearGradient id="userGrowthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={isDark ? 0.4 : 0.2} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={t.chartGrid} />
                <XAxis dataKey="month" stroke={t.chartAxis} tick={{ fill: t.chartTick, fontSize: 10 }} />
                <YAxis stroke={t.chartAxis} tick={{ fill: t.chartTick, fontSize: 10 }} />
                <Tooltip {...chartTooltipStyles} />
                <Area type="monotone" dataKey="users" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#userGrowthGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-between">
          <div className="mb-4">
            <h4 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">Deposits vs Withdrawals</h4>
            <p className="text-lg font-extrabold mt-0.5">Monthly volumes</p>
          </div>
          <div className="w-full h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.txFlow} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={t.chartGrid} />
                <XAxis dataKey="month" stroke={t.chartAxis} tick={{ fill: t.chartTick, fontSize: 10 }} />
                <YAxis stroke={t.chartAxis} tick={{ fill: t.chartTick, fontSize: 10 }} />
                <Tooltip {...chartTooltipStyles} />
                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                <Bar dataKey="deposits" name="Deposits" fill="#10b981" radius={[3, 3, 0, 0]} />
                <Bar dataKey="withdrawals" name="Withdrawals" fill="#f43f5e" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-between">
          <div className="mb-4">
            <h4 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">Revenue Trend</h4>
            <p className="text-lg font-extrabold mt-0.5">Platform margins</p>
          </div>
          <div className="w-full h-44">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.revenue} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={t.chartGrid} />
                <XAxis dataKey="month" stroke={t.chartAxis} tick={{ fill: t.chartTick, fontSize: 10 }} />
                <YAxis stroke={t.chartAxis} tick={{ fill: t.chartTick, fontSize: 10 }} />
                <Tooltip {...chartTooltipStyles} />
                <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#8b5cf6" strokeWidth={2.5} dot={{ fill: '#8b5cf6', r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Operational Grid Queue */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <h4 className="font-display font-bold text-sm tracking-tight">Active Operation Queues</h4>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { label: 'Withdrawal Approvals', count: queues.pendingWithdrawals, icon: '💸', color: 'border-amber-500/20 bg-amber-500/5', btn: 'bg-amber-500 hover:bg-amber-600 focus-visible:ring-amber-500', path: 'withdrawals' },
            { label: 'Deposit Review', count: queues.pendingDeposits, icon: '📥', color: 'border-blue-500/20 bg-blue-500/5', btn: 'bg-blue-600 hover:bg-blue-700 focus-visible:ring-blue-600', path: 'deposits' },
            { label: 'Support Tickets', count: queues.activeSupportTickets, icon: '🎫', color: 'border-purple-500/20 bg-purple-500/5', btn: 'bg-purple-600 hover:bg-purple-700 focus-visible:ring-purple-600', path: 'support' },
            { label: 'Security Threats', count: queues.securityThreats, icon: '🚨', color: 'border-red-500/20 bg-red-500/5', btn: 'bg-red-600 hover:bg-red-700 focus-visible:ring-red-600', path: 'security' },
            { label: 'Suspended Users', count: queues.suspendedUsers, icon: '🚫', color: 'border-slate-500/20 bg-slate-500/5', btn: 'bg-slate-700 hover:bg-slate-800 focus-visible:ring-slate-700', path: 'users' },
          ].map((item) => (
            <div key={item.label} className={`rounded-2xl p-4 border flex flex-col justify-between min-h-[145px] transition-all duration-300 ${item.color}`}>
              <div className="flex justify-between items-start">
                <span className="text-2xl select-none">{item.icon}</span>
                <span className="text-xl font-extrabold font-display leading-none">{item.count}</span>
              </div>
              <div className="space-y-3 mt-2 text-left">
                <p className="text-xs font-bold leading-tight">{item.label}</p>
                <button
                  onClick={() => onNavigate(item.path)}
                  className={`w-full py-1.5 rounded-xl text-[10px] font-bold text-white transition-all cursor-pointer ${item.btn} shadow-xs`}
                >
                  Manage Queue →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Platform Integrity */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="w-4 h-4 text-blue-500" />
          <h4 className="font-display font-bold text-sm tracking-tight">System Integrity & Health</h4>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { label: 'Core REST API', status: 'Active', uptime: '99.98%', icon: Server, color: 'text-emerald-500' },
            { label: 'SQL Database Instance', status: 'Active', uptime: '99.95%', icon: Database, color: 'text-emerald-500' },
            { label: 'Mail Dispatch Service', status: 'Degraded', uptime: '97.41%', icon: Mail, color: 'text-amber-500' },
            { label: 'Blockchain Node Connection', status: 'Active', uptime: '99.88%', icon: Network, color: 'text-emerald-500' },
            { label: 'Active Auditor Sessions', status: '3 Online', uptime: 'Operational', icon: ShieldCheck, color: 'text-cyan-500' },
          ].map((service) => (
            <Card key={service.label} className="p-4 flex flex-col justify-between text-left h-full min-h-[110px]">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-1.5 rounded-xl ${t.inset}`}>
                  <service.icon className={`w-4 h-4 ${service.color}`} />
                </div>
                <Badge variant={service.status === 'Degraded' ? 'amber' : service.status.includes('Online') ? 'primary' : 'emerald'}>
                  {service.status}
                </Badge>
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold truncate">{service.label}</p>
                <p className={`text-[10px] font-mono font-medium ${t.textMuted}`}>{service.uptime}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
