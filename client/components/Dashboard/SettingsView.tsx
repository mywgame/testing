/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Card } from '../ui/Cards/index.tsx';
import { Button } from '../ui/Buttons/index.tsx';
import { Input, Select } from '../ui/Inputs/index.tsx';
import { Badge } from '../ui/Feedback/index.tsx';
import { Settings, Globe, Shield, Radio } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [lang, setLang] = useState('en');
  const [currency, setCurrency] = useState('usd');

  const langOpts = [
    { value: 'en', label: 'English (US) - Default' },
    { value: 'gb', label: 'English (UK)' },
    { value: 'de', label: 'Deutsch' },
    { value: 'jp', label: '日本語' },
  ];

  const currencyOpts = [
    { value: 'usd', label: 'USD ($) - Default Standard' },
    { value: 'eur', label: 'EUR (€)' },
    { value: 'gbp', label: 'GBP (£)' },
    { value: 'jpy', label: 'JPY (¥)' },
  ];

  return (
    <div className="space-y-6 text-left" id="settings-view-tab">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Core Settings left */}
        <Card hoverEffect={true} className="lg:col-span-8 space-y-6">
          <div className="space-y-0.5 pb-4 border-b border-gray-100">
            <h3 className="text-sm font-display font-extrabold text-gray-950 tracking-tight">
              Platform General Configurations
            </h3>
            <p className="text-xs text-gray-400 font-sans">
              Calibrate language localization, preferred fiat symbols, and display themes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Standard Language Localization"
              options={langOpts}
              value={lang}
              onChange={(e) => setLang(e.target.value)}
            />
            <Select
              label="Settlement Display Currency"
              options={currencyOpts}
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <Input
              label="Default Ledger Timeout (sec)"
              type="number"
              defaultValue="3600"
              className="bg-gray-50/20 border-gray-200"
            />
            <Input
              label="Maximum Trade Slip Boundary (%)"
              type="number"
              step="0.1"
              defaultValue="0.5"
              className="bg-gray-50/20 border-gray-200"
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-50">
            <Button variant="primary" size="md">
              Save Platform Settings
            </Button>
          </div>
        </Card>

        {/* API and Integration details right */}
        <div className="lg:col-span-4 space-y-6">
          <Card hoverEffect={true} className="space-y-4">
            <div className="flex items-center space-x-2 text-gray-950">
              <Shield className="w-4 h-4 text-blue-600" />
              <h4 className="text-sm font-display font-bold">API Access Tokens</h4>
            </div>
            <p className="text-xs text-gray-400 font-sans leading-relaxed">
              Read-only API access tokens to pull balances and transaction feeds directly into private spreadsheets.
            </p>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 font-mono text-[10px] text-gray-500 overflow-x-auto select-all">
              api_pk_live_83921...729ad12c
            </div>
            <Button variant="secondary" size="sm" className="w-full">
              Generate New Keys
            </Button>
          </Card>

          <Card hoverEffect={true} className="p-4 bg-emerald-50/20 border border-emerald-100/50 space-y-2">
            <div className="flex items-center space-x-2 text-emerald-800">
              <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
              <span className="text-xs font-bold font-display">Sovereign Vault Nodes</span>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed font-sans">
              All backend endpoints utilize secure clusters bound to standard ports.
            </p>
            <Badge variant="emerald">Healthy Connections</Badge>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default SettingsView;
