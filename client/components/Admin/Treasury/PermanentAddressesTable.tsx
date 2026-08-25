/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Copy } from 'lucide-react';
import { Card, Badge } from '../../ui/index.ts';
import { DepositAddress, TreasuryComponentProps } from './TreasuryTypes.ts';

interface PermanentAddressesTableProps extends TreasuryComponentProps {
  depositAddresses: DepositAddress[];
  handleSweepAddress: (id: string) => void;
  sweepingAddressId: string | null;
}

const formatBalance = (rawAmount: string | number | undefined): string => {
  const value = parseFloat(String(rawAmount ?? '0'));
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const PermanentAddressesTable: React.FC<PermanentAddressesTableProps> = ({
  depositAddresses,
  handleSweepAddress,
  sweepingAddressId,
  isDark,
  t,
}) => {
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <Card className={`p-0 overflow-hidden transition-all ${
      isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-gray-200/90 shadow-xs'
    }`}>
      <div className={`p-4 border-b flex justify-between items-center ${
        isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-gray-50/90 border-gray-200'
      }`}>
        <div>
          <h3 className="text-xs font-bold font-mono tracking-wider uppercase text-gray-900 dark:text-white">
            User Permanent Deposit Addresses
          </h3>
          <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mt-1">
            Real-time on-chain funds currently resting on permanent deposit addresses.
          </p>
        </div>
        <Badge color={depositAddresses.length > 0 ? 'emerald' : 'amber'}>
          {depositAddresses.length} Addresses Registered
        </Badge>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className={`text-xs font-mono font-bold tracking-wider uppercase border-b ${
              isDark ? 'bg-slate-900/80 text-gray-400 border-slate-800' : 'bg-gray-100 text-gray-700 border-gray-200'
            }`}>
              <th className="py-3 px-4">User</th>
              <th className="py-3 px-4">Deposit Address</th>
              <th className="py-3 px-4 text-right">Balance Rest (On-Chain)</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className={`divide-y text-xs font-mono ${
            isDark ? 'divide-slate-800/80' : 'divide-gray-200'
          }`}>
            {depositAddresses.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-10 text-center text-gray-500 dark:text-gray-400 text-xs font-medium font-sans">
                  No permanent deposit addresses registered yet for this network.
                </td>
              </tr>
            ) : (
              depositAddresses.map((addr) => {
                const balFloat = parseFloat(addr.onChainBalance || '0');
                return (
                  <tr key={addr.id} className={`transition-colors ${
                    isDark ? 'hover:bg-slate-800/40' : 'hover:bg-gray-50/80'
                  }`}>
                    <td className="py-3 px-4">
                      <div className="flex flex-col font-sans">
                        <span className="text-xs text-blue-600 dark:text-blue-400 font-bold font-mono">
                          {addr.dsUserId || 'N/A'}
                        </span>
                        <span className="text-xs font-bold text-gray-900 dark:text-slate-100" title={addr.userName || ''}>
                          {addr.userName || 'N/A'}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px] font-medium" title={addr.userEmail || ''}>
                          {addr.userEmail || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-mono">
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{addr.address}</span>
                        <button
                          onClick={() => handleCopy(addr.address, addr.id)}
                          className="text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 p-0.5"
                          title="Copy address"
                        >
                          {copiedText === addr.id ? (
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold font-sans">Copied</span>
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-xs text-gray-900 dark:text-slate-100">
                      {formatBalance(addr.onChainBalance)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleSweepAddress(addr.id)}
                        disabled={balFloat <= 0 || sweepingAddressId === addr.id}
                        className={`text-xs px-3 py-1.5 rounded-lg transition-colors font-bold cursor-pointer ${
                          balFloat <= 0
                            ? 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-gray-600 border border-transparent cursor-not-allowed opacity-50'
                            : 'bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-500/25 shadow-xs'
                        }`}
                      >
                        {sweepingAddressId === addr.id ? 'Sweeping...' : 'Sweep Address'}
                      </button>
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
