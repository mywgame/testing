/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Copy, Fuel } from 'lucide-react';
import { Card, Badge } from '../../ui/index.ts';
import { DepositAddress, TreasuryComponentProps } from './TreasuryTypes.ts';

interface PermanentAddressesTableProps extends TreasuryComponentProps {
  depositAddresses: DepositAddress[];
  handleSweepAddress: (id: string) => void;
  sweepingAddressId: string | null;
  handleCollectGas?: (id: string) => void;
  collectingGasAddressId?: string | null;
  handleCollectAllGas?: () => void;
  collectingAllGas?: boolean;
  selectedNetwork?: string;
  totalUserGas?: string;
}

const formatBalance = (rawAmount: string | number | undefined): string => {
  const value = parseFloat(String(rawAmount ?? '0'));
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const getGasSymbol = (network?: string): string => {
  const net = (network || '').toUpperCase();
  if (net.includes('BEP20') || net.includes('BSC')) return 'BNB';
  if (net.includes('POLYGON') || net.includes('MATIC')) return 'POL';
  if (net.includes('TRC20') || net.includes('TRON')) return 'TRX';
  return 'GAS';
};

const formatGas = (rawAmount: string | number | undefined, network?: string): string => {
  const val = parseFloat(String(rawAmount ?? '0'));
  const symbol = getGasSymbol(network);
  const decimals = symbol === 'TRX' ? 2 : 4;
  return `${val.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: 6 })} ${symbol}`;
};

const isGasCollectible = (rawAmount: string | number | undefined): boolean => {
  const val = parseFloat(String(rawAmount ?? '0'));
  return val > 0;
};

export const PermanentAddressesTable: React.FC<PermanentAddressesTableProps> = ({
  depositAddresses,
  handleSweepAddress,
  sweepingAddressId,
  handleCollectGas,
  collectingGasAddressId,
  handleCollectAllGas,
  collectingAllGas = false,
  selectedNetwork = 'USDT_BEP20',
  totalUserGas = '0.00000000',
  isDark,
  t,
}) => {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const gasSymbol = getGasSymbol(selectedNetwork);
  const totalGasFloat = parseFloat(totalUserGas || '0');

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <Card className={`p-0 overflow-hidden transition-all ${
      isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-gray-200/90 shadow-xs'
    }`}>
      <div className={`p-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${
        isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-gray-50/90 border-gray-200'
      }`}>
        <div>
          <h3 className="text-xs font-bold font-mono tracking-wider uppercase text-gray-900 dark:text-white">
            User Permanent Deposit Addresses
          </h3>
          <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mt-1">
            Real-time on-chain funds and idle native gas currently resting on permanent deposit addresses.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
          <Badge color={depositAddresses.length > 0 ? 'emerald' : 'amber'}>
            {depositAddresses.length} Addresses Registered
          </Badge>
          {totalGasFloat > 0 && (
            <Badge color="cyan">
              Idle Gas: {formatGas(totalUserGas, selectedNetwork)}
            </Badge>
          )}
          {handleCollectAllGas && (
            <button
              onClick={handleCollectAllGas}
              disabled={collectingAllGas || totalGasFloat <= 0}
              className={`text-xs px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                collectingAllGas || totalGasFloat <= 0
                  ? 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-gray-600 border border-transparent cursor-not-allowed opacity-50'
                  : 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-500/25 shadow-xs'
              }`}
              title="Reclaim all unused native gas from user deposit addresses back to Hot Wallet"
            >
              <Fuel className="w-3.5 h-3.5" />
              {collectingAllGas ? 'Collecting All Gas...' : 'Collect All Gas'}
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className={`text-xs font-mono font-bold tracking-wider uppercase border-b ${
              isDark ? 'bg-slate-900/80 text-gray-400 border-slate-800' : 'bg-gray-100 text-gray-700 border-gray-200'
            }`}>
              <th className="py-3 px-4">User</th>
              <th className="py-3 px-4">Deposit Address</th>
              <th className="py-3 px-4 text-right">USDT Balance (On-Chain)</th>
              <th className="py-3 px-4 text-right">Native Gas ({gasSymbol})</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className={`divide-y text-xs font-mono ${
            isDark ? 'divide-slate-800/80' : 'divide-gray-200'
          }`}>
            {depositAddresses.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-gray-500 dark:text-gray-400 text-xs font-medium font-sans">
                  No permanent deposit addresses registered yet for this network.
                </td>
              </tr>
            ) : (
              depositAddresses.map((addr) => {
                const balFloat = parseFloat(addr.onChainBalance || '0');
                const nativeGasFloat = parseFloat(addr.nativeGasBalance || '0');
                const canCollect = isGasCollectible(addr.nativeGasBalance);
                const isCollectingThis = collectingGasAddressId === addr.id;
                const isSweepingThis = sweepingAddressId === addr.id;

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
                    <td className="py-3 px-4 text-right font-mono text-xs">
                      <span className={`font-semibold ${
                        nativeGasFloat > 0
                          ? 'text-cyan-600 dark:text-cyan-400'
                          : 'text-gray-400 dark:text-gray-500'
                      }`}>
                        {formatGas(addr.nativeGasBalance, addr.network)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* Sweep USDT Action */}
                        <button
                          onClick={() => handleSweepAddress(addr.id)}
                          disabled={balFloat <= 0 || isSweepingThis}
                          className={`text-xs px-2.5 py-1.5 rounded-lg transition-colors font-bold cursor-pointer ${
                            balFloat <= 0
                              ? 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-gray-600 border border-transparent cursor-not-allowed opacity-50'
                              : 'bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-500/25 shadow-xs'
                          }`}
                          title={balFloat <= 0 ? 'No USDT balance to sweep' : 'Sweep USDT to Hot Wallet'}
                        >
                          {isSweepingThis ? 'Sweeping...' : 'Sweep USDT'}
                        </button>

                        {/* Collect Native Gas Action */}
                        {handleCollectGas && (
                          <button
                            onClick={() => handleCollectGas(addr.id)}
                            disabled={!canCollect || isCollectingThis}
                            className={`text-xs px-2.5 py-1.5 rounded-lg transition-colors font-bold flex items-center gap-1 cursor-pointer ${
                              !canCollect
                                ? 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-gray-600 border border-transparent cursor-not-allowed opacity-50'
                                : 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-500/25 shadow-xs'
                            }`}
                            title={
                              !canCollect
                                ? 'Native gas balance is 0.00'
                                : `Reclaim unused ${gasSymbol} gas back to Hot Wallet`
                            }
                          >
                            <Fuel className="w-3 h-3" />
                            {isCollectingThis ? 'Collecting...' : 'Collect Gas'}
                          </button>
                        )}
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

