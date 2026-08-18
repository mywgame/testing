/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Paperclip,
  Smile,
  ArrowLeft,
  CheckCheck,
  Headphones,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Lock,
} from 'lucide-react';
import { useTheme } from '../../../hooks/useTheme.ts';
import { SupportTicket } from './types.ts';

interface TicketChatViewProps {
  ticket: SupportTicket;
  onBack: () => void;
  onReply: (ticketId: string, message: string) => Promise<void>;
  onClose: (ticketId: string) => Promise<void>;
}

export const TicketChatView: React.FC<TicketChatViewProps> = ({
  ticket,
  onBack,
  onReply,
  onClose,
}) => {
  const { isDark } = useTheme();
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [ticket.replies]);

  const handleSend = async () => {
    if (!messageText.trim() || isSending) return;
    setIsSending(true);
    try {
      await onReply(ticket.id, messageText.trim());
      setMessageText('');
    } catch (err) {
      console.error('Failed to send reply:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClose = async () => {
    if (!window.confirm('Are you sure you want to close this ticket?')) return;
    setIsClosing(true);
    try {
      await onClose(ticket.id);
    } catch (err) {
      console.error('Failed to close ticket:', err);
    } finally {
      setIsClosing(false);
    }
  };

  const isClosed = ticket.status === 'Closed' || ticket.status === 'Resolved';

  return (
    <div
      className={`flex flex-col h-[680px] w-full rounded-3xl border overflow-hidden shadow-2xl transition-all ${
        isDark
          ? 'bg-[#0e122b] border-purple-500/20 shadow-purple-950/40 text-white'
          : 'bg-[#f4f6fb] border-slate-200 shadow-xl text-slate-900'
      }`}
      id={`ticket-chat-${ticket.id}`}
    >
      {/* WhatsApp / Insta Style Top App Bar */}
      <div
        className={`px-4 sm:px-5 py-3.5 flex items-center justify-between border-b shrink-0 z-10 backdrop-blur-md ${
          isDark
            ? 'bg-[#121638]/95 border-white/10'
            : 'bg-white/95 border-slate-200 shadow-sm'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            className={`p-2 rounded-full transition-colors cursor-pointer ${
              isDark ? 'hover:bg-white/10 text-white' : 'hover:bg-slate-100 text-slate-800'
            }`}
            title="Back to Tickets"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* MetaFirm Avatar */}
          <div className="relative shrink-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white font-bold shadow-md shadow-purple-900/30">
              <Headphones className="w-5 h-5 text-white" />
            </div>
          </div>

          {/* Agent Info & Ticket Number */}
          <div className="min-w-0 flex-1 text-left">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm sm:text-base tracking-tight truncate leading-snug">
                MetaFirm Support Agent
              </h3>
            </div>
            <p
              className={`text-[11px] font-mono truncate leading-none mt-0.5 ${
                isDark ? 'text-cyan-400' : 'text-cyan-700'
              }`}
            >
              Ticket {ticket.ticketNumber} • {ticket.category}
            </p>
          </div>
        </div>

        {/* Ticket Status & Close Button */}
        <div className="flex items-center gap-2 shrink-0">
          {ticket.status === 'Open' && (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <Clock className="w-3 h-3" />
              <span>Open</span>
            </span>
          )}
          {ticket.status === 'In Progress' && (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              <Clock className="w-3 h-3 animate-spin" />
              <span>In Progress</span>
            </span>
          )}
          {ticket.status === 'Resolved' && (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-green-500/15 text-green-400 border border-green-500/30">
              <CheckCircle2 className="w-3 h-3" />
              <span>Resolved</span>
            </span>
          )}
          {ticket.status === 'Closed' && (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-500/15 text-slate-400 border border-slate-500/30">
              <XCircle className="w-3 h-3" />
              <span>Closed</span>
            </span>
          )}

          {!isClosed && (
            <button
              onClick={handleClose}
              disabled={isClosing}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                isDark
                  ? 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30'
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200'
              }`}
            >
              {isClosing ? 'Closing...' : 'Close'}
            </button>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-left custom-scrollbar">
        {/* Date / Subject Bubble Separator */}
        <div className="flex flex-col items-center justify-center my-2 space-y-1">
          <span
            className={`px-3.5 py-1 rounded-full text-[11px] font-medium shadow-xs ${
              isDark ? 'bg-white/10 text-slate-300' : 'bg-slate-200/80 text-slate-700'
            }`}
          >
            Subject: {ticket.subject}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">{ticket.createdAt}</span>
        </div>

        {/* 1. Original User Request Bubble (Right / Purple) */}
        <div className="flex flex-col items-end space-y-1">
          <div
            className="max-w-[85%] sm:max-w-[70%] rounded-2xl rounded-tr-xs px-4 py-3 shadow-md bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-normal text-sm leading-relaxed"
          >
            <p className="whitespace-pre-wrap break-words">{ticket.description}</p>
            {ticket.attachmentName && (
              <div className="mt-2 pt-2 border-t border-white/20 flex items-center gap-1.5 text-xs text-purple-200">
                <FileText className="w-3.5 h-3.5" />
                <span className="truncate">{ticket.attachmentName}</span>
              </div>
            )}
            <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-purple-200 font-mono">
              <span>{ticket.createdAt.split(',')[1] || ticket.createdAt}</span>
              <CheckCheck className="w-3.5 h-3.5 text-purple-200 inline" />
            </div>
          </div>
        </div>

        {/* 2. Conversation Thread (Replies) */}
        {ticket.replies && ticket.replies.length > 0 ? (
          ticket.replies.map((reply) => {
            const isSupport = reply.sender === 'support';

            if (isSupport) {
              // Support Bubble (Left side - Clean Grey / White Card)
              return (
                <div key={reply.id} className="flex flex-col items-start space-y-1">
                  <div
                    className={`max-w-[88%] sm:max-w-[75%] rounded-2xl rounded-tl-xs px-4 py-3 shadow-sm font-normal text-sm leading-relaxed ${
                      isDark
                        ? 'bg-[#181d3f] border border-white/10 text-slate-100'
                        : 'bg-white border border-slate-200 text-slate-900 shadow-xs'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{reply.message}</p>
                    <div
                      className={`flex items-center justify-start gap-1 mt-1.5 text-[10px] font-mono ${
                        isDark ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      <span>{reply.createdAt.split(',')[1] || reply.createdAt}</span>
                    </div>
                  </div>
                </div>
              );
            } else {
              // User Reply Bubble (Right side - Instagram Purple)
              return (
                <div key={reply.id} className="flex flex-col items-end space-y-1">
                  <div
                    className="max-w-[85%] sm:max-w-[70%] rounded-2xl rounded-tr-xs px-4 py-3 shadow-md bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-normal text-sm leading-relaxed"
                  >
                    <p className="whitespace-pre-wrap break-words">{reply.message}</p>
                    <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-purple-200 font-mono">
                      <span>{reply.createdAt.split(',')[1] || reply.createdAt}</span>
                      <CheckCheck className="w-3.5 h-3.5 text-purple-200 inline" />
                    </div>
                  </div>
                </div>
              );
            }
          })
        ) : (
          <div className="flex justify-center py-6">
            <div
              className={`px-4 py-2 rounded-2xl text-xs text-center border border-dashed max-w-sm leading-relaxed ${
                isDark
                  ? 'border-white/10 bg-white/[0.02] text-slate-400'
                  : 'border-slate-300 bg-white text-slate-600'
              }`}
            >
              Ticket submitted. MetaFirm Support Specialists will review your request shortly.
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* WhatsApp / Instagram Bottom Message Bar */}
      <div
        className={`p-3 sm:p-4 border-t shrink-0 ${
          isDark
            ? 'bg-[#121638] border-white/10'
            : 'bg-white border-slate-200'
        }`}
      >
        {isClosed ? (
          <div
            className={`p-3 rounded-2xl text-center text-xs font-semibold flex items-center justify-center gap-2 ${
              isDark ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-600'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>This support ticket has been closed. Submit a new ticket if you need further help.</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 sm:gap-3">
            <div
              className={`flex-1 flex items-center gap-2.5 px-4 py-2.5 rounded-full border transition-all ${
                isDark
                  ? 'bg-[#0a0d24] border-white/15 focus-within:border-purple-400 text-white'
                  : 'bg-slate-100 border-slate-200 focus-within:border-purple-500 text-slate-900 focus-within:bg-white'
              }`}
            >
              <Smile className="w-5 h-5 text-slate-400 shrink-0 cursor-pointer hover:text-purple-400 transition-colors" />
              <input
                type="text"
                placeholder="Type a message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isSending}
                className="w-full bg-transparent border-none outline-none text-sm leading-normal placeholder:text-slate-400"
              />
              <Paperclip className="w-5 h-5 text-slate-400 shrink-0 cursor-pointer hover:text-purple-400 transition-colors" />
            </div>

            <button
              onClick={handleSend}
              disabled={isSending || !messageText.trim()}
              className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                isSending || !messageText.trim()
                  ? isDark
                    ? 'bg-white/10 text-slate-500 cursor-not-allowed'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/30'
              }`}
              title="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
