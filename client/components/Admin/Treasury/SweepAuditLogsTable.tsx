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
    <Card className="p-0 overflow-hidden border-slate-800 flex flex-col">
      <div className="p-4 border-b border-gray-200/10 bg-slate-900/40 flex justify-between items-center shrink-0">
        <div>
          <h3 className="text-xs font-bold font-mono tracking-wider uppercase flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-blue-400" />
            Historical Sweep Audit Logs (Idempotent Jobs)
          </h3>
          <p className="text-[10px] text-gray-400 mt-0.5">
            Full cryptographic ledger records of previous and pending sweep transfers.
          </p>
        </div>
        {jobs.length > 20 && (
          <span className="text-[10px] text-gray-400 font-mono">
            Showing {visibleJobs.length} of {jobs.length} logs
          </span>
        )}
      </div>

      <div className="max-h-[500px] overflow-y-auto overflow-x-auto relative">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-10 bg-slate-900 border-b border-gray-200/10 shadow-sm">
            <tr className="text-[10px] font-mono tracking-wider uppercase text-gray-400">
              <th className="py-2.5 px-4 bg-slate-900">User</th>
              <th className="py-2.5 px-4 bg-slate-900">Job ID</th>
              <th className="py-2.5 px-4 bg-slate-900">Operation</th>
              <th className="py-2.5 px-4 bg-slate-900">Amount</th>
              <th className="py-2.5 px-4 bg-slate-900">Source → Destination</th>
              <th className="py-2.5 px-4 bg-slate-900">Status</th>
              <th className="py-2.5 px-4 bg-slate-900">Tx Hash / Error</th>
              <th className="py-2.5 px-4 text-center bg-slate-900">Trigger</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200/10 text-xs font-mono">
            {jobs.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-gray-500 text-xs">
                  No sweep jobs processed for this network yet.
                </td>
              </tr>
            ) : (
              visibleJobs.map((job) => {
                const isSystemJob = job.sweepType === 'HOT_TO_COLD';
                return (
                  <tr key={job.id} className="hover:bg-slate-900/10">
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-blue-400 font-semibold font-mono">
                          {isSystemJob ? 'SYSTEM' : job.dsUserId || 'N/A'}
                        </span>
                        <span className="text-[10px] font-bold text-slate-200">
                          {isSystemJob ? 'Treasury System' : job.userName || 'N/A'}
                        </span>
                        <span
                          className="text-[9px] text-gray-400 truncate max-w-[130px]"
                          title={isSystemJob ? 'system@treasury' : job.userEmail || 'N/A'}
                        >
                          {isSystemJob ? 'system@treasury' : job.userEmail || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-400 text-[10px] font-bold">
                      {job.id.slice(0, 8)}...
                    </td>
                    <td className="py-3 px-4">
                      <Badge color={job.sweepType === 'USER_TO_HOT' ? 'blue' : 'purple'}>
                        {job.sweepType === 'USER_TO_HOT' ? 'USER → HOT' : 'HOT → COLD'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-100 font-bold">
                      {formatAuditAmount(job.amount)}
                    </td>
                    <td className="py-3 px-4 text-gray-400">
                      <div className="flex items-center gap-1 text-[10px]">
                        <span className="truncate max-w-[80px]" title={job.sourceAddress}>
                          {job.sourceAddress}
                        </span>
                        <ChevronRight className="w-3 h-3 text-gray-600" />
                        <span className="truncate max-w-[80px]" title={job.destinationAddress}>
                          {job.destinationAddress}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold leading-none ${
                          job.status === 'COMPLETED'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : job.status === 'IN_PROGRESS' || job.status === 'AWAITING_CONFIRMATION'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse'
                            : job.status === 'PENDING'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-[200px] truncate text-[11px]">
                      {job.status === 'COMPLETED' || job.txHash ? (
                        <div className="flex items-center gap-1">
                          <span className="text-gray-400 truncate">{job.txHash}</span>
                          <button
                            onClick={() => handleCopy(job.txHash || '', job.id)}
                            className="text-gray-500 hover:text-gray-300 shrink-0"
                          >
                            {copiedText === job.id ? 'Copied' : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      ) : job.errorMessage ? (
                        <span className="text-rose-400 font-medium" title={job.errorMessage}>
                          {job.errorMessage}
                        </span>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {job.status === 'FAILED' ? (
                        <button
                          onClick={() => handleRetryJob(job.id)}
                          disabled={retryingJobId === job.id}
                          className="text-[10px] px-2 py-0.5 rounded bg-blue-600/10 border border-blue-600/30 text-blue-400 hover:bg-blue-600/20 transition-colors cursor-pointer"
                        >
                          {retryingJobId === job.id ? 'Retrying...' : 'Retry Job'}
                        </button>
                      ) : (
                        <span className="text-gray-600">—</span>
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
        <div className="p-3 border-t border-gray-200/10 bg-slate-900/30 flex justify-center shrink-0">
          <button
            onClick={() => setVisibleCount(isExpanded ? 20 : jobs.length)}
            className="text-xs font-mono text-blue-400 hover:text-blue-300 flex items-center gap-1 px-3 py-1 rounded bg-slate-800/60 border border-slate-700/60 transition-colors"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" /> Show Initial 20 Logs
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" /> Show All {jobs.length} Logs
              </>
            )}
          </button>
        </div>
      )}
    </Card>
  );
};
