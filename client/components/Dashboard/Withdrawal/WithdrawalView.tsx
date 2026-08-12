/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Check, Copy, History, Wallet } from 'lucide-react';
import { useTheme } from '../../../hooks/useTheme.ts';
import { useAuth } from '../../../hooks/useAuth.ts';
import { DashboardLayout } from '../Layout/DashboardLayout.tsx';
import { Input } from '../../ui/Inputs/index.tsx';
import { Button } from '../../ui/Buttons/index.tsx';
import { WithdrawalSuccessModal } from './WithdrawalSuccessModal.tsx';
import { getApiUrl } from '../../../services/apiConfig.ts';

interface WithdrawalViewProps {
  showToast: (msg: string) => void;
  onBack: () => void;
}

export const WithdrawalView: React.FC<WithdrawalViewProps> = ({
  showToast,
  onBack,
}) => {
  const { t } = useTheme();
  const { token } = useAuth();

  const [withdrawNetwork, setWithdrawNetwork] = useState('USDT_BEP20');
  const [selectedWithdrawAddress, setSelectedWithdrawAddress] = useState('');
  const [withdrawAmountState, setWithdrawAmountState] = useState('100');
  const [emailOtp, setEmailOtp] = useState('');
  const [googleAuth2fa, setGoogleAuth2fa] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [debugOtp, setDebugOtp] = useState<string | null>(null);

  const [verifiedAddresses, setVerifiedAddresses] = useState<Record<string, string[]>>({});
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [withdrawalsHistory, setWithdrawalsHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [submittedWithdrawalAmount, setSubmittedWithdrawalAmount] = useState<string | null>(null);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);

  const fetchWithdrawalAddresses = async () => {
    if (!token) return;
    setLoadingAddresses(true);
    try {
      const res = await fetch(getApiUrl('/users/security/withdrawal-addresses'), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const body = await res.json();
      if (res.ok && body.success && body.data) {
        setVerifiedAddresses(body.data);
      }
    } catch (err) {
      console.error('Failed to load verified withdrawal addresses:', err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const fetchWithdrawalsHistory = async () => {
    if (!token) return;
    setLoadingHistory(true);
    try {
      const res = await fetch(getApiUrl('/users/withdrawals'), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const body = await res.json();
      if (res.ok && body.success && body.data) {
        setWithdrawalsHistory(body.data);
      }
    } catch (err) {
      console.error('Failed to load withdrawals history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchWithdrawalAddresses();
    fetchWithdrawalsHistory();
  }, [token]);

  useEffect(() => {
    const list = verifiedAddresses[withdrawNetwork] || [];
    setSelectedWithdrawAddress(list[0] || '');
  }, [withdrawNetwork, verifiedAddresses]);

  const handleSendOtp = async () => {
    if (isSendingOtp) return;
    setIsSendingOtp(true);
    setDebugOtp(null);
    try {
      const res = await fetch(getApiUrl('/users/withdrawals/send-otp'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error?.message || 'Failed to dispatch verification OTP.');
      }
      if (body.success && body.data?.debugOtp) {
        setDebugOtp(body.data.debugOtp);
      }
      showToast('A verification code has been sent to your registered email address!');
    } catch (err: any) {
      showToast(err.message || 'Failed to send OTP.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleCopyTxHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    showToast('Transaction Hash copied to clipboard!');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWithdrawAddress) {
      showToast('Please select a verified withdrawal address.');
      return;
    }
    if (!withdrawAmountState || parseFloat(withdrawAmountState) <= 0) {
      showToast('Please specify a valid withdrawal amount.');
      return;
    }
    if (!emailOtp || emailOtp.length < 6) {
      showToast('Please provide a valid 6-digit Email OTP.');
      return;
    }
    if (!googleAuth2fa || googleAuth2fa.length < 6) {
      showToast('Please provide a valid 6-digit Google Authenticator code.');
      return;
    }

    try {
      const res = await fetch(getApiUrl('/users/withdrawals/request'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: withdrawAmountState,
          network: withdrawNetwork,
          walletAddress: selectedWithdrawAddress,
          emailOtp,
          googleAuth2fa,
        }),
      });

      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error?.message || 'Failed to submit withdrawal request.');
      }

      showToast('Withdrawal request submitted successfully for administrative review!');
      setSubmittedWithdrawalAmount(withdrawAmountState);
      setShowWithdrawalModal(true);
      setEmailOtp('');
      setGoogleAuth2fa('');
      setDebugOtp(null);
      fetchWithdrawalsHistory();
    } catch (err: any) {
      showToast(err.message || 'An error occurred during withdrawal submission.');
    }
  };

  return (
    <DashboardLayout
      title="Outbound Withdrawal"
      description="Please configure your transaction details to submit an outbound request. Every submission requires administrative verification and dual-factor validation."
      onBack={onBack}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="withdrawal-view-container">
        
        {/* Left Side: Withdrawal Form */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Network Selection */}
            <div className="space-y-1.5">
              <span className={`text-[10px] font-mono font-bold uppercase tracking-wider block ${t.textMuted}`}>
                Select Blockchain Network
              </span>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'USDT_BEP20', label: 'USDT BEP20' },
                  { id: 'USDT_POLYGON', label: 'USDT Polygon' },
                  { id: 'USDT_TRC20', label: 'USDT TRC20' },
                ].map((net) => (
                  <button
                    key={net.id}
                    type="button"
                    onClick={() => setWithdrawNetwork(net.id)}
                    className={`py-2 px-3 rounded-2xl text-xs font-mono border transition-all cursor-pointer text-center ${
                      withdrawNetwork === net.id
                        ? 'bg-amber-500/15 text-amber-500 border-amber-500/30 font-bold'
                        : `${t.cardInner} ${t.textSub} border-transparent`
                    }`}
                  >
                    {net.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Withdrawal Address Select */}
            <div className="space-y-1.5">
              <span className={`text-[10px] font-mono font-bold uppercase block ${t.textMuted}`}>
                Withdrawal Address
              </span>
              <select
                value={selectedWithdrawAddress}
                onChange={(e) => setSelectedWithdrawAddress(e.target.value)}
                className={`w-full rounded-2xl px-4 py-3 text-xs font-mono font-semibold outline-none transition-all ${t.inset} ${t.text} border border-white/10 ${t.isDark ? 'bg-black/40' : 'bg-gray-100'}`}
              >
                {(verifiedAddresses[withdrawNetwork] || []).map((addr) => (
                  <option key={addr} value={addr} className={`${t.isDark ? 'bg-[#0e1230] text-white' : 'bg-white text-gray-900'} font-mono text-xs`}>
                    {addr}
                  </option>
                ))}
              </select>
              {(verifiedAddresses[withdrawNetwork] || []).length > 0 ? (
                <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-sans mt-1">
                  <Check className="w-3.5 h-3.5 shrink-0" /> Verified Address from Profile
                </span>
              ) : (
                <span className="text-[11px] text-amber-500 flex items-center gap-1 font-sans mt-1">
                  ⚠️ No verified addresses found. Please add one in Security Settings.
                </span>
              )}
            </div>

            {/* Withdrawal Amount */}
            <Input
              label="Withdrawal Amount (USDT)"
              type="number"
              value={withdrawAmountState}
              onChange={(e) => setWithdrawAmountState(e.target.value)}
              required
            />

            {/* Email OTP Field */}
            <div className="space-y-1.5">
              <span className={`text-[10px] font-mono font-bold uppercase block ${t.textMuted}`}>
                Email One-Time Password (OTP)
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="6-digit Email OTP"
                  value={emailOtp}
                  onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  maxLength={6}
                  className={`flex-1 rounded-2xl px-4 py-2.5 text-xs font-mono outline-none border border-white/10 ${t.inset} ${t.text} ${t.isDark ? 'bg-black/40' : 'bg-gray-100'}`}
                />
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isSendingOtp}
                  className="px-4 py-2.5 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 disabled:opacity-50 cursor-pointer select-none"
                >
                  {isSendingOtp ? 'Sending...' : 'Send OTP'}
                </button>
              </div>
              {debugOtp && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex flex-col gap-1 text-[11px] font-mono mt-1.5">
                  <span className="text-amber-500 font-bold">[SANDBOX SIMULATION OTP]:</span>
                  <span className="text-lg tracking-widest text-center font-extrabold text-amber-400">{debugOtp}</span>
                </div>
              )}
            </div>

            {/* Google Authenticator code */}
            <div className="space-y-1.5">
              <span className={`text-[10px] font-mono font-bold uppercase block ${t.textMuted}`}>
                Google Authenticator (2FA) Code
              </span>
              <input
                type="text"
                placeholder="6-digit Authenticator Code"
                value={googleAuth2fa}
                onChange={(e) => setGoogleAuth2fa(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                maxLength={6}
                className={`w-full rounded-2xl px-4 py-3 text-xs font-mono outline-none border border-white/10 ${t.inset} ${t.text} ${t.isDark ? 'bg-black/40' : 'bg-gray-100'}`}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full bg-amber-600 hover:bg-amber-700 hover:shadow-amber-500/10 border-none py-3 font-sans font-extrabold uppercase tracking-wider text-xs cursor-pointer"
            >
              Submit Withdrawal Request
            </Button>
          </form>
        </div>

        {/* Right Side: Withdrawal History */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center space-x-1.5 text-amber-400">
            <History className="w-4 h-4" />
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">
              Withdrawal History
            </span>
          </div>
          <div className="space-y-3">
            {withdrawalsHistory.length > 0 ? (
              withdrawalsHistory.map((item) => (
                <div key={item.id} className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-2 text-[11px]">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-white">{item.network.replace('_', ' ')}</span>
                    <span className="font-mono text-amber-400 font-bold">{parseFloat(item.amount).toFixed(2)} USDT</span>
                  </div>
                  <div className="flex justify-between text-gray-400 text-[10px]">
                    <span>{new Date(item.createdAt).toLocaleString()}</span>
                    <span className={`px-1.5 py-0.5 rounded font-bold text-[9px] ${
                      item.status === 'PENDING'
                        ? 'bg-amber-500/10 text-amber-400'
                        : item.status === 'PROCESSING'
                        ? 'bg-blue-500/10 text-blue-400'
                        : item.status === 'COMPLETED'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {item.status === 'PENDING'
                        ? 'Waiting for Approval'
                        : item.status === 'PROCESSING'
                        ? 'Sending Funds'
                        : item.status === 'COMPLETED'
                        ? 'Withdrawal Successful'
                        : item.status === 'FAILED'
                        ? 'Withdrawal Failed'
                        : item.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] border-t border-white/5 pt-2 font-mono text-gray-500">
                    <span>TX: {item.reference}</span>
                    {item.txHash ? (
                      <button
                        type="button"
                        onClick={() => handleCopyTxHash(item.txHash)}
                        className="hover:text-amber-400 flex items-center gap-1 transition-colors cursor-pointer"
                        title="Click to copy Hash"
                      >
                        <span>{item.txHash.slice(0, 8)}...{item.txHash.slice(-6)}</span>
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span className="italic text-gray-600">Pending Blockchain Execution</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center rounded-2xl bg-white/5 border border-white/5 space-y-1">
                <span className="text-xs text-gray-400 block font-semibold">No withdrawals logged yet</span>
                <span className="text-[10px] text-gray-500 block">Once you submit a request and it's verified, it will appear here.</span>
              </div>
            )}
          </div>
        </div>

      </div>

      <WithdrawalSuccessModal
        isOpen={showWithdrawalModal}
        amount={submittedWithdrawalAmount || '0'}
        currency="USDT"
        onClose={() => setShowWithdrawalModal(false)}
      />
    </DashboardLayout>
  );
};

export default WithdrawalView;
