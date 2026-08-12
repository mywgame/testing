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
    <Card className="p-0 overflow-hidden border-slate-800">
      <div className="p-4 border-b border-gray-200/10 bg-slate-900/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold font-mono tracking-wider uppercase flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-emerald-400" />
              Gas & Sweep Processing Queue (State Machine)
            </h3>
            <button
              onClick={() => fetchQueueData(selectedNetwork)}
              disabled={queueLoading}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Refresh Queue"
            >
              <RefreshCw className={`w-3 h-3 ${queueLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <p className="text-[10px] text-gray-400 mt-0.5">
            Active state machine tracking for deposit sweeps, dynamic gas calculations, and transaction dispatch pipelines. (Aggregated per user address)
          </p>
        </div>

        {selectedQueueIds.length > 0 && (
          <div className="flex items-center gap-2 bg-blue-950/40 border border-blue-800 px-2 py-1 rounded">
            <span className="text-[10px] font-mono text-blue-300 font-bold">
              {selectedQueueIds.length} Selected
            </span>
            <button
              onClick={() => handleBulkQueueAction('FUND_GAS')}
              disabled={bulkProcessing}
              className="bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded text-[9px] font-bold disabled:opacity-50"
            >
              Bulk Fund Gas
            </button>
            <button
              onClick={() => handleBulkQueueAction('SWEEP')}
              disabled={bulkProcessing}
              className="bg-amber-600 hover:bg-amber-500 text-white px-2 py-1 rounded text-[9px] font-bold disabled:opacity-50"
            >
              Bulk Sweep
            </button>
            <button
              onClick={() => handleBulkQueueAction('FUND_AND_SWEEP')}
              disabled={bulkProcessing}
              className="bg-purple-600 hover:bg-purple-500 text-white px-2 py-1 rounded text-[9px] font-bold disabled:opacity-50"
            >
              Bulk Fund & Sweep
            </button>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900/20 text-[10px] font-mono tracking-wider uppercase text-gray-400 border-b border-gray-200/10">
              <th className="py-2.5 px-3 w-8">
                <input
                  type="checkbox"
                  checked={
                    selectedQueueIds.length > 0 &&
                    selectedQueueIds.length === pendingEligibleItems.length
                  }
                  onChange={handleSelectAllQueue}
                  className="rounded border-slate-800"
                />
              </th>
              <th className="py-2.5 px-3">User</th>
              <th className="py-2.5 px-3">Deposit Address</th>
              <th className="py-2.5 px-3 text-right">Amount</th>
              <th className="py-2.5 px-3">Native / Required Gas</th>
              <th className="py-2.5 px-3">Gas Status</th>
              <th className="py-2.5 px-3">State Machine Status</th>
              <th className="py-2.5 px-3 text-center">Retries</th>
              <th className="py-2.5 px-3 text-center">Operations</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200/10 text-xs font-mono">
            {displayQueueItems.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-gray-500 text-xs">
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
                  <tr key={item.id} className="hover:bg-slate-900/10">
                    <td className="py-2.5 px-3">
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
                          className="rounded border-slate-800"
                        />
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] text-blue-400 font-semibold font-mono">
                            {item.dsUserId || 'N/A'}
                          </span>
                          {isAggregated && (
                            <span
                              className="text-[8px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30"
                              title={`${item.depositCount} unswept deposits combined`}
                            >
                              {item.depositCount} Deposits
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-bold text-slate-200" title={item.userName || ''}>
                          {item.userName || 'N/A'}
                        </span>
                        <span className="text-[9px] text-gray-400 truncate max-w-[130px]" title={item.userEmail || ''}>
                          {item.userEmail || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-gray-400">
                      <div className="flex items-center gap-1">
                        <span className="truncate max-w-[110px]" title={item.depositAddress}>
                          {item.depositAddress}
                        </span>
                        <button
                          onClick={() => handleCopy(item.depositAddress, item.id)}
                          className="text-gray-500 hover:text-gray-300"
                        >
                          {copiedText === item.id ? 'Copied' : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-400" title={`${item.amount} USDT total`}>
                      <div className="flex flex-col items-end">
                        <span>{formatQueueAmount(item.amount)}</span>
                        {isAggregated && (
                          <span className="text-[8px] text-amber-400/80 font-normal">
                            (Sum of {item.depositCount})
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-semibold text-slate-200">
                          Bal: {parseFloat(item.nativeGasBalance || '0').toFixed(5)} {symbol}
                        </span>
                        <span className="text-[9px] text-gray-400">
                          Req: {parseFloat(item.requiredGas || '0').toFixed(5)} {symbol}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          item.gasStatus === 'OK'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : item.gasStatus === 'FUNDING_SENT'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse'
                            : item.gasStatus === 'LOW'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {item.gasStatus}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex flex-col gap-0.5">
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            item.status === 'COMPLETED'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : item.status === 'READY_TO_SWEEP'
                              ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400 animate-pulse'
                              : item.status === 'SWEEPING' || item.status === 'WAITING_SWEEP_CONFIRMATION'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 animate-pulse'
                              : item.status === 'GAS_FUNDING' || item.status === 'WAITING_GAS_CONFIRMATION'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 animate-pulse'
                              : item.status === 'WAITING_FOR_GAS' || item.status === 'WAITING_GAS'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : item.status === 'WAITING_DELAY'
                              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                              : item.status === 'FAILED'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : item.status === 'RETRY_PENDING'
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse'
                              : 'bg-slate-500/20 text-slate-300 border border-slate-500/40'
                          }`}
                        >
                          {item.status}
                        </span>
                        {item.errorMessage && (
                          <span className="text-[8px] text-rose-400 max-w-[100px] truncate" title={item.errorMessage}>
                            Error: {item.errorMessage}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-center text-slate-300 text-[10px]">
                      {item.attempts || 0}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {!isFinished && (
                          <>
                            <button
                              onClick={() => handleQueueFundGas(item.id)}
                              disabled={
                                isRowProcessing ||
                                item.status === 'READY_TO_SWEEP' ||
                                item.status === 'SWEEPING'
                              }
                              className="text-[9px] px-1.5 py-0.5 rounded bg-blue-600/10 border border-blue-600/30 text-blue-400 hover:bg-blue-600/20 transition-colors disabled:opacity-30"
                              title="Fund Gas"
                            >
                              Fund Gas
                            </button>
                            <button
                              onClick={() => handleQueueSweep(item.id)}
                              disabled={isRowProcessing || item.status === 'SWEEPING'}
                              className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-600/10 border border-emerald-600/30 text-emerald-400 hover:bg-emerald-600/20 transition-colors disabled:opacity-30"
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
                            className="text-[9px] px-1.5 py-0.5 rounded bg-amber-600/10 border border-amber-600/30 text-amber-400 hover:bg-amber-600/20 transition-colors disabled:opacity-30"
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
                            className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400 hover:bg-slate-700 transition-colors disabled:opacity-30"
                            title="Cancel Job"
                          >
                            Cancel
                          </button>
                        )}

                        <button
                          onClick={() => setSelectedItemDetails(item)}
                          className="text-[9px] px-1.5 py-0.5 rounded bg-purple-600/10 border border-purple-600/30 text-purple-300 hover:bg-purple-600/20 transition-colors"
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
