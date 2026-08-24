/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ScrollText,
  Search,
  Filter,
  CheckCircle,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  FileText,
  Eye,
  X,
  User,
  Activity,
  Layers,
  Calendar,
  Globe,
  Monitor,
  Download
} from 'lucide-react';
import { Card, Badge, Button } from '../ui/index.ts';
import { ThemeTokens } from '../ui/themeTokens.ts';
import { api } from '../../services/api.ts';
import { formatDateTime } from '../../utils/dateFormatter.ts';

interface AdminAuditLog {
  id?: string;
  action: string;
  admin: string;
  actorUid?: string;
  targetUser?: string | null;
  targetUserName?: string | null;
  targetUserDsId?: string | null;
  userId?: string | null;
  resource?: string;
  oldValue?: string | null;
  newValue?: string | null;
  ip: string;
  device?: string;
  time: string;
  rawTimestamp?: string;
  module: string;
}

// Action formatter utility to turn raw enums into human-readable action text
const formatActionName = (action: string): string => {
  if (!action) return 'System Action';
  const customMap: Record<string, string> = {
    DAILY_DPY_CLAIMED: 'Daily DPY Claimed',
    WALLET_MANUAL_ADJUSTMENT: 'Manual Balance Adjustment',
    USER_STATUS_CHANGE: 'User Status Updated',
    WITHDRAWAL_APPROVAL: 'Withdrawal Approved',
    WITHDRAWAL_REJECTION: 'Withdrawal Rejected',
    SETTINGS_UPDATE: 'System Settings Updated',
    DEPOSIT_APPROVAL: 'Deposit Approved',
    TRIAL_FUND_EXPIRED: 'Trial Fund Expired',
    ADMIN_LOGIN: 'Admin Login',
    USER_REGISTRATION: 'User Registered',
  };

  if (customMap[action]) return customMap[action];

  // Convert SCREAMING_SNAKE_CASE to Title Case
  return action
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

interface AuditLogsViewProps {
  t: ThemeTokens;
  isDark: boolean;
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({ t, isDark }) => {
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState<'All' | 'Users' | 'Deposits' | 'Withdrawals' | 'Yield & Rewards' | 'Wallets' | 'Settings'>('All');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<AdminAuditLog | null>(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getAdminAuditLogs();
      if (res.success && Array.isArray(res.data)) {
        setLogs(res.data);
      } else {
        setError(res.error?.message || 'Failed to fetch audit logs.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while loading audit trail.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Filter logs
  const filteredLogs = logs.filter(log => {
    const term = search.toLowerCase();
    const matchesSearch =
      log.action.toLowerCase().includes(term) ||
      log.admin.toLowerCase().includes(term) ||
      (log.targetUser && log.targetUser.toLowerCase().includes(term)) ||
      (log.resource && log.resource.toLowerCase().includes(term)) ||
      log.ip.toLowerCase().includes(term);

    if (!matchesSearch) return false;
    if (moduleFilter === 'All') return true;
    return log.module === moduleFilter;
  });

  const exportLogsAsCSV = () => {
    if (filteredLogs.length === 0) return;
    const headers = ['Action', 'Admin', 'Target User', 'Resource', 'Module', 'IP Address', 'Device', 'Time'];
    const rows = filteredLogs.map(l => [
      `"${l.action.replace(/"/g, '""')}"`,
      `"${l.admin.replace(/"/g, '""')}"`,
      `"${(l.targetUser || 'N/A').replace(/"/g, '""')}"`,
      `"${(l.resource || 'N/A').replace(/"/g, '""')}"`,
      `"${l.module.replace(/"/g, '""')}"`,
      `"${l.ip}"`,
      `"${(l.device || 'Web Console').replace(/"/g, '""')}"`,
      `"${l.time}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseJsonSafe = (data?: string | null) => {
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return data;
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <ScrollText className="w-5 h-5 text-blue-500" />
            <span>Audit Trail Logs</span>
          </h2>
          <p className={`text-xs mt-1 ${t.textSub}`}>
            Immutable tamper-proof records of administrative actions, balance adjustments, yield distributions, and security events.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportLogsAsCSV}
            disabled={filteredLogs.length === 0}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isDark ? 'bg-white/5 hover:bg-white/10 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            } disabled:opacity-50`}
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
          <button
            onClick={fetchLogs}
            disabled={loading}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isDark ? 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-400' : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Sync Logs
          </button>
        </div>
      </div>

      {/* Table Card Container */}
      <Card className="p-0 overflow-hidden">
        {/* Controls header */}
        <div className={`p-4 border-b flex flex-col md:flex-row gap-3 items-center justify-between ${t.sep}`}>
          {/* Search bar */}
          <div className="relative w-full md:max-w-md">
            <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${t.textMuted}`} />
            <input
              type="text"
              placeholder="Search by action, admin, target user/DS ID, resource, IP..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all ${t.input}`}
            />
          </div>

          {/* Module Filter buttons */}
          <div className="flex gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {(['All', 'Users', 'Deposits', 'Withdrawals', 'Yield & Rewards', 'Wallets', 'Settings'] as const).map(tab => {
              const active = moduleFilter === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setModuleFilter(tab)}
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                    active
                      ? 'bg-blue-600 text-white shadow-xs'
                      : `${isDark ? 'bg-white/5 text-gray-400 hover:bg-white/8' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-500/10 border-b border-rose-500/20 text-rose-500 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>{error}</span>
            </div>
            <Button variant="secondary" onClick={fetchLogs} className="px-3 py-1 text-xs">
              Retry
            </Button>
          </div>
        )}

        {/* Trail Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className={`border-b ${t.sep} ${isDark ? 'bg-white/2' : 'bg-gray-50'}`}>
                {['Action', 'Target User', 'Performed By', 'Module', 'Timestamp'].map((header) => (
                  <th key={header} className={`px-5 py-3.5 font-bold uppercase tracking-wider text-[11px] ${t.textMuted}`}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/10">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-gray-400">
                      <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
                      <span className="text-xs font-medium">Fetching real-time audit ledger...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map((log, idx) => {
                  // Resolve Target User primary and secondary representation
                  const targetName = log.targetUserName || (log.targetUser ? log.targetUser.replace(/\s*\([^)]*\)/, '') : null);
                  const targetDsId = log.targetUserDsId || (log.targetUser && log.targetUser.includes('(') ? log.targetUser.match(/\(([^)]+)\)/)?.[1] : null);

                  return (
                    <tr 
                      key={log.id || idx} 
                      onClick={() => setSelectedLog(log)}
                      className={`transition-colors hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer ${t.cardInner}`}
                      title="Click to view detailed audit snapshot payload"
                    >
                      {/* 1. Action Column */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                          <div className="font-bold text-gray-900 dark:text-white">
                            {formatActionName(log.action)}
                          </div>
                        </div>
                      </td>

                      {/* 2. Target User Column */}
                      <td className="px-5 py-3.5">
                        {targetName ? (
                          <div className="flex flex-col">
                            <span className="font-semibold text-gray-900 dark:text-white text-xs">
                              {targetName}
                            </span>
                            {targetDsId && (
                              <span className="font-mono text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                                {targetDsId}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className={`text-[11px] ${t.textMuted}`}>System / None</span>
                        )}
                      </td>

                      {/* 3. Performed By Column */}
                      <td className="px-5 py-3.5 font-semibold text-gray-800 dark:text-gray-200">
                        {log.admin || 'System'}
                      </td>

                      {/* 4. Module Column */}
                      <td className="px-5 py-3.5">
                        <Badge variant={
                          log.module === 'Withdrawals' ? 'rose' :
                          log.module === 'Deposits' ? 'primary' :
                          log.module === 'Users' ? 'amber' :
                          log.module === 'Yield & Rewards' ? 'emerald' :
                          log.module === 'Wallets' ? 'cyan' : 'neutral'
                        }>
                          {log.module}
                        </Badge>
                      </td>

                      {/* 5. Timestamp Column */}
                      <td className={`px-5 py-3.5 text-[11px] whitespace-nowrap ${t.textSub}`}>
                        {(() => {
                          const formatted = formatDateTime(log.rawTimestamp || log.time);
                          return (
                            <div className="flex flex-col" title={`System Time: ${formatted.utcFull} (${formatted.timeZoneAbbr})`}>
                              <span className="font-semibold">{formatted.localDate}</span>
                              <span className="text-[10px] text-gray-400 font-mono">{formatted.utcFull}</span>
                            </div>
                          );
                        })()}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className={`px-5 py-10 text-center font-medium ${t.textMuted}`}>
                    No audit records found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Detailed Modal Drawer */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className={`w-full max-w-2xl rounded-2xl border shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto ${
            isDark ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-900'
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <h3 className="font-bold text-base">Audit Log Snapshot Detail</h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                <div>
                  <span className="text-gray-400 block font-medium">Action</span>
                  <span className="font-bold text-sm text-blue-500">{selectedLog.action}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Module</span>
                  <Badge variant="primary">{selectedLog.module}</Badge>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Actor / Initiator</span>
                  <span className="font-semibold">{selectedLog.admin}</span>
                  {selectedLog.actorUid && (
                    <span className="font-mono text-[10px] text-gray-400 block">UID: {selectedLog.actorUid}</span>
                  )}
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Target User</span>
                  <span className="font-semibold">{selectedLog.targetUser || 'System / None'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">IP Address & Device</span>
                  <span className="font-mono">{selectedLog.ip}</span>
                  <span className="text-[10px] text-gray-400 block">{selectedLog.device || 'Web Client'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Timestamp</span>
                  <span>{selectedLog.time}</span>
                </div>
              </div>

              {selectedLog.resource && (
                <div>
                  <span className="text-gray-400 block font-medium mb-1">Target Resource URI</span>
                  <div className="p-2.5 rounded-lg font-mono text-[11px] bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                    {selectedLog.resource}
                  </div>
                </div>
              )}

              {selectedLog.oldValue && (
                <div>
                  <span className="text-gray-400 block font-medium mb-1">Previous Value / Snapshot Before</span>
                  <pre className="p-3 rounded-xl font-mono text-[11px] bg-rose-500/5 text-rose-600 dark:text-rose-400 border border-rose-500/10 overflow-x-auto whitespace-pre-wrap max-h-40">
                    {typeof parseJsonSafe(selectedLog.oldValue) === 'object'
                      ? JSON.stringify(parseJsonSafe(selectedLog.oldValue), null, 2)
                      : selectedLog.oldValue}
                  </pre>
                </div>
              )}

              {selectedLog.newValue && (
                <div>
                  <span className="text-gray-400 block font-medium mb-1">New Value / Snapshot After</span>
                  <pre className="p-3 rounded-xl font-mono text-[11px] bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10 overflow-x-auto whitespace-pre-wrap max-h-40">
                    {typeof parseJsonSafe(selectedLog.newValue) === 'object'
                      ? JSON.stringify(parseJsonSafe(selectedLog.newValue), null, 2)
                      : selectedLog.newValue}
                  </pre>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <Button variant="secondary" onClick={() => setSelectedLog(null)} className="text-xs px-4 py-2">
                Close Snapshot
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AuditLogsView;
