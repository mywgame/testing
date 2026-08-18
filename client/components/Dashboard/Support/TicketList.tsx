/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  MessageSquare,
  Calendar,
  ChevronRight,
  CheckCircle,
  Clock,
  XCircle,
  Headphones,
  CheckCheck,
} from 'lucide-react';
import { useTheme } from '../../../hooks/useTheme.ts';
import { SupportTicket } from './types.ts';
import { TicketChatView } from './TicketChatView.tsx';

interface TicketListProps {
  tickets: SupportTicket[];
  onReply: (ticketId: string, message: string) => Promise<void>;
  onClose: (ticketId: string) => Promise<void>;
}

export const TicketList: React.FC<TicketListProps> = ({ tickets, onReply, onClose }) => {
  const { isDark } = useTheme();
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);

  const activeTicket = tickets.find((t) => t.id === activeTicketId);

  // If a ticket is opened in chat view, show the full WhatsApp / Insta style conversation view
  if (activeTicket) {
    return (
      <TicketChatView
        ticket={activeTicket}
        onBack={() => setActiveTicketId(null)}
        onReply={onReply}
        onClose={onClose}
      />
    );
  }

  const getStatusBadge = (status: SupportTicket['status']) => {
    switch (status) {
      case 'Open':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Open</span>
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>In Progress</span>
          </span>
        );
      case 'Resolved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-green-500/15 text-green-400 border border-green-500/30">
            <CheckCircle className="w-3 h-3" />
            <span>Resolved</span>
          </span>
        );
      case 'Closed':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-500/15 text-slate-400 border border-slate-500/30">
            <XCircle className="w-3 h-3" />
            <span>Closed</span>
          </span>
        );
    }
  };

  return (
    <div
      className={`rounded-3xl border p-5 sm:p-6 text-left transition-all shadow-xl ${
        isDark
          ? 'bg-[#10142e]/95 border-purple-500/20 shadow-purple-950/40'
          : 'bg-white border-purple-100 shadow-purple-900/10'
      }`}
      id="ticket-list-section"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/5">
        <div>
          <h3 className={`text-lg font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            My Support Tickets
          </h3>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Select a ticket to open direct chat with MetaFirm Support Agent.
          </p>
        </div>
        <div
          className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
            isDark
              ? 'bg-purple-500/10 border-purple-500/30 text-purple-300'
              : 'bg-purple-50 border-purple-200 text-purple-700'
          }`}
        >
          {tickets.length} {tickets.length === 1 ? 'Ticket' : 'Tickets'}
        </div>
      </div>

      {tickets.length === 0 ? (
        <div
          className={`flex flex-col items-center justify-center py-12 text-center rounded-2xl border border-dashed mt-4 space-y-3 ${
            isDark ? 'border-white/10 bg-white/[0.02]' : 'border-slate-300 bg-slate-50'
          }`}
        >
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              isDark ? 'bg-white/5 text-slate-400' : 'bg-slate-200 text-slate-600'
            }`}
          >
            <MessageSquare className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-xs">
            <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              No Support Tickets Yet
            </p>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Submit a ticket on the left whenever you need assistance.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3 mt-4">
          {tickets.map((ticket) => {
            const lastReply = ticket.replies && ticket.replies.length > 0 ? ticket.replies[ticket.replies.length - 1] : null;
            const previewText = lastReply ? lastReply.message : ticket.description;

            return (
              <div
                key={ticket.id}
                onClick={() => setActiveTicketId(ticket.id)}
                className={`rounded-2xl border p-4 flex items-center gap-3.5 transition-all duration-200 cursor-pointer group select-none ${
                  isDark
                    ? 'border-white/10 bg-white/[0.03] hover:bg-white/[0.07] hover:border-purple-500/40 shadow-sm'
                    : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-purple-300 shadow-xs'
                }`}
                id={`ticket-row-${ticket.id}`}
              >
                {/* Agent Avatar */}
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-purple-900/20 group-hover:scale-105 transition-transform">
                    <Headphones className="w-6 h-6 text-white" />
                  </div>
                </div>

                {/* Ticket & Last Message Info */}
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`font-bold text-sm truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        MetaFirm Support Agent
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                          isDark ? 'bg-white/10 text-cyan-300' : 'bg-slate-100 text-cyan-800'
                        }`}
                      >
                        {ticket.category}
                      </span>
                    </div>

                    <span
                      className={`text-[11px] font-mono shrink-0 ${
                        isDark ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      {ticket.createdAt.split(',')[0]}
                    </span>
                  </div>

                  <p
                    className={`text-xs font-semibold mt-0.5 truncate ${
                      isDark ? 'text-slate-200' : 'text-slate-800'
                    }`}
                  >
                    {ticket.subject}
                  </p>

                  <div className="flex items-center justify-between gap-2 mt-1">
                    <p
                      className={`text-xs truncate flex-1 ${
                        isDark ? 'text-slate-400' : 'text-slate-600'
                      }`}
                    >
                      {lastReply?.sender === 'user' && (
                        <CheckCheck className="w-3.5 h-3.5 inline mr-1 text-cyan-400" />
                      )}
                      {previewText}
                    </p>

                    <div className="shrink-0 flex items-center gap-2">
                      {getStatusBadge(ticket.status)}
                      <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-0.5 ${
                        isDark ? 'text-slate-400' : 'text-slate-500'
                      }`} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TicketList;
