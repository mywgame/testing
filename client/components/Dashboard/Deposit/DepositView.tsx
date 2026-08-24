/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Wallet, Check, Copy, History, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../../../hooks/useTheme.ts';
import { useAuth } from '../../../hooks/useAuth.ts';
import { DashboardLayout } from '../Layout/DashboardLayout.tsx';
import { DashboardData } from '../../../types/index.ts';
import QRCode from 'qrcode';

import { api } from '../../../services/api.ts';
import { getApiUrl } from '../../../services/apiConfig.ts';
import { formatDateTime } from '../../../utils/dateFormatter.ts';

interface DepositViewProps {
  dashboardData: DashboardData | null;
  showToast: (msg: string) => void;
  onBack: () => void;
  onRefresh?: () => Promise<void>;
  onDepositSuccess?: (info: { amount: string; network: string }) => void;
}

export const DepositView: React.FC<DepositViewProps> = ({
  dashboardData,
  showToast,
  onBack,
  onRefresh,
  onDepositSuccess,
}) => {
  const { t } = useTheme();
  const { token } = useAuth();
  const [depositNetwork, setDepositNetwork] = useState('USDT_BEP20');
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  // Real Deposit History state
  const [depositHistory, setDepositHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Auto-verification form states
  const [txHash, setTxHash] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [verifySuccess, setVerifySuccess] = useState('');

  // Address generation/retrieval states
  const [localAddresses, setLocalAddresses] = useState<Record<string, string>>({});
  const [generatingAddress, setGeneratingAddress] = useState(false);
  const [addressGenError, setAddressGenError] = useState('');

  // Fetch real deposit history
  const fetchDepositHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await api.getUserDeposits();
      if (res.success && Array.isArray(res.data)) {
        setDepositHistory(res.data);
      }
    } catch (err) {
      console.error('Failed to load user deposit history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchDepositHistory();
  }, []);

  // Sync existing deposit addresses on mount/update
  useEffect(() => {
    if (dashboardData?.depositAddresses) {
      const initialMap: Record<string, string> = {};
      dashboardData.depositAddresses.forEach(da => {
        initialMap[da.network] = da.address;
      });
      setLocalAddresses(prev => ({ ...initialMap, ...prev }));
    }
  }, [dashboardData]);

  const currentAddress = localAddresses[depositNetwork] || '';

  // QR Code generation triggers when depositNetwork or currentAddress changes
  useEffect(() => {
    if (currentAddress) {
      QRCode.toDataURL(currentAddress, { width: 250, margin: 2 })
        .then(url => setQrCodeUrl(url))
        .catch(err => console.error('Local QR Code gen error:', err));
    } else {
      setQrCodeUrl('');
    }
  }, [depositNetwork, currentAddress]);

  const handleGenerateAddress = async () => {
    if (generatingAddress) return;
    setGeneratingAddress(true);
    setAddressGenError('');
    try {
      const res = await fetch(getApiUrl('/users/deposits/address'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ network: depositNetwork })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || data.message || 'Failed to generate deposit address. Please try again.');
      }
      
      const newAddress = data.data.address;
      setLocalAddresses(prev => ({
        ...prev,
        [depositNetwork]: newAddress
      }));
      showToast('Deposit address successfully generated!');
    } catch (err: any) {
      const msg = err.message || 'Error generating deposit address.';
      setAddressGenError(msg);
      showToast(msg);
    } finally {
      setGeneratingAddress(false);
    }
  };

  const handleCopyWalletAddress = () => {
    if (!currentAddress) return;
    navigator.clipboard.writeText(currentAddress);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleCopyTxHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    showToast('Transaction Hash copied to clipboard!');
  };

  const handleVerifyTx = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txHash.trim()) return;

    setVerifying(true);
    setVerifyError('');
    setVerifySuccess('');

    try {
      const res = await fetch(getApiUrl('/users/deposits/verify'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ txHash: txHash.trim(), network: depositNetwork })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Verification failed. Please ensure the Tx Hash is correct and not yet processed.');
      }

      setVerifySuccess('Deposit verified successfully! Your account balance has been updated.');
      setTxHash('');
      showToast('Deposit successfully verified!');
      
      const depositObj = data.data?.deposit || {};
      const verifiedAmount = depositObj.amount || '0';
      const verifiedNetwork = depositObj.network || depositNetwork;

      if (onDepositSuccess) {
        onDepositSuccess({ amount: verifiedAmount, network: verifiedNetwork });
      }

      fetchDepositHistory();
      if (onRefresh) {
        await onRefresh();
      }
    } catch (err: any) {
      setVerifyError(err.message || 'An error occurred during verification.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <DashboardLayout
      title="USDT Deposit Gateway"
      description="Please transfer USDT only to your assigned deposit address below. Your balance will be automatically credited after network confirmation."
      onBack={onBack}
    >
      <div className="space-y-6 max-w-xl" id="deposit-view-container">
        
        {/* Network Selection */}
        <div className="space-y-2">
          <span className={`text-[10px] font-mono font-bold uppercase tracking-wider block ${t.textMuted}`}>
            Select Blockchain Network
          </span>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {[
              { id: 'USDT_BEP20', label: 'USDT BEP20' },
              { id: 'USDT_POLYGON', label: 'USDT Polygon' },
              { id: 'USDT_TRC20', label: 'USDT TRC20' },
            ].map((net) => (
              <button
                key={net.id}
                type="button"
                onClick={() => setDepositNetwork(net.id)}
                className={`py-2 px-3 rounded-2xl text-xs font-mono border transition-all cursor-pointer text-center ${
                  depositNetwork === net.id
                    ? 'bg-cyan-500/15 text-cyan-500 border-cyan-500/30 font-bold'
                    : `${t.cardInner} ${t.textSub} border-transparent`
                }`}
              >
                {net.label}
              </button>
            ))}
          </div>
        </div>

        {!currentAddress ? (
          <div className={`rounded-2xl border p-6 text-center space-y-4 backdrop-blur-lg ${t.card}`}>
            <div className="mx-auto w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-cyan-500" />
            </div>
            <div className="space-y-1">
              <h4 className={`text-sm font-bold ${t.text}`}>No Address Generated</h4>
              <p className={`text-[11px] leading-relaxed max-w-sm mx-auto ${t.textMuted}`}>
                To deposit USDT via this network, you must first generate your permanent deposit address.
              </p>
            </div>
            {addressGenError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs text-center font-medium">
                {addressGenError}
              </div>
            )}
            <button
              type="button"
              disabled={generatingAddress}
              onClick={handleGenerateAddress}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90 transition-all cursor-pointer disabled:opacity-50 active:scale-95"
            >
              {generatingAddress ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
              <span>{generatingAddress ? 'Generating Address...' : 'Generate My Deposit Address'}</span>
            </button>
          </div>
        ) : (
          <>
            {/* QR Code Section */}
            <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-black/25 border border-white/5 space-y-2.5 max-w-xs mx-auto sm:mx-0">
              {qrCodeUrl ? (
                <img
                  src={qrCodeUrl}
                  alt="Deposit QR Code"
                  className="w-32 h-32 rounded-lg border-4 border-white shadow-md bg-white"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-32 h-32 rounded-lg border border-white/10 flex items-center justify-center bg-white/5">
                  <RefreshCw className="w-6 h-6 animate-spin text-cyan-500" />
                </div>
              )}
              <span className={`text-[9px] font-mono uppercase tracking-widest block ${t.textMuted}`}>
                Scan to transfer USDT
              </span>
            </div>

            {/* Deposit Address Box */}
            <div className="space-y-2">
              <span className={`text-[10px] font-mono font-bold uppercase tracking-wider block ${t.textMuted}`}>
                Your Assigned Deposit Address
              </span>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className={`p-3.5 rounded-2xl flex-1 flex items-center font-mono text-xs select-all overflow-hidden ${t.inset} ${t.text}`}>
                  <span className="truncate w-full block">{currentAddress}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyWalletAddress}
                  className="flex items-center justify-center gap-1.5 px-5 py-3 rounded-2xl text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-700 transition-all cursor-pointer active:scale-95 shrink-0"
                >
                  {copiedAddress ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedAddress ? 'Copied!' : 'Copy Address'}</span>
                </button>
              </div>
            </div>
          </>
        )}

        {/* Self-Service Instant Verification Gateway */}
        <div className={`rounded-2xl border p-5 backdrop-blur-lg space-y-4 ${t.card}`}>
          <div className="flex items-center gap-2">
            <Wallet className="w-4.5 h-4.5 text-cyan-500" />
            <h4 className={`text-xs font-bold uppercase tracking-wider ${t.text}`}>Instant Deposit Verification</h4>
          </div>
          <p className={`text-[11px] leading-relaxed ${t.textMuted}`}>
            Have you already completed your transfer? Paste your transaction hash below to manually trigger instant validation and credit your balance.
          </p>

          {verifySuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-500 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{verifySuccess}</span>
            </div>
          )}

          {verifyError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{verifyError}</span>
            </div>
          )}

          <form onSubmit={handleVerifyTx} className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Enter transaction hash (0x... or Tron Tx ID)"
              value={txHash}
              onChange={(e) => setTxHash(e.target.value.trim())}
              disabled={verifying}
              className={`p-3 rounded-2xl flex-1 font-mono text-xs border transition-all ${
                t.isDark
                  ? 'bg-white/5 border-white/10 text-white focus:border-cyan-500'
                  : 'bg-black/5 border-black/10 text-black focus:border-cyan-600'
              } outline-none`}
            />
            <button
              type="submit"
              disabled={verifying || !txHash.trim()}
              className="flex items-center justify-center gap-1.5 px-5 py-3 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90 disabled:opacity-40 transition-all cursor-pointer active:scale-95 shrink-0"
            >
              {verifying ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
              <span>{verifying ? 'Verifying…' : 'Verify Deposit'}</span>
            </button>
          </form>
        </div>

        {/* Deposit History */}
        <div className={`pt-6 border-t ${t.sep} space-y-3`}>
          <div className="flex items-center space-x-1.5 text-cyan-400">
            <History className="w-4 h-4" />
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Deposit History</span>
          </div>
          <div className="space-y-2.5">
            {loadingHistory ? (
              <div className="p-4 text-center text-xs text-gray-400">Loading deposit history...</div>
            ) : depositHistory.length === 0 ? (
              <div className="p-4 text-center text-xs text-gray-400 border border-white/5 rounded-2xl bg-white/5">
                No deposit history found.
              </div>
            ) : (
              depositHistory.map((item) => {
                const txHashVal = item.txHash || '';
                const formattedTime = formatDateTime(item.createdAt);
                return (
                  <div key={item.id} className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-2 text-[11px]">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-white">{item.network || 'USDT'}</span>
                      <span className="font-mono text-cyan-400 font-bold">{item.amount} USDT</span>
                    </div>
                    <div className="flex justify-between text-gray-400 text-[10px]">
                      <span title={`System Time: ${formattedTime.utcFull} (${formattedTime.timeZoneAbbr})`}>
                        {formattedTime.localDate}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded font-bold text-[9px] ${
                        item.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' :
                        item.status === 'FAILED' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] border-t border-white/5 pt-2 font-mono text-gray-500">
                      <span>REF: {item.referenceNumber || item.id.slice(0, 8)}</span>
                      {txHashVal ? (
                        <button
                          type="button"
                          onClick={() => handleCopyTxHash(txHashVal)}
                          className="hover:text-cyan-400 flex items-center gap-1 transition-colors cursor-pointer"
                          title="Click to copy Hash"
                        >
                          <span>{txHashVal.length > 14 ? `${txHashVal.slice(0, 8)}...${txHashVal.slice(-6)}` : txHashVal}</span>
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <span className="text-gray-600">Pending Tx</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default DepositView;
