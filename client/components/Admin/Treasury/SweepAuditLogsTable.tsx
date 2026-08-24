/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FileText, ChevronRight, Copy, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, Badge } from '../../ui/index.ts';
import { SweepJob, TreasuryComponentProps } from './TreasuryTypes.ts';

interface SweepAuditLogsTableProps extends TreasuryComponentProps {
  jobs: SweepJob[];
  handleRetryJob: (id: string) => void;
  retryingJobId: string | null;
}

const formatAuditAmount = (rawAmount: string | number | undefined): string => {
  const value = parseFloat(String(rawAmount ?? '0'));
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const SweepAuditLogsTable: React.FC<SweepAuditLogsTableProps> = ({
  jobs,
  handleRetryJob,
  retryingJobId,
  isDark,
  t,
}) => {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(20);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const visibleJobs = jobs.slice(0, visibleCount);
  const isExpanded = visibleCount >= jobs.length;

  return (
    <Card className={`p-0 overflow-hidden flex flex-col transition-all ${
      isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-gray-200/90 shadow-xs'
    }`}>
      <div className={`p-4 border-b flex justify-between items-center shrink-0 ${
        isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-gray-50/90 border-gray-200'
      }`}>
        <div>
          <h3 className="text-xs font-bold font-mono tracking-wider uppercase flex items-center gap-1.5 text-gray-900 dark:text-white">
            <FileText className="w-4 h-4 text-blue-500" />
            Historical Sweep Audit Logs (Idempotent Jobs)
          </h3>
          <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mt-1">
            Full cryptographic ledger records of previous and pending sweep transfers.
          </p>
        </div>
        {jobs.length > 20 && (
          <span className="text-xs font-mono font-semibold text-gray-500 dark:text-gray-400">
            Showing {visibleJobs.length} of {jobs.length} logs
          </span>
        )}
      </div>

      <div className="max-h-[500px] overflow-y-auto overflow-x-auto relative">
        <table className="w-full text-left border-collapse">
          <thead className={`sticky top-0 z-10 border-b shadow-xs text-xs font-mono font-bold tracking-wider uppercase ${
            isDark ? 'bg-slate-900 text-gray-400 border-slate-800' : 'bg-gray-100 text-gray-700 border-gray-200'
          }`}>
            <tr>
              <th className="py-3 px-4">User</th>
              <th className="py-3 px-4">Job ID</th>
              <th className="py-3 px-4">Operation</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Source → Destination</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Tx Hash / Error</th>
              <th className="py-3 px-4 text-center">Trigger</th>
            </tr>
          </thead>
          <tbody className={`divide-y text-xs font-mono ${
            isDark ? 'divide-slate-800/80' : 'divide-gray-200'
          }`}>
            {jobs.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-10 text-center text-gray-500 dark:text-gray-400 text-xs font-medium font-sans">
                  No sweep jobs processed for this network yet.
                </td>
              </tr>
            ) : (
              visibleJobs.map((job) => {
                const isSystemJob = job.sweepType === 'HOT_TO_COLD';
                return (
                  <tr key={job.id} className={`transition-colors ${
                    isDark ? 'hover:bg-slate-800/40' : 'hover:bg-gray-50/80'
                  }`}>
                    <td className="py-3 px-4">
                      <div className="flex flex-col font-sans">
                        <span className="text-xs text-blue-600 dark:text-blue-400 font-bold font-mono">
                          {isSystemJob ? 'SYSTEM' : job.dsUserId || 'N/A'}
                        </span>
                        <span className="text-xs font-bold text-gray-900 dark:text-slate-100">
                          {isSystemJob ? 'Treasury System' : job.userName || 'N/A'}
                        </span>
                        <span
                          className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[140px] font-medium"
                          title={isSystemJob ? 'system@treasury' : job.userEmail || 'N/A'}
                        >
                          {isSystemJob ? 'system@treasury' : job.userEmail || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs font-bold font-mono text-gray-600 dark:text-gray-400">
                      {job.id.slice(0, 8)}...
                    </td>
                    <td className="py-3 px-4">
                      <Badge color={job.sweepType === 'USER_TO_HOT' ? 'blue' : 'purple'}>
                        {job.sweepType === 'USER_TO_HOT' ? 'USER → HOT' : 'HOT → COLD'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-gray-900 dark:text-slate-100 font-extrabold text-xs">
                      {formatAuditAmount(job.amount)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 text-xs font-mono text-gray-700 dark:text-gray-300">
                        <span className="truncate max-w-[90px] font-medium" title={job.sourceAddress}>
                          {job.sourceAddress}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="truncate max-w-[90px] font-medium" title={job.destinationAddress}>
                          {job.destinationAddress}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold leading-none ${
                          job.status === 'COMPLETED'
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                            : job.status === 'IN_PROGRESS' || job.status === 'AWAITING_CONFIRMATION'
                            ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30 animate-pulse'
                            : job.status === 'PENDING'
                            ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                            : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-[200px] truncate text-xs">
                      {job.status === 'COMPLETED' || job.txHash ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-700 dark:text-gray-300 truncate font-mono text-xs font-medium">{job.txHash}</span>
                          <button
                            onClick={() => handleCopy(job.txHash || '', job.id)}
                            className="text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 shrink-0 p-0.5"
                            title="Copy transaction hash"
                          >
                            {copiedText === job.id ? (
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold font-sans">Copied</span>
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      ) : job.errorMessage ? (
                        <span className="text-rose-600 dark:text-rose-400 font-semibold font-sans text-xs" title={job.errorMessage}>
                          {job.errorMessage}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {job.status === 'FAILED' ? (
                        <button
                          onClick={() => handleRetryJob(job.id)}
                          disabled={retryingJobId === job.id}
                          className="text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition-colors cursor-pointer shadow-xs"
                        >
                          {retryingJobId === job.id ? 'Retrying...' : 'Retry Job'}
                        </button>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {jobs.length > 20 && (
        <div className={`p-3 border-t flex justify-center shrink-0 ${
          isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-gray-50 border-gray-200'
        }`}>
          <button
            onClick={() => setVisibleCount(isExpanded ? 20 : jobs.length)}
            className={`text-xs font-mono font-bold flex items-center gap-1 px-4 py-1.5 rounded-xl border transition-colors shadow-xs ${
              isDark ? 'bg-slate-800 text-blue-400 hover:bg-slate-700 border-slate-700' : 'bg-white text-blue-600 hover:bg-gray-100 border-gray-300'
            }`}
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4" /> Show Initial 20 Logs
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" /> Show All {jobs.length} Logs
              </>
            )}
          </button>
        </div>
      )}
    </Card>
  );
};
