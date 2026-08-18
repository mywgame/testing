/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Mail, Copy, Check, ChevronDown, ShieldCheck } from 'lucide-react';
import { useTheme } from '../../../hooks/useTheme.ts';

export const SupportInfo: React.FC = () => {
  const { t, isDark } = useTheme();
  const [copied, setCopied] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const supportEmail = 'support@metafirm.app';

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(supportEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const faqs = [
    {
      q: 'How long does it take to verify a deposit?',
      a: 'Deposits are monitored and confirmed automatically by the blockchain networks. Most confirmation cycles take between 2 to 10 minutes depending on network congestion.',
    },
    {
      q: 'Why did my VIP qualification status change?',
      a: 'VIP status calculations are active. If your main wallet balance falls below the tier threshold, or if your network referrals no longer satisfy team volume parameters, your VIP level adjusts to the highest qualified level immediately.',
    },
    {
      q: 'Are withdrawals processed instantly?',
      a: 'To guarantee asset integrity and security compliance, every withdrawal request undergoes safety checks by our finance department. The standard processing window for MetaFirm withdrawals is up to 72 hours.',
    },
  ];

  const handleToggleFaq = (index: number) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="space-y-4 text-left" id="support-info-cards">
      {/* 1. Direct Email Assistance Glass Card */}
      <div
        className={`p-5 rounded-3xl border transition-all shadow-xl ${
          isDark
            ? 'bg-[#10142e]/95 border-purple-500/20 shadow-purple-950/40'
            : 'bg-white border-purple-100 shadow-purple-900/10'
        } space-y-3`}
      >
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-900/20">
            <Mail className="w-4 h-4 text-white" />
          </div>
          <h4 className={`text-sm font-bold font-sans ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Direct Assistance
          </h4>
        </div>
        <p className={`text-xs font-sans ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          For administrative or custom account inquiries, reach our direct desk.
        </p>
        <div
          className={`p-3 rounded-2xl border flex items-center justify-between gap-4 ${
            isDark
              ? 'bg-[#0a0d24] border-white/10'
              : 'bg-slate-50 border-slate-200'
          }`}
        >
          <span
            className={`text-xs font-mono font-semibold truncate ${
              isDark ? 'text-purple-300' : 'text-purple-700'
            }`}
          >
            {supportEmail}
          </span>
          <div className="flex items-center space-x-1 shrink-0">
            <button
              onClick={handleCopyEmail}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                copied
                  ? 'text-emerald-400'
                  : isDark
                  ? 'text-slate-400 hover:text-white hover:bg-white/10'
                  : 'text-slate-500 hover:text-purple-600 hover:bg-purple-50'
              }`}
              title="Copy email address"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
            <a
              href={`mailto:${supportEmail}`}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isDark
                  ? 'text-slate-400 hover:text-white hover:bg-white/10'
                  : 'text-slate-500 hover:text-purple-600 hover:bg-purple-50'
              }`}
              title="Open default email application"
            >
              <Mail className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* 2. Clean Glass Security Notice with Purple-Indigo Accent (No Yellow) */}
      <div
        className={`p-4.5 rounded-3xl border backdrop-blur-xl flex items-start space-x-3.5 shadow-lg transition-all ${
          isDark
            ? 'bg-gradient-to-r from-purple-950/40 to-indigo-950/30 border-purple-500/30 shadow-purple-950/30'
            : 'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200 shadow-purple-900/5'
        }`}
      >
        <div className="p-2 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shrink-0 mt-0.5 shadow-md shadow-purple-900/30">
          <ShieldCheck className="w-4 h-4 text-white" />
        </div>
        <div className="space-y-1 text-left">
          <h5
            className={`text-xs font-bold uppercase tracking-wider ${
              isDark ? 'text-purple-300' : 'text-purple-800'
            }`}
          >
            Security Notice
          </h5>
          <p
            className={`text-xs leading-relaxed font-sans font-medium ${
              isDark ? 'text-slate-200' : 'text-slate-700'
            }`}
          >
            MetaFirm Support will <span className="font-bold underline decoration-purple-400">never</span> ask you for your private keys, seed phrases, or login credentials.
          </p>
        </div>
      </div>

      {/* 3. Accordion-style Frequently Asked Questions (Clean Glass) */}
      <div
        className={`p-5 rounded-3xl border transition-all shadow-xl ${
          isDark
            ? 'bg-[#10142e]/95 border-purple-500/20 shadow-purple-950/40'
            : 'bg-white border-purple-100 shadow-purple-900/10'
        } space-y-3`}
      >
        <h4 className={`text-xs font-bold font-sans uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Frequently Asked Questions
        </h4>
        <div className="space-y-2">
          {faqs.map((faq, i) => {
            const isOpen = expandedIndex === i;
            return (
              <div
                key={i}
                className={`border rounded-2xl overflow-hidden transition-all duration-200 ${
                  isOpen
                    ? isDark
                      ? 'border-purple-500/40 bg-purple-950/20 shadow-md shadow-purple-950/20'
                      : 'border-purple-300 bg-purple-50/50 shadow-xs'
                    : isDark
                    ? 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05]'
                    : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100'
                }`}
              >
                {/* Accordion Toggle Header */}
                <button
                  type="button"
                  onClick={() => handleToggleFaq(i)}
                  className="w-full p-3.5 flex items-center justify-between text-left cursor-pointer transition-colors"
                >
                  <span
                    className={`text-xs sm:text-sm font-semibold pr-2 leading-relaxed ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                      isOpen
                        ? 'rotate-180 text-purple-400'
                        : isDark
                        ? 'text-slate-400'
                        : 'text-slate-500'
                    }`}
                  />
                </button>

                {/* Accordion Collapsible Panel */}
                <div
                  className={`transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
                  }`}
                >
                  <div
                    className={`px-3.5 pb-3.5 pt-1 text-xs sm:text-sm leading-relaxed font-sans ${
                      isDark ? 'text-slate-300' : 'text-slate-700'
                    }`}
                  >
                    {faq.a}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
