/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Coins, RefreshCw, Copy } from 'lucide-react';
import { Card } from '../../ui/index.ts';
import { SweepQueueItem, TreasuryComponentProps } from './TreasuryTypes.ts';

// Presentation-only formatter for the queue table's Amount column (Part 3.5).
// Never rounds/truncates the underlying stored value — only changes how it's displayed.
const formatQueueAmount = (rawAmount: string | number | undefined): string => {
  const value = parseFloat(String(rawAmount ?? '0'));
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

interface SweepQueueTableProps extends TreasuryComponentProps {
  sweepQueueItems: SweepQueueItem[];
  queueLoading: boolean;
  fetchQueueData: (network: string) => void;
  selectedNetwork: string;
  selectedQueueIds: string[];
  handleSelectAllQueue: () => void;
  handleToggleSelectQueue: (id: string) => void;
  handleBulkQueueAction: (action: 'FUND_GAS' | 'SWEEP' | 'FUND_AND_SWEEP') => void;
  bulkProcessing: boolean;
  processingQueueId: string | null;
  handleQueueFundGas: (id: string) => void;
  handleQueueSweep: (id: string) => void;
  handleQueueRetry: (id: string) => void;
  handleQueueCancel: (id: string) => void;
  setSelectedItemDetails: (item: any) => void;
  copiedText: string | null;
  handleCopy: (text: string, id: string) => void;
}

export const SweepQueueTable: React.FC<SweepQueueTableProps> = ({
  sweepQueueItems,
  queueLoading,
  fetchQueueData,
  selectedNetwork,
  selectedQueueIds,
  handleSelectAllQueue,
  handleToggleSelectQueue,
  handleBulkQueueAction,
  bulkProcessing,
  processingQueueId,
  handleQueueFundGas,
  handleQueueSweep,
  handleQueueRetry,
  handleQueueCancel,
  setSelectedItemDetails,
  copiedText,
  handleCopy,
  isDark,
  t,
}) => {
  const symbol =
    selectedNetwork === 'USDT_BEP20' ? 'BNB' : selectedNetwork === 'USDT_POLYGON' ? 'POL' : 'TRX';

  // Group active/pending queue items by deposit address so multiple deposits from the same user are aggregated into one comprehensive total row.
  const displayQueueItems = React.useMemo(() => {
    const activeGroups = new Map<string, any>();
    const completedOrCancelled: any[] = [];

    for (const item of sweepQueueItems) {
      const isFinished = item.status === 'COMPLETED' || item.status === 'CANCELLED';
      if (isFinished) {
        completedOrCancelled.push(item);
        continue;
      }

      const key = `${item.depositAddress}_${item.network}`;
      if (!activeGroups.has(key)) {
        activeGroups.set(key, {
          ...item,
          allIds: [item.id],
          depositCount: 1,
          totalAmountNum: parseFloat(item.amount || '0'),
          depositBreakdown: [item],
        });
      } else {
        const group = activeGroups.get(key)!;
        group.allIds.push(item.id);
        group.depositCount += 1;
        group.totalAmountNum += parseFloat(item.amount || '0');
        group.depositBreakdown.push(item);

        // Keep status of the most urgent or recent item
        if (
          item.status === 'FAILED' ||
          item.status === 'READY_TO_SWEEP' ||
          new Date(item.createdAt).getTime() > new Date(group.createdAt).getTime()
        ) {
          group.status = item.status;
          group.gasStatus = item.gasStatus;
          group.errorMessage = item.errorMessage || group.errorMessage;
          group.attempts = Math.max(group.attempts || 0, item.attempts || 0);
        }
      }
    }

    const aggregatedActiveList = Array.from(activeGroups.values()).map((group) => ({
      ...group,
      amount: group.totalAmountNum.toString(),
    }));

    return [...aggregatedActiveList, ...completedOrCancelled];
  }, [sweepQueueItems]);

  const pendingEligibleItems = sweepQueueItems.filter(
    (i) => i.status !== 'COMPLETED' && i.status !== 'CANCELLED'
  );

  return (
    <Card className={`p-0 overflow-hidden transition-all ${
      isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-gray-200/90 shadow-xs'
    }`}>
      <div className={`p-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${
        isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-gray-50/90 border-gray-200'
      }`}>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold font-mono tracking-wider uppercase flex items-center gap-1.5 text-gray-900 dark:text-white">
              <Coins className="w-4 h-4 text-emerald-500" />
              Gas & Sweep Processing Queue (State Machine)
            </h3>
            <button
              onClick={() => fetchQueueData(selectedNetwork)}
              disabled={queueLoading}
              className={`p-1.5 rounded-lg border transition-colors ${
                isDark ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
              title="Refresh Queue"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${queueLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mt-1">
            Active state machine tracking for deposit sweeps, dynamic gas calculations, and transaction dispatch pipelines. (Aggregated per user address)
          </p>
        </div>

        {selectedQueueIds.length > 0 && (
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
            isDark ? 'bg-blue-950/50 border-blue-800' : 'bg-blue-50 border-blue-200'
          }`}>
            <span className="text-xs font-mono text-blue-600 dark:text-blue-300 font-bold">
              {selectedQueueIds.length} Selected
            </span>
            <button
              onClick={() => handleBulkQueueAction('FUND_GAS')}
              disabled={bulkProcessing}
              className="bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-1 rounded-lg text-xs font-bold disabled:opacity-50 shadow-xs"
            >
              Bulk Fund Gas
            </button>
            <button
              onClick={() => handleBulkQueueAction('SWEEP')}
              disabled={bulkProcessing}
              className="bg-amber-600 hover:bg-amber-500 text-white px-2.5 py-1 rounded-lg text-xs font-bold disabled:opacity-50 shadow-xs"
            >
              Bulk Sweep
            </button>
            <button
              onClick={() => handleBulkQueueAction('FUND_AND_SWEEP')}
              disabled={bulkProcessing}
              className="bg-purple-600 hover:bg-purple-500 text-white px-2.5 py-1 rounded-lg text-xs font-bold disabled:opacity-50 shadow-xs"
            >
              Bulk Fund & Sweep
            </button>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className={`text-xs font-mono font-bold tracking-wider uppercase border-b ${
              isDark ? 'bg-slate-900/80 text-gray-400 border-slate-800' : 'bg-gray-100 text-gray-700 border-gray-200'
            }`}>
              <th className="py-3 px-3.5 w-8">
                <input
                  type="checkbox"
                  checked={
                    selectedQueueIds.length > 0 &&
                    selectedQueueIds.length === pendingEligibleItems.length
                  }
                  onChange={handleSelectAllQueue}
                  className="rounded border-slate-700 w-4 h-4 cursor-pointer"
                />
              </th>
              <th className="py-3 px-3.5">User</th>
              <th className="py-3 px-3.5">Deposit Address</th>
              <th className="py-3 px-3.5 text-right">Amount</th>
              <th className="py-3 px-3.5">Native / Required Gas</th>
              <th className="py-3 px-3.5">Gas Status</th>
              <th className="py-3 px-3.5">State Machine Status</th>
              <th className="py-3 px-3.5 text-center">Retries</th>
              <th className="py-3 px-3.5 text-center">Operations</th>
            </tr>
          </thead>
          <tbody className={`divide-y text-xs font-mono ${
            isDark ? 'divide-slate-800/80' : 'divide-gray-200'
          }`}>
            {displayQueueItems.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-10 text-center text-gray-500 dark:text-gray-400 text-xs font-medium font-sans">
                  No active sweep queue items found for this network.
                </td>
              </tr>
            ) : (
              displayQueueItems.map((item: any) => {
                const isFinished = item.status === 'COMPLETED' || item.status === 'CANCELLED';
                const isAggregated = item.depositCount && item.depositCount > 1;
                const isRowProcessing =
                  processingQueueId === item.id ||
                  (item.allIds && item.allIds.includes(processingQueueId));

                return (
                  <tr key={item.id} className={`transition-colors ${
                    isDark ? 'hover:bg-slate-800/40' : 'hover:bg-gray-50/80'
                  }`}>
                    <td className="py-3 px-3.5">
                      {!isFinished && (
                        <input
                          type="checkbox"
                          checked={
                            item.allIds
                              ? item.allIds.every((id: string) => selectedQueueIds.includes(id))
                              : selectedQueueIds.includes(item.id)
                          }
                          onChange={() => {
                            if (item.allIds && item.allIds.length > 1) {
                              const allSelected = item.allIds.every((id: string) =>
                                selectedQueueIds.includes(id)
                              );
                              item.allIds.forEach((id: string) => {
                                if (allSelected && selectedQueueIds.includes(id)) {
                                  handleToggleSelectQueue(id);
                                } else if (!allSelected && !selectedQueueIds.includes(id)) {
                                  handleToggleSelectQueue(id);
                                }
                              });
                            } else {
                              handleToggleSelectQueue(item.id);
                            }
                          }}
                          className="rounded border-slate-700 w-4 h-4 cursor-pointer"
                        />
                      )}
                    </td>
                    <td className="py-3 px-3.5">
                      <div className="flex flex-col font-sans">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-blue-600 dark:text-blue-400 font-bold font-mono">
                            {item.dsUserId || 'N/A'}
                          </span>
                          {isAggregated && (
                            <span
                              className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-600 dark:text-amber-300 font-bold border border-amber-500/30"
                              title={`${item.depositCount} unswept deposits combined`}
                            >
                              {item.depositCount} Deposits
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-bold text-gray-900 dark:text-slate-100" title={item.userName || ''}>
                          {item.userName || 'N/A'}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[140px] font-medium" title={item.userEmail || ''}>
                          {item.userEmail || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate max-w-[120px] font-mono text-xs font-semibold text-gray-700 dark:text-gray-300" title={item.depositAddress}>
                          {item.depositAddress}
                        </span>
                        <button
                          onClick={() => handleCopy(item.depositAddress, item.id)}
                          className="text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 p-0.5"
                          title="Copy address"
                        >
                          {copiedText === item.id ? (
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Copied</span>
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-3.5 text-right font-bold text-emerald-600 dark:text-emerald-400 font-mono text-xs" title={`${item.amount} USDT total`}>
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-extrabold">{formatQueueAmount(item.amount)}</span>
                        {isAggregated && (
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold font-sans">
                            (Sum of {item.depositCount})
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3.5">
                      <div className="flex flex-col font-mono text-xs">
                        <span className="font-bold text-gray-900 dark:text-slate-200">
                          Bal: {parseFloat(item.nativeGasBalance || '0').toFixed(5)} {symbol}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 font-medium">
                          Req: {parseFloat(item.requiredGas || '0').toFixed(5)} {symbol}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold ${
                          item.gasStatus === 'OK'
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                            : item.gasStatus === 'FUNDING_SENT'
                            ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30 animate-pulse'
                            : item.gasStatus === 'LOW'
                            ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                            : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {item.gasStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3.5">
                      <div className="flex flex-col gap-1">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold ${
                            item.status === 'COMPLETED'
                              ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40'
                              : item.status === 'READY_TO_SWEEP'
                              ? 'bg-emerald-500/30 text-emerald-800 dark:text-emerald-200 border border-emerald-500 animate-pulse'
                              : item.status === 'SWEEPING' || item.status === 'WAITING_SWEEP_CONFIRMATION'
                              ? 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/40 animate-pulse'
                              : item.status === 'GAS_FUNDING' || item.status === 'WAITING_GAS_CONFIRMATION'
                              ? 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/40 animate-pulse'
                              : item.status === 'WAITING_FOR_GAS' || item.status === 'WAITING_GAS'
                              ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40'
                              : item.status === 'WAITING_DELAY'
                              ? 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/40'
                              : item.status === 'FAILED'
                              ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/40'
                              : item.status === 'RETRY_PENDING'
                              ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/40 animate-pulse'
                              : 'bg-slate-500/20 text-slate-700 dark:text-slate-300 border border-slate-500/40'
                          }`}
                        >
                          {item.status}
                        </span>
                        {item.errorMessage && (
                          <span className="text-[10px] text-rose-500 dark:text-rose-400 max-w-[120px] truncate font-sans font-medium" title={item.errorMessage}>
                            Error: {item.errorMessage}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3.5 text-center text-gray-700 dark:text-slate-300 text-xs font-bold">
                      {item.attempts || 0}
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {!isFinished && (
                          <>
                            <button
                              onClick={() => handleQueueFundGas(item.id)}
                              disabled={
                                isRowProcessing ||
                                item.status === 'READY_TO_SWEEP' ||
                                item.status === 'SWEEPING'
                              }
                              className="text-xs font-bold px-2 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition-colors disabled:opacity-30"
                              title="Fund Gas"
                            >
                              Fund Gas
                            </button>
                            <button
                              onClick={() => handleQueueSweep(item.id)}
                              disabled={isRowProcessing || item.status === 'SWEEPING'}
                              className="text-xs font-bold px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors disabled:opacity-30"
                              title="Sweep"
                            >
                              Sweep
                            </button>
                          </>
                        )}

                        {item.status === 'FAILED' && (
                          <button
                            onClick={() => {
                              if (item.allIds && item.allIds.length > 1) {
                                item.allIds.forEach((id: string) => handleQueueRetry(id));
                              } else {
                                handleQueueRetry(item.id);
                              }
                            }}
                            disabled={isRowProcessing}
                            className="text-xs font-bold px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-colors disabled:opacity-30"
                            title="Retry Failed Job"
                          >
                            Retry
                          </button>
                        )}

                        {!isFinished && (
                          <button
                            onClick={() => {
                              if (item.allIds && item.allIds.length > 1) {
                                item.allIds.forEach((id: string) => handleQueueCancel(id));
                              } else {
                                handleQueueCancel(item.id);
                              }
                            }}
                            disabled={isRowProcessing}
                            className={`text-xs font-bold px-2 py-1 rounded-lg border transition-colors disabled:opacity-30 ${
                              isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                            }`}
                            title="Cancel Job"
                          >
                            Cancel
                          </button>
                        )}

                        <button
                          onClick={() => setSelectedItemDetails(item)}
                          className="text-xs font-bold px-2 py-1 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-600 dark:text-purple-300 hover:bg-purple-500/20 transition-colors"
                          title="View Queue Item Details"
                        >
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
