/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Copy } from 'lucide-react';
import { Card } from '../../ui/index.ts';
import { TreasuryComponentProps } from './TreasuryTypes.ts';

interface TreasuryOverviewCardProps extends TreasuryComponentProps {
  liveHotBalance: string;
  liveColdBalance: string;
  totalPendingSweep: string;
  liveHotNativeGas: string;
  totalUserGas: string;
  selectedNetwork: string;
  hotAddress: string;
  coldAddress: string;
}

export const TreasuryOverviewCard: React.FC<TreasuryOverviewCardProps> = ({
  t,
  liveHotBalance,
  liveColdBalance,
  totalPendingSweep,
  liveHotNativeGas,
  totalUserGas,
  selectedNetwork,
  hotAddress,
  coldAddress,
}) => {
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const nativeSymbol =
    selectedNetwork === 'USDT_BEP20' ? 'BNB' : selectedNetwork === 'USDT_POLYGON' ? 'POL' : 'TRX';

  const metrics = [
    {
      title: 'Hot Wallet Balance',
      value: `${parseFloat(liveHotBalance).toFixed(4)} USDT`,
      desc: 'Operates automated user withdrawals',
      address: hotAddress,
      label: 'hot',
    },
    {
      title: 'Cold Storage Balance',
      value: `${parseFloat(liveColdBalance).toFixed(4)} USDT`,
      desc: 'Deep institutional cold security',
      address: coldAddress,
      label: 'cold',
    },
    {
      title: 'Awaiting Sweep',
      value: `${parseFloat(totalPendingSweep).toFixed(4)} USDT`,
      desc: 'On-chain user deposit balance',
      descColor: 'text-amber-500',
    },
    {
      title: 'Total Network Pool',
      value: `${(
        parseFloat(liveHotBalance) +
        parseFloat(liveColdBalance) +
        parseFloat(totalPendingSweep)
      ).toFixed(4)} USDT`,
      desc: 'Hot + Cold + Pending Sweep combined',
      descColor: 'text-blue-500',
    },
    {
      title: 'Hot Wallet Native Gas',
      value: `${parseFloat(liveHotNativeGas).toFixed(4)} ${nativeSymbol}`,
      desc: 'Live hot wallet gas reserve',
      descColor: 'text-emerald-400',
      address: hotAddress,
      label: 'hotGas',
    },
    {
      title: 'Total User Gas Balance',
      value: `${parseFloat(totalUserGas).toFixed(4)} ${nativeSymbol}`,
      desc: 'Sum across deposit wallets',
      descColor: 'text-purple-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {metrics.map((metric) => (
        <Card key={metric.title} className="p-3.5 flex flex-col justify-between min-h-[110px] relative border-slate-800">
          <div>
            <span className={`text-[9px] font-mono font-bold tracking-wider ${t.textMuted} uppercase`}>
              {metric.title}
            </span>
            <div className="text-base font-extrabold font-display leading-tight mt-1">
              {metric.value}
            </div>
          </div>
          <div className="mt-2 text-[10px] text-gray-400 font-medium">
            {metric.desc}
            {metric.address && (
              <div className="flex items-center gap-1 mt-1 font-mono text-[9px] text-gray-500 bg-slate-900/50 p-1 rounded border border-slate-800">
                <span className="truncate max-w-[100px]">{metric.address}</span>
                <button
                  onClick={() => handleCopy(metric.address, metric.label)}
                  className="text-blue-400 hover:text-blue-300 ml-auto shrink-0"
                >
                  {copiedText === metric.label ? 'Copied' : <Copy className="w-3 h-3" />}
                </button>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};
