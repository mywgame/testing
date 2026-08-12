/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MessageSquare, Calendar, ChevronRight, ChevronDown, CheckCircle, Clock, AlertCircle, FileText } from 'lucide-react';
import { useTheme } from '../../../hooks/useTheme.ts';
import { SupportTicket } from './types.ts';

interface TicketListProps {
  tickets: SupportTicket[];
  onReply: (ticketId: string, message: string) => Promise<void>;
  onClose: (ticketId: string) => Promise<void>;
}

export const TicketList: React.FC<TicketListProps> = ({ tickets, onReply, onClose }) => {
  const { t } = useTheme();
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  const toggleExpand = (id: string) => {
    setSelectedTicketId((prev) => {
      if (prev !== id) {
        setReplyText('');
      }
      return prev === id ? null : id;
    });
  };

  const handleSendReply = async (ticketId: string) => {
    if (!replyText.trim()) return;
    setIsSubmittingAction(true);
    try {
      await onReply(ticketId, replyText.trim());
      setReplyText('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleCloseTicket = async (ticketId: string) => {
    if (!window.confirm('Are you sure you want to close this ticket?')) return;
    setIsSubmittingAction(true);
    try {
      await onClose(ticketId);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const getStatusStyle = (status: SupportTicket['status']) => {
    switch (status) {
      case 'Open':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
          dot: 'bg-emerald-500 dark:bg-emerald-400',
          icon: Clock,
        };
      case 'In Progress':
        return {
          bg: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-600 dark:text-cyan-400',
          dot: 'bg-cyan-500 dark:bg-cyan-400',
          icon: Clock,
        };
      case 'Resolved':
        return {
          bg: 'bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400',
          dot: 'bg-green-500 dark:bg-green-400',
          icon: CheckCircle,
        };
      case 'Closed':
        return {
          bg: t.isDark ? 'bg-white/5 border-white/10 text-gray-400' : 'bg-black/5 border-black/10 text-gray-500',
          dot: 'bg-gray-500',
          icon: AlertCircle,
        };
      default:
        return {
          bg: t.isDark ? 'bg-white/5 border-white/5 text-gray-300' : 'bg-black/5 border-black/5 text-gray-600',
          dot: 'bg-gray-400',
          icon: Clock,
        };
    }
  };

  return (
    <div className={`p-6 rounded-3xl border ${t.card} space-y-4 text-left`} id="ticket-list-section">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className={`text-base font-bold font-sans tracking-tight ${t.text}`}>
            My Support Tickets
          </h3>
          <p className={`text-xs ${t.textSub}`}>
            View history and track real-time resolution progress of your requests.
          </p>
        </div>
        <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 border ${t.isDark ? 'border-cyan-500/20' : 'border-cyan-500/10'}`}>
          {tickets.length} {tickets.length === 1 ? 'Ticket' : 'Tickets'}
        </span>
      </div>

      {tickets.length === 0 ? (
        <div className={`flex flex-col items-center justify-center py-12 text-center border border-dashed rounded-2xl space-y-3 ${t.isDark ? 'border-white/10 bg-white/3' : 'border-black/10 bg-black/3'}`}>
          <div className={`p-3 rounded-full ${t.inset} ${t.textMuted}`}>
            <MessageSquare className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-xs">
            <p className={`text-sm font-semibold ${t.text}`}>No Support Tickets Yet</p>
            <p className={`text-xs ${t.textMuted}`}>
              Submit a ticket on the left if you need assistance, or reach out to our email.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => {
            const isExpanded = selectedTicketId === ticket.id;
            const statusStyle = getStatusStyle(ticket.status);

            return (
              <div
                key={ticket.id}
                className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                  isExpanded
                    ? 'border-cyan-500/40 ' + (t.isDark ? 'bg-white/5' : 'bg-black/5')
                    : t.isDark
                    ? 'border-white/5 bg-white/3 hover:bg-white/5'
                    : 'border-black/5 bg-black/3 hover:bg-black/5'
                }`}
              >
                {/* Header card summary trigger */}
                <div
                  onClick={() => toggleExpand(ticket.id)}
                  className="p-4 flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="space-y-1.5 min-w-0 pr-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400 shrink-0">
                        {ticket.ticketNumber}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase ${t.isDark ? 'bg-white/5 text-gray-400' : 'bg-black/5 text-gray-500'}`}>
                        {ticket.category}
                      </span>
                    </div>
                    <h4 className={`text-sm font-semibold truncate max-w-md ${t.text}`}>
                      {ticket.subject}
                    </h4>
                    <div className={`flex items-center space-x-3 text-[11px] ${t.textMuted}`}>
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{ticket.createdAt}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <span
                      className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusStyle.bg}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                      <span>{ticket.status}</span>
                    </span>
                    {isExpanded ? (
                      <ChevronDown className={`w-4 h-4 ${t.textMuted}`} />
                    ) : (
                      <ChevronRight className={`w-4 h-4 ${t.textMuted}`} />
                    )}
                  </div>
                </div>

                {/* Collapsible expanded section */}
                {isExpanded && (
                  <div className={`p-4 border-t space-y-4 text-xs sm:text-sm ${t.inset} ${t.sep}`}>
                    {/* Ticket Details */}
                    <div className="space-y-1.5">
                      <h5 className={`text-[11px] uppercase font-bold tracking-wider ${t.textMuted}`}>
                        Original Message
                      </h5>
                      <p className={`whitespace-pre-wrap leading-relaxed font-sans text-xs p-3.5 rounded-xl border ${
                        t.isDark
                          ? 'text-gray-300 bg-white/3 border-white/5'
                          : 'text-gray-700 bg-black/3 border-black/5'
                      }`}>
                        {ticket.description}
                      </p>
                    </div>

                    {/* Attachment info */}
                    {ticket.attachmentName && (
                      <div className="flex items-center space-x-2 text-xs text-cyan-600 dark:text-cyan-400 font-mono bg-cyan-500/5 p-2 rounded-lg border border-cyan-500/10 inline-flex">
                        <FileText className="w-3.5 h-3.5" />
                        <span>Attached: {ticket.attachmentName}</span>
                      </div>
                    )}

                    {/* Replies list thread */}
                    <div className="space-y-3 pt-2">
                      <h5 className={`text-[11px] uppercase font-bold tracking-wider ${t.textMuted}`}>
                        Resolution Feed & Conversation
                      </h5>

                      <div className="space-y-2.5">
                        {ticket.replies && ticket.replies.length > 0 ? (
                          ticket.replies.map((reply) => {
                            const isSupport = reply.sender === 'support';
                            return (
                              <div
                                key={reply.id}
                                className={`flex flex-col max-w-full space-y-1 ${
                                  isSupport ? 'items-start' : 'items-end'
                                }`}
                              >
                                <div className={`flex items-center space-x-1.5 text-[10px] ${t.textMuted}`}>
                                  <span className="font-bold">
                                    {isSupport ? 'MetaFirm Support Agent' : 'You (Support Ticket Creator)'}
                                  </span>
                                  <span>•</span>
                                  <span>{reply.createdAt}</span>
                                </div>
                                <div
                                  className={`p-3 rounded-2xl text-xs leading-normal max-w-[85%] font-sans ${
                                    isSupport
                                      ? 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-900 dark:text-cyan-100 rounded-tl-none'
                                      : `${t.isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-black/10 text-gray-800 shadow-sm'} rounded-tr-none`
                                  }`}
                                >
                                  {reply.message}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className={`p-3 text-center border border-dashed rounded-xl text-xs font-sans ${
                            t.isDark ? 'border-white/5 text-gray-500' : 'border-black/5 text-gray-400'
                          }`}>
                            Queue assigned. Support specialists are evaluating your request details.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Reply Form & Close Action inside expanded list */}
                    {ticket.status !== 'Closed' && ticket.status !== 'Resolved' && (
                      <div className={`pt-4 border-t space-y-3 ${t.sep}`}>
                        <h5 className={`text-[11px] uppercase font-bold tracking-wider ${t.textMuted}`}>
                          Write a Reply
                        </h5>
                        <div className="flex gap-2">
                          <textarea
                            rows={2}
                            placeholder="Type your message reply here..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            disabled={isSubmittingAction}
                            className={`flex-1 p-2.5 text-xs rounded-xl border outline-none font-sans ${
                              t.isDark
                                ? 'bg-white/5 border-white/5 text-white focus:border-cyan-500/50'
                                : 'bg-black/5 border-black/5 text-gray-800 focus:border-cyan-500/50'
                            }`}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => handleCloseTicket(ticket.id)}
                            disabled={isSubmittingAction}
                            className="px-3 py-1.5 rounded-lg border border-red-500/30 text-red-500 dark:text-red-400 text-xs font-semibold hover:bg-red-500/10 cursor-pointer transition-colors disabled:opacity-50"
                          >
                            Close Ticket
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSendReply(ticket.id)}
                            disabled={isSubmittingAction || !replyText.trim()}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-colors cursor-pointer flex items-center justify-center ${
                              isSubmittingAction || !replyText.trim()
                                ? 'bg-black/5 dark:bg-white/5 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                : 'bg-cyan-500 text-black hover:bg-cyan-600'
                            }`}
                          >
                            {isSubmittingAction ? 'Sending...' : 'Send Reply'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
