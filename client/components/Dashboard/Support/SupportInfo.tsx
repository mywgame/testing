/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Mail, Copy, Check, ChevronDown, ShieldAlert } from 'lucide-react';
import { useTheme } from '../../../hooks/useTheme.ts';

export const SupportInfo: React.FC = () => {
  const { t } = useTheme();
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
      a: 'To guarantee asset integrity and compliance, every withdrawal is evaluated manually by our finance team. Approvals are typically finalized in less than 6 hours.',
    },
  ];

  const handleToggleFaq = (index: number) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="space-y-4 text-left" id="support-info-cards">
      {/* 1. Simplified Direct Email Assistance */}
      <div className={`p-5 rounded-3xl border ${t.card} space-y-3`}>
        <div className="flex items-center space-x-2 text-cyan-600 dark:text-cyan-400">
          <Mail className="w-4 h-4 shrink-0" />
          <h4 className={`text-sm font-bold font-sans ${t.text}`}>Direct Assistance</h4>
        </div>
        <p className={`text-xs font-sans ${t.textSub}`}>
          For administrative or custom account inquiries, contact our desk.
        </p>
        <div className={`p-3 rounded-xl border flex items-center justify-between gap-4 ${
          t.isDark ? 'bg-black/20 border-white/5' : 'bg-black/5 border-black/5'
        }`}>
          <span className={`text-xs font-mono font-semibold truncate ${t.isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {supportEmail}
          </span>
          <div className="flex items-center space-x-1 shrink-0">
            <button
              onClick={handleCopyEmail}
              className={`p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer ${
                copied ? 'text-emerald-500' : 'text-gray-400 hover:text-cyan-500'
              }`}
              title="Copy email address"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <a
              href={`mailto:${supportEmail}`}
              className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 text-gray-400 hover:text-cyan-500 transition-colors cursor-pointer"
              title="Open default email application"
            >
              <Mail className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* 2. Security Notice */}
      <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-start space-x-2.5">
        <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <h5 className="text-[11px] font-bold text-amber-500 dark:text-amber-400 uppercase tracking-wider">Security Notice</h5>
          <p className="text-[11px] text-amber-700 dark:text-amber-500/80 leading-relaxed font-sans">
            Support will **never** ask you for your private keys, seed phrases, or login credentials.
          </p>
        </div>
      </div>

      {/* 3. Accordion-style Frequently Asked Questions */}
      <div className={`p-5 rounded-3xl border ${t.card} space-y-3`}>
        <h4 className={`text-xs font-bold font-sans uppercase tracking-wider ${t.textMuted}`}>
          Frequently Asked Questions
        </h4>
        <div className="space-y-2">
          {faqs.map((faq, i) => {
            const isOpen = expandedIndex === i;
            return (
              <div
                key={i}
                className={`border rounded-xl overflow-hidden transition-all duration-200 ${
                  isOpen
                    ? t.isDark
                      ? 'border-cyan-500/30 bg-white/3'
                      : 'border-cyan-500/20 bg-black/3'
                    : 'border-transparent hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                {/* Accordion Toggle Header */}
                <button
                  type="button"
                  onClick={() => handleToggleFaq(i)}
                  className="w-full p-3 flex items-center justify-between text-left cursor-pointer transition-colors"
                >
                  <span className={`text-xs font-semibold pr-2 leading-relaxed ${t.text}`}>
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 shrink-0 transition-transform duration-200 ${t.textMuted} ${
                      isOpen ? 'rotate-180 text-cyan-500 dark:text-cyan-400' : ''
                    }`}
                  />
                </button>

                {/* Accordion Collapsible Panel */}
                <div
                  className={`transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
                  }`}
                >
                  <div className={`px-3 pb-3 pt-1 text-[11px] sm:text-xs leading-normal font-sans ${t.textSub}`}>
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
