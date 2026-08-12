/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Vault,
  ArrowRight,
  RefreshCw,
  Sliders,
  Check,
  AlertTriangle,
  FileText,
  Copy,
  ChevronRight,
  Info,
  Activity,
  UserCheck,
  Play,
  Pause,
  Clock,
  Coins,
  Trash2,
  Settings,
  HelpCircle,
  TrendingDown
} from 'lucide-react';
import { Card, Badge, Button } from '../ui/index.ts';
import { ThemeTokens } from '../ui/themeTokens.ts';
import { api } from '../../services/api.ts';
import { TreasuryOverviewCard } from './Treasury/TreasuryOverviewCard.tsx';
import { PermanentAddressesTable } from './Treasury/PermanentAddressesTable.tsx';
import { SweepQueueTable } from './Treasury/SweepQueueTable.tsx';
import { SweepAuditLogsTable } from './Treasury/SweepAuditLogsTable.tsx';
import { QueueItemDetailsModal } from './Treasury/QueueItemDetailsModal.tsx';

interface TreasuryViewProps {
  t: ThemeTokens;
  isDark: boolean;
}

interface SweepJob {
  id: string;
  network: string;
  sourceAddress: string;
  destinationAddress: string;
  sweepType: 'USER_TO_HOT' | 'HOT_TO_COLD';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  amount: string;
  txHash: string | null;
  errorMessage: string | null;
  attempts: number;
  createdAt: string;
}

interface DepositAddress {
  id: string;
  userId: string;
  network: string;
  address: string;
  onChainBalance: string;
}

interface SweepQueueItem {
  id: string;
  depositId: string;
  userId: string;
  depositAddress: string;
  network: string;
  amount: string;
  status: 'PENDING' | 'WAITING_DELAY' | 'WAITING_GAS' | 'GAS_FUNDING' | 'READY_TO_SWEEP' | 'SWEEPING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  gasStatus: 'LOW' | 'FUNDING_SENT' | 'OK' | 'FAILED';
  gasTxHash: string | null;
  sweepTxHash: string | null;
  errorMessage: string | null;
  attempts: number;
  eligibleAt: string;
  createdAt: string;
  updatedAt: string;
  userEmail: string;
  nativeGasBalance: string;
}

