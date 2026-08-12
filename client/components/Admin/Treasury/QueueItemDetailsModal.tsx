/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Info } from 'lucide-react';

interface QueueItemDetailsModalProps {
  selectedItemDetails: any;
  onClose: () => void;
}

export const QueueItemDetailsModal: React.FC<QueueItemDetailsModalProps> = ({
  selectedItemDetails,
  onClose,
}) => {
  if (!selectedItemDetails) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 font-mono text-xs">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-xl w-full overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-purple-400" />
            <h3 className="font-bold text-slate-100 uppercase tracking-wider">Queue Item Details</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-sm font-bold"
          >
            ✕
          </button>
        </div>
        <div className="p-5 space-y-3 text-slate-300">
          <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            <div>
              <span className="text-slate-500 block text-[9px] uppercase">Queue ID</span>
              <span className="font-bold text-slate-200 break-all">{selectedItemDetails.id}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px] uppercase">Network</span>
              <span className="font-bold text-slate-200">{selectedItemDetails.network}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px] uppercase">User Email</span>
              <span className="font-bold text-slate-200 break-all">{selectedItemDetails.userEmail}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px] uppercase">User Name</span>
              <span className="font-bold text-slate-200">{selectedItemDetails.userName || '—'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px] uppercase">User ID</span>
              <span className="font-bold text-blue-400">{selectedItemDetails.dsUserId}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            <div>
              <span className="text-slate-500 block text-[9px] uppercase">Deposit Address</span>
              <span className="font-bold text-slate-200 break-all">{selectedItemDetails.depositAddress}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px] uppercase">Amount</span>
              <span className="font-bold text-emerald-400">
                {selectedItemDetails.amount} USDT
                {selectedItemDetails.depositCount && selectedItemDetails.depositCount > 1 && (
                  <span className="text-[9px] text-amber-400 ml-1 font-normal">
                    ({selectedItemDetails.depositCount} deposits aggregated)
                  </span>
                )}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px] uppercase">Native Gas Balance</span>
              <span className="font-bold text-slate-200">{selectedItemDetails.nativeGasBalance || '0.00000000'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px] uppercase">Required Minimum Gas</span>
              <span className="font-bold text-slate-200">{selectedItemDetails.requiredGas || '0.00000000'}</span>
            </div>
          </div>

          {selectedItemDetails.depositBreakdown && selectedItemDetails.depositBreakdown.length > 1 && (
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 text-[11px]">
              <span className="text-slate-500 block text-[9px] uppercase font-bold mb-1.5 text-amber-400">
                Aggregated Un-swept Deposits Breakdown ({selectedItemDetails.depositBreakdown.length})
              </span>
              <div className="space-y-1 max-h-32 overflow-y-auto font-mono text-[10px] pr-1">
                {selectedItemDetails.depositBreakdown.map((dep: any, idx: number) => (
                  <div key={dep.id || idx} className="flex justify-between items-center border-b border-slate-800/60 pb-1">
                    <span className="text-slate-400">
                      Deposit #{idx + 1} (Queue ID: <span className="text-slate-300">{dep.id.slice(0, 8)}...</span>)
                    </span>
                    <span className="text-emerald-400 font-bold">${parseFloat(dep.amount || '0').toFixed(2)} USDT</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2 text-[11px] bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            <div>
              <span className="text-slate-500 block text-[9px] uppercase">State Machine Status</span>
              <span className="font-bold text-purple-400">{selectedItemDetails.status}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px] uppercase">Gas Funding Status</span>
              <span className="font-bold text-blue-400">{selectedItemDetails.gasStatus}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px] uppercase">Retry Attempts</span>
              <span className="font-bold text-amber-400">{selectedItemDetails.attempts || 0} / 5</span>
            </div>
          </div>

          {(selectedItemDetails.status === 'WAITING_SWEEP_CONFIRMATION' || selectedItemDetails.status === 'WAITING_GAS_CONFIRMATION') && (
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 text-[11px]">
              <span className="text-slate-500 block text-[9px] uppercase">On-Chain Confirmations</span>
              <span className="font-bold text-cyan-400">
                {selectedItemDetails.confirmations ?? 0} / {selectedItemDetails.requiredConfirmations ?? '—'}
              </span>
            </div>
          )}

          {selectedItemDetails.gasTxHash && (
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 text-[11px]">
              <span className="text-slate-500 block text-[9px] uppercase">Gas Funding Tx Hash</span>
              <span className="font-bold text-blue-400 break-all">{selectedItemDetails.gasTxHash}</span>
            </div>
          )}

          {selectedItemDetails.sweepTxHash && (
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 text-[11px]">
              <span className="text-slate-500 block text-[9px] uppercase">Sweep Tx Hash</span>
              <span className="font-bold text-emerald-400 break-all">{selectedItemDetails.sweepTxHash}</span>
            </div>
          )}

          {selectedItemDetails.errorMessage && (
            <div className="bg-rose-950/30 p-3 rounded-lg border border-rose-800 text-[11px]">
              <span className="text-rose-400 block text-[9px] uppercase font-bold">Last Error Message</span>
              <span className="text-rose-300 break-all">{selectedItemDetails.errorMessage}</span>
            </div>
          )}

          <div className="text-[10px] text-slate-500 flex justify-between pt-1">
            <span>Created: {new Date(selectedItemDetails.createdAt).toLocaleString()}</span>
            <span>Updated: {new Date(selectedItemDetails.updatedAt).toLocaleString()}</span>
          </div>
        </div>
        <div className="p-3 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-bold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
