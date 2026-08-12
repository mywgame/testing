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
}) => {
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <Card className="p-0 overflow-hidden border-slate-800">
      <div className="p-4 border-b border-gray-200/10 bg-slate-900/40 flex justify-between items-center">
        <div>
          <h3 className="text-xs font-bold font-mono tracking-wider uppercase">
            User Permanent Deposit Addresses
          </h3>
          <p className="text-[10px] text-gray-400 mt-0.5">
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
            <tr className="bg-slate-900/20 text-[10px] font-mono tracking-wider uppercase text-gray-400 border-b border-gray-200/10">
              <th className="py-2.5 px-4">User</th>
              <th className="py-2.5 px-4">Deposit Address</th>
              <th className="py-2.5 px-4 text-right">Balance Rest (On-Chain)</th>
              <th className="py-2.5 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200/10 text-xs font-mono">
            {depositAddresses.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-gray-500 text-xs">
                  No permanent deposit addresses registered yet for this network.
                </td>
              </tr>
            ) : (
              depositAddresses.map((addr) => {
                const balFloat = parseFloat(addr.onChainBalance || '0');
                return (
                  <tr key={addr.id} className="hover:bg-slate-900/10">
                    <td className="py-2.5 px-4">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-blue-400 font-semibold font-mono">
                          {addr.dsUserId || 'N/A'}
                        </span>
                        <span className="text-[10px] font-bold text-slate-200" title={addr.userName || ''}>
                          {addr.userName || 'N/A'}
                        </span>
                        <span className="text-[9px] text-gray-400 truncate max-w-[140px]" title={addr.userEmail || ''}>
                          {addr.userEmail || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px]">{addr.address}</span>
                        <button
                          onClick={() => handleCopy(addr.address, addr.id)}
                          className="text-gray-500 hover:text-gray-300"
                        >
                          {copiedText === addr.id ? 'Copied' : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-right font-bold text-slate-100">
                      {formatBalance(addr.onChainBalance)}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <button
                        onClick={() => handleSweepAddress(addr.id)}
                        disabled={balFloat <= 0 || sweepingAddressId === addr.id}
                        className={`text-[10px] px-2.5 py-1 rounded transition-colors font-medium cursor-pointer ${
                          balFloat <= 0
                            ? 'bg-slate-900/60 text-gray-600 border border-transparent'
                            : 'bg-amber-600/20 border border-amber-600/40 text-amber-300 hover:bg-amber-600/30'
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