export const TreasuryView: React.FC<TreasuryViewProps> = ({ t, isDark }) => {
  const networks = ['USDT_BEP20', 'USDT_POLYGON', 'USDT_TRC20'];
  const [selectedNetwork, setSelectedNetwork] = useState(networks[0]);

  // General States
  const [config, setConfig] = useState<any>(null);
  const [liveHotBalance, setLiveHotBalance] = useState('0.00000000');
  const [liveColdBalance, setLiveColdBalance] = useState('0.00000000');
  const [totalPendingSweep, setTotalPendingSweep] = useState('0.00000000');
  const [liveHotNativeGas, setLiveHotNativeGas] = useState('0.00000000');
  const [totalUserGas, setTotalUserGas] = useState('0.00000000');
  const [depositAddresses, setDepositAddresses] = useState<DepositAddress[]>([]);
  const [jobs, setJobs] = useState<SweepJob[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Editable Sweep Config States
  const [sweepMode, setSweepMode] = useState<'AUTOMATIC' | 'MANUAL' | 'HYBRID'>('AUTOMATIC');
  const [sweepDelay, setSweepDelay] = useState<string>('IMMEDIATE');
  const [customDelayMinutes, setCustomDelayMinutes] = useState<number>(0);
  const [autoSweepThreshold, setAutoSweepThreshold] = useState('1.00000000');
  const [paused, setPaused] = useState<boolean>(false);

  // Sweep Queue States
  const [sweepQueueItems, setSweepQueueItems] = useState<SweepQueueItem[]>([]);
  const [selectedQueueIds, setSelectedQueueIds] = useState<string[]>([]);
  const [queueLoading, setQueueLoading] = useState(false);
  const [bulkProcessing, setBulkProcessing] = useState(false);

  // Form input
  const [sweepToColdAmount, setSweepToColdAmount] = useState('');

  // Processing indicators
  const [savingConfig, setSavingConfig] = useState(false);
  const [bulkSweeping, setBulkSweeping] = useState(false);
  const [coldSweeping, setColdSweeping] = useState(false);
  const [sweepingAddressId, setSweepingAddressId] = useState<string | null>(null);
  const [retryingJobId, setRetryingJobId] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Single queue item action states
  const [processingQueueId, setProcessingQueueId] = useState<string | null>(null);
  const [selectedItemDetails, setSelectedItemDetails] = useState<any | null>(null);

  const fetchQueueData = async (network: string) => {
    try {
      setQueueLoading(true);
      const res = await api.getTreasurySweepQueue(network);
      if (res.success && res.data) {
        setSweepQueueItems(res.data || []);
      }
    } catch (err) {
      console.error('[TreasuryView] Failed to load sweep queue:', err);
    } finally {
      setQueueLoading(false);
    }
  };

  const fetchTreasuryData = async (network: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getTreasuryOverview(network);
      if (!res.success) {
        throw new Error(res.error?.message || 'Failed to load treasury data');
      }
      if (res.data) {
        const payload = res.data;
        setConfig(payload.config);
        setLiveHotBalance(payload.liveHotBalance || '0.00000000');
        setLiveColdBalance(payload.liveColdBalance || '0.00000000');
        setTotalPendingSweep(payload.totalPendingSweep || '0.00000000');
        setLiveHotNativeGas(payload.liveHotNativeGas || '0.00000000');
        setTotalUserGas(payload.totalUserGas || '0.00000000');
        setDepositAddresses(payload.depositAddresses || []);
        setJobs(payload.jobs || []);

        // Sync inputs
        setSweepMode(payload.config?.sweepMode || 'AUTOMATIC');
        setSweepDelay(payload.config?.sweepDelay || 'IMMEDIATE');
        setCustomDelayMinutes(payload.config?.customDelayMinutes || 0);
        setAutoSweepThreshold(payload.config?.autoSweepThreshold || '1.00000000');
        setPaused(payload.config?.paused || false);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load treasury data');
    } finally {
      setLoading(false);
    }
  };

  const refreshAll = async () => {
    await Promise.all([
      fetchTreasuryData(selectedNetwork),
      fetchQueueData(selectedNetwork)
    ]);
  };

  useEffect(() => {
    refreshAll();
    setSelectedQueueIds([]);
  }, [selectedNetwork]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const showFeedback = (successMsg: string | null, errorMsg: string | null) => {
    if (successMsg) {
      setActionSuccess(successMsg);
      setTimeout(() => setActionSuccess(null), 5000);
    }
    if (errorMsg) {
      setActionError(errorMsg);
      setTimeout(() => setActionError(null), 5000);
    }
  };

  // 1. Update Comprehensive Sweep Rules
  const handleSaveConfig = async () => {
    try {
      setSavingConfig(true);
      const res = await api.updateTreasurySweepMode({
        network: selectedNetwork,
        sweepMode,
        sweepDelay,
        customDelayMinutes: Number(customDelayMinutes),
        autoSweepThreshold,
        paused,
      });

      if (!res.success) throw new Error(res.error?.message || 'Failed to save sweep rules.');

      showFeedback('Sweep rules and configuration updated successfully!', null);
      refreshAll();
    } catch (err: any) {
      showFeedback(null, err.message);
    } finally {
      setSavingConfig(false);
    }
  };

  // 2. Pause / Resume Toggle
  const handlePauseToggle = async (targetPaused: boolean) => {
    try {
      setSavingConfig(true);
      const res = await api.updateTreasurySweepMode({
        network: selectedNetwork,
        paused: targetPaused,
      });

      if (!res.success) throw new Error(res.error?.message || 'Failed to toggle paused state.');

      setPaused(targetPaused);
      showFeedback(targetPaused ? 'Sweeps successfully paused!' : 'Sweeps successfully resumed!', null);
      refreshAll();
    } catch (err: any) {
      showFeedback(null, err.message);
    } finally {
      setSavingConfig(false);
    }
  };

  // 3. Manual Single User Address Sweep
  const handleSweepAddress = async (addressId: string) => {
    try {
      setSweepingAddressId(addressId);
      const res = await api.sweepUserDepositAddress(addressId);

      if (!res.success) throw new Error(res.error?.message || 'Address sweep failed.');

      showFeedback(`Sweep broadcasted to blockchain — awaiting on-chain confirmation. TxHash: ${res.data?.txHash || 'Submitted'}`, null);
      refreshAll();
    } catch (err: any) {
      showFeedback(null, err.message);
    } finally {
      setSweepingAddressId(null);
    }
  };

  // 4. Manual Bulk Sweep
  const handleBulkSweep = async () => {
    if (!window.confirm('Are you sure you want to sweep ALL user deposit addresses with a positive balance to the Hot Wallet?')) {
      return;
    }
    try {
      setBulkSweeping(true);
      const res = await api.sweepAllEligibleAddresses(selectedNetwork);

      if (!res.success) throw new Error(res.error?.message || 'Bulk sweep failed.');

      const runCount = res.data?.results?.length || 0;
      showFeedback(`Bulk sweep run triggered ${runCount} broadcast(s) — items are now awaiting on-chain confirmation.`, null);
      refreshAll();
    } catch (err: any) {
      showFeedback(null, err.message);
    } finally {
      setBulkSweeping(false);
    }
  };

  // 5. Hot to Cold Wallet Transfer
  const handleSweepHotToCold = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sweepToColdAmount || parseFloat(sweepToColdAmount) <= 0) {
      alert('Please specify a positive numeric transfer amount.');
      return;
    }
    try {
      setColdSweeping(true);
      const res = await api.sweepHotToCold(selectedNetwork, parseFloat(sweepToColdAmount).toFixed(8));

      if (!res.success) throw new Error(res.error?.message || 'Transfer to Cold Wallet failed.');

      showFeedback(`Transfer of ${sweepToColdAmount} USDT to Cold Storage broadcasted — awaiting on-chain confirmation. TxHash: ${res.data?.txHash || 'Submitted'}`, null);
      setSweepToColdAmount('');
      refreshAll();
    } catch (err: any) {
      showFeedback(null, err.message);
    } finally {
      setColdSweeping(false);
    }
  };

  // 6. Retry Failed Sweep Job
  const handleRetryJob = async (jobId: string) => {
    try {
      setRetryingJobId(jobId);
      const res = await api.retrySweepJob(jobId);

      if (!res.success) throw new Error(res.error?.message || 'Failed to retry sweep job.');

      showFeedback(`Sweep job retried successfully! TxHash: ${res.data?.txHash || 'Submitted'}`, null);
      refreshAll();
    } catch (err: any) {
      showFeedback(null, err.message);
    } finally {
      setRetryingJobId(null);
    }
  };

  // 7. Single Sweep Queue: Fund Gas
  const handleQueueFundGas = async (itemId: string) => {
    try {
      setProcessingQueueId(itemId);
      const res = await api.fundGasQueueItem(itemId);
      if (!res.success) throw new Error(res.error?.message || 'Gas funding failed.');

      showFeedback(`Gas funding sent successfully! TxHash: ${res.data?.txHash || 'Submitted'}`, null);
      refreshAll();
    } catch (err: any) {
      showFeedback(null, err.message);
    } finally {
      setProcessingQueueId(null);
    }
  };

  // 8. Single Sweep Queue: Execute Sweep
  const handleQueueSweep = async (itemId: string) => {
    try {
      setProcessingQueueId(itemId);
      const res = await api.sweepQueueItem(itemId);
      if (!res.success) throw new Error(res.error?.message || 'Sweep execution failed.');

      showFeedback(`Sweep transaction successfully broadcasted! TxHash: ${res.data?.txHash || 'Submitted'}`, null);
      refreshAll();
    } catch (err: any) {
      showFeedback(null, err.message);
    } finally {
      setProcessingQueueId(null);
    }
  };

  // 9. Single Sweep Queue: Cancel Item
  const handleQueueCancel = async (itemId: string) => {
    if (!window.confirm('Are you sure you want to cancel this sweep job? It will be permanently shelved.')) {
      return;
    }
    try {
      setProcessingQueueId(itemId);
      const res = await api.cancelQueueItem(itemId);
      if (!res.success) throw new Error(res.error?.message || 'Failed to cancel item.');

      showFeedback('Sweep job successfully shelved/cancelled.', null);
      refreshAll();
    } catch (err: any) {
      showFeedback(null, err.message);
    } finally {
      setProcessingQueueId(null);
    }
  };

  // 9b. Single Sweep Queue: Retry Item
  const handleQueueRetry = async (itemId: string) => {
    try {
      setProcessingQueueId(itemId);
      const res = await api.retrySweepQueueItem(itemId);
      if (!res.success) throw new Error(res.error?.message || 'Failed to retry queue item.');

      showFeedback('Sweep job successfully queued for retry!', null);
      refreshAll();
    } catch (err: any) {
      showFeedback(null, err.message);
    } finally {
      setProcessingQueueId(null);
    }
  };

  // 10. Bulk Queue Action
  const handleBulkQueueAction = async (action: 'FUND_GAS' | 'SWEEP' | 'FUND_AND_SWEEP') => {
    if (selectedQueueIds.length === 0) return;
    try {
      setBulkProcessing(true);
      const res = await api.bulkActionQueue(selectedQueueIds, action);
      if (!res.success) throw new Error(res.error?.message || 'Bulk execution failed.');

      showFeedback(`Bulk action completed! Verified: ${res.data?.results?.length || 0} transaction(s).`, null);
      setSelectedQueueIds([]);
      refreshAll();
    } catch (err: any) {
      showFeedback(null, err.message);
    } finally {
      setBulkProcessing(false);
    }
  };

  const handleSelectAllQueue = () => {
    const activeIds = sweepQueueItems
      .filter(item => item.status !== 'COMPLETED' && item.status !== 'CANCELLED')
      .map(item => item.id);

    if (selectedQueueIds.length === activeIds.length) {
      setSelectedQueueIds([]);
    } else {
      setSelectedQueueIds(activeIds);
    }
  };

  const handleSelectQueueItem = (id: string) => {
    if (selectedQueueIds.includes(id)) {
      setSelectedQueueIds(selectedQueueIds.filter(i => i !== id));
    } else {
      setSelectedQueueIds([...selectedQueueIds, id]);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Vault className="w-5 h-5 text-amber-500" />
            Treasury Sweep Management
          </h2>
          <p className={`text-xs mt-1 ${t.textSub}`}>
            Secure Hot/Cold wallet balances, customizable delays, manual overrides, and real-time gas status queues.
          </p>
        </div>
        <div className="flex gap-2">
          {paused ? (
            <button
              onClick={() => handlePauseToggle(false)}
              disabled={savingConfig}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 disabled:opacity-55"
            >
              <Play className="w-3.5 h-3.5" />
              Resume Auto Sweeping
            </button>
          ) : (
            <button
              onClick={() => handlePauseToggle(true)}
              disabled={savingConfig}
              className="bg-rose-600 hover:bg-rose-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 disabled:opacity-55"
            >
              <Pause className="w-3.5 h-3.5" />
              Pause Sweeps
            </button>
          )}
          <button
            onClick={refreshAll}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
              isDark ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
            disabled={loading}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Network Tabs Selector */}
      <div className="flex border-b border-gray-200/20 gap-2">
        {networks.map((net) => (
          <button
            key={net}
            onClick={() => setSelectedNetwork(net)}
            className={`px-4 py-2 text-xs font-semibold tracking-wide border-b-2 transition-all ${
              selectedNetwork === net
                ? 'border-blue-500 text-blue-500 font-bold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            {net.replace('USDT_', '')} Network
          </button>
        ))}
      </div>

      {/* Operation Feedback Toast */}
      {actionSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3 rounded-lg text-xs flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}
      {actionError && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-lg text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {loading && !config ? (
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-3" />
          <p className="text-xs text-gray-400">Querying on-chain balances and loading treasury logs...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-lg text-xs">
          <p className="font-semibold">Failed to fetch Treasury data for {selectedNetwork}:</p>
          <p className="mt-1">{error}</p>
        </div>
      ) : (
        <>
          {/* Key Metrics Grid */}
          <TreasuryOverviewCard
            t={t}
            isDark={isDark}
            liveHotBalance={liveHotBalance}
            liveColdBalance={liveColdBalance}
            totalPendingSweep={totalPendingSweep}
            liveHotNativeGas={liveHotNativeGas}
            totalUserGas={totalUserGas}
            selectedNetwork={selectedNetwork}
            hotAddress={config?.hotAddress || ''}
            coldAddress={config?.coldAddress || ''}
          />

          {/* Operational & Controls Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Configuration Panel */}
            <Card className="p-5 flex flex-col justify-between border-slate-800">
              <div>
                <h3 className="text-xs font-bold font-mono tracking-widest text-blue-400 uppercase flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5" />
                  Sweep Rules & Configuration
                </h3>
                <p className="text-[11px] text-gray-400 mt-1">
                  Adjust target configurations for on-chain sweeping, gas handling, and execution delays.
                </p>

                <div className="mt-5 space-y-4">
                  {/* Sweep Mode */}
                  <div>
                    <label className="text-xs font-semibold block mb-1">Sweep Mode</label>
                    <select
                      value={sweepMode}
                      onChange={(e: any) => setSweepMode(e.target.value)}
                      className={`px-3 py-1.5 rounded text-xs w-full border ${
                        isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-gray-50 border-gray-200 text-gray-900'
                      }`}
                    >
                      <option value="AUTOMATIC">Automatic (Autonomous sweeping and gas funding)</option>
                      <option value="MANUAL">Manual (All sweeps wait for admin trigger)</option>
                      <option value="HYBRID">Hybrid (Delay timer auto sweeps; otherwise manual)</option>
                    </select>
                  </div>

                  {/* Delay Config */}
                  {sweepMode !== 'MANUAL' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold block mb-1">Delay Setting</label>
                        <select
                          value={sweepDelay}
                          onChange={(e) => setSweepDelay(e.target.value)}
                          className={`px-3 py-1.5 rounded text-xs w-full border ${
                            isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-gray-50 border-gray-200 text-gray-900'
                          }`}
                        >
                          <option value="IMMEDIATE">Immediate</option>
                          <option value="1_HOUR">1 Hour</option>
                          <option value="6_HOURS">6 Hours</option>
                          <option value="24_HOURS">24 Hours</option>
                          <option value="3_DAYS">3 Days</option>
                          <option value="7_DAYS">7 Days</option>
                          <option value="CUSTOM">Custom Minutes</option>
                          <option value="MANUAL_ONLY">Manual Only</option>
                        </select>
                      </div>

                      {sweepDelay === 'CUSTOM' && (
                        <div>
                          <label className="text-xs font-semibold block mb-1">Minutes</label>
                          <input
                            type="number"
                            min="1"
                            value={customDelayMinutes}
                            onChange={(e) => setCustomDelayMinutes(Number(e.target.value))}
                            className={`px-3 py-1.5 rounded text-xs font-mono w-full border ${
                              isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-gray-50 border-gray-200 text-gray-900'
                            }`}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Threshold & Save */}
                  <div>
                    <label className="text-xs font-semibold block mb-1">
                      Minimum Sweep Threshold (USDT)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="0.1"
                        value={autoSweepThreshold}
                        onChange={(e) => setAutoSweepThreshold(e.target.value)}
                        className={`px-3 py-1.5 rounded text-xs font-mono w-full border ${
                          isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-gray-50 border-gray-200 text-gray-900'
                        }`}
                        placeholder="e.g. 1.00"
                      />
                      <button
                        onClick={handleSaveConfig}
                        disabled={savingConfig}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded text-xs font-semibold shrink-0 disabled:opacity-50"
                      >
                        {savingConfig ? 'Saving...' : 'Save Config'}
                      </button>
                    </div>
                    <span className="text-[9px] text-gray-500 mt-1 block">
                      Requires at least 0.00000001 precision. Deposits below this are logged but never auto-funded or swept.
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200/10 pt-4 mt-5">
                <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                  <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span>
                    Current blockchain: <strong className="text-white">{selectedNetwork.replace('USDT_', '')}</strong>. Rules execute in-memory inside SweepQueueProcessor.
                  </span>
                </div>
              </div>
            </Card>

            {/* Right: Sweeps & Transfers Trigger Panel */}
            <Card className="p-5 flex flex-col justify-between border-slate-800">
              <div>
                <h3 className="text-xs font-bold font-mono tracking-widest text-amber-500 uppercase flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  Manual Operations Console
                </h3>
                <p className="text-[11px] text-gray-400 mt-1">
                  Trigger manual overrides, bulk sweeps, or safely offload hot wallet liquidity to your cold storage.
                </p>

                <div className="mt-5 space-y-5">
                  {/* Bulk User Sweep Action */}
                  <div className="border border-slate-800 p-3 rounded bg-slate-900/40">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-xs font-semibold block text-slate-200">Force Sweep All Addresses</span>
                        <span className="text-[10px] text-gray-400 mt-0.5 block">
                          Triggers manual sweep operations for all registered addresses that currently hold a positive balance.
                        </span>
                      </div>
                      <button
                        onClick={handleBulkSweep}
                        disabled={bulkSweeping || parseFloat(totalPendingSweep) <= 0}
                        className="bg-amber-600 hover:bg-amber-500 text-white px-3 py-1.5 rounded text-xs font-semibold shrink-0 disabled:opacity-40"
                      >
                        {bulkSweeping ? 'Sweeping...' : 'Sweep All Now'}
                      </button>
                    </div>
                  </div>

                  {/* Sweep Hot to Cold form */}
                  <form onSubmit={handleSweepHotToCold} className="border border-slate-800 p-3 rounded bg-slate-900/40">
                    <span className="text-xs font-semibold block text-slate-200">Vault Transfer (Hot → Cold)</span>
                    <span className="text-[10px] text-gray-400 mt-0.5 block mb-2">
                      Transfer excess liquidity from Hot Wallet to cold storage securely.
                    </span>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="0.0001"
                        value={sweepToColdAmount}
                        onChange={(e) => setSweepToColdAmount(e.target.value)}
                        className={`px-3 py-1.5 rounded text-xs font-mono w-full border ${
                          isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-gray-50 border-gray-200 text-gray-900'
                        }`}
                        placeholder="Amount in USDT"
                        required
                      />
                      <button
                        type="submit"
                        disabled={coldSweeping || parseFloat(liveHotBalance) <= 0}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded text-xs font-semibold shrink-0 disabled:opacity-40 flex items-center gap-1"
                      >
                        {coldSweeping ? 'Transferring...' : 'Transfer to Cold'}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              <div className="border-t border-gray-200/10 pt-4 mt-5">
                <span className="text-[9px] text-gray-500 font-mono block text-center uppercase tracking-wider">
                  SECURE CRYPTOGRAPHIC PROTOCOLS • IDEMPOTENT BLOCKCHAIN SWEEPS
                </span>
              </div>
            </Card>
          </div>

          {/* SWEEP QUEUE STATE MACHINE DASHBOARD */}
          <SweepQueueTable
            t={t}
            isDark={isDark}
            sweepQueueItems={sweepQueueItems}
            queueLoading={queueLoading}
            fetchQueueData={fetchQueueData}
            selectedNetwork={selectedNetwork}
            selectedQueueIds={selectedQueueIds}
            handleSelectAllQueue={handleSelectAllQueue}
            handleToggleSelectQueue={handleSelectQueueItem}
            handleBulkQueueAction={handleBulkQueueAction}
            bulkProcessing={bulkProcessing}
            processingQueueId={processingQueueId}
            handleQueueFundGas={handleQueueFundGas}
            handleQueueSweep={handleQueueSweep}
            handleQueueRetry={handleQueueRetry}
            handleQueueCancel={handleQueueCancel}
            setSelectedItemDetails={setSelectedItemDetails}
            copiedText={copiedText}
            handleCopy={handleCopy}
          />

          {/* User Deposit Addresses Section */}
          <PermanentAddressesTable
            t={t}
            isDark={isDark}
            depositAddresses={depositAddresses}
            handleSweepAddress={handleSweepAddress}
            sweepingAddressId={sweepingAddressId}
          />

          {/* Sweep History & Job Logs */}
          <SweepAuditLogsTable
            t={t}
            isDark={isDark}
            jobs={jobs}
            handleRetryJob={handleRetryJob}
            retryingJobId={retryingJobId}
          />

          {/* Queue Item Details Modal */}
          <QueueItemDetailsModal
            selectedItemDetails={selectedItemDetails}
            onClose={() => setSelectedItemDetails(null)}
          />
        </>
      )}
    </div>
  );
};
export default TreasuryView;
