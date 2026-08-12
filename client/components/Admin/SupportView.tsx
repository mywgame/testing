/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Filter,
  Search,
  AlertCircle,
  FileText,
  RotateCcw
} from 'lucide-react';
import { Card, Button, Badge } from '../ui/index.ts';
import { ThemeTokens } from '../ui/themeTokens.ts';
import { api } from '../../services/api.ts';

interface SupportViewProps {
  t: ThemeTokens;
  isDark: boolean;
}

export const SupportView: React.FC<SupportViewProps> = ({ t, isDark }) => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'OPEN' | 'PENDING_USER' | 'RESOLVED' | 'CLOSED'>('ALL');
  const [replyText, setReplyText] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Fetch tickets on mount and whenever search or filter criteria change
  useEffect(() => {
    fetchTickets();
  }, [search, filter]);

  // Fetch conversation messages whenever selected ticket ID changes
  useEffect(() => {
    if (selectedId) {
      fetchMessages(selectedId);
    } else {
      setMessages([]);
    }
  }, [selectedId]);

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const response = await api.getAdminSupportTickets({
        status: filter === 'ALL' ? undefined : filter,
        search: search.trim() || undefined,
      });

      if (response.success && Array.isArray(response.data)) {
        setTickets(response.data);
        // Default select the first ticket if none selected or if selected ticket is no longer in list
        if (response.data.length > 0) {
          const exists = response.data.some((tk: any) => tk.id.toString() === selectedId);
          if (!selectedId || !exists) {
            setSelectedId(response.data[0].id.toString());
          }
        } else {
          setSelectedId('');
        }
      }
    } catch (err) {
      console.error('Failed to load admin support tickets:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (id: string) => {
    setIsMessagesLoading(true);
    try {
      const response = await api.getAdminTicketMessages(id);
      if (response.success && Array.isArray(response.data)) {
        setMessages(response.data);
      }
    } catch (err) {
      console.error(`Failed to load messages for ticket ${id}:`, err);
    } finally {
      setIsMessagesLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedId) return;

    setIsActionLoading(true);
    try {
      const response = await api.replyToTicketAsAdmin(selectedId, replyText.trim());
      if (response.success) {
        setReplyText('');
        fetchMessages(selectedId);
        // Fetch tickets list to update the updated timestamp and last reply state on left sidebar
        fetchTickets();
      } else {
        alert(response.error?.message || 'Failed to submit response reply.');
      }
    } catch (err: any) {
      console.error('Failed to send admin reply:', err);
      alert(err.message || 'An error occurred while submitting reply.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setIsActionLoading(true);
    try {
      const response = await api.updateTicketProperties(id, { status: newStatus });
      if (response.success) {
        fetchTickets();
        if (selectedId === id) {
          fetchMessages(id);
        }
      } else {
        alert(response.error?.message || 'Failed to update ticket status.');
      }
    } catch (err: any) {
      console.error('Failed to update status:', err);
      alert(err.message || 'An error occurred while updating status.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const activeTicket = tickets.find(tk => tk.id.toString() === selectedId);

  return (
    <div className="space-y-6 text-left" id="admin-support-container">
      {/* Header Banner */}
      <div>
        <h2 className="text-xl font-bold tracking-tight">Support Tickets</h2>
        <p className={`text-xs mt-1 ${t.textSub}`}>Interact with members, review user inquiries, and adjust troubleshooting tickets statuses.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[580px]">
        {/* Left pane: Tickets List */}
        <Card className="lg:col-span-5 p-0 overflow-hidden flex flex-col h-full">
          {/* List Search & Filters */}
          <div className={`p-4 border-b space-y-3 ${t.sep}`}>
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${t.textMuted}`} />
              <input
                type="text"
                placeholder="Search by Ticket #, subject, email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className={`w-full pl-9 pr-4 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all ${t.input}`}
              />
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {([
                { value: 'ALL', label: 'All' },
                { value: 'OPEN', label: 'Open' },
                { value: 'PENDING_USER', label: 'Pending User' },
                { value: 'RESOLVED', label: 'Resolved' },
                { value: 'CLOSED', label: 'Closed' }
              ] as const).map(tab => {
                const active = filter === tab.value;
                return (
                  <button
                    key={tab.value}
                    onClick={() => setFilter(tab.value)}
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-bold tracking-tight transition-all cursor-pointer whitespace-nowrap ${
                      active
                        ? 'bg-blue-600 text-white shadow-xs'
                        : `${isDark ? 'bg-white/5 text-gray-400 hover:bg-white/8' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Scrollable list */}
          <div className="flex-grow overflow-y-auto divide-y divide-gray-100/10">
            {isLoading ? (
              <div className="p-8 text-center flex flex-col items-center justify-center space-y-2">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span className={`text-[11px] ${t.textMuted}`}>Syncing tickets database ledger...</span>
              </div>
            ) : filteredTicketsList(tickets).length > 0 ? (
              filteredTicketsList(tickets).map(tk => {
                const active = tk.id.toString() === selectedId;
                const statusLabel = formatStatusLabel(tk.status);
                const dateString = new Date(tk.createdAt).toLocaleDateString();

                return (
                  <div
                    key={tk.id}
                    onClick={() => setSelectedId(tk.id.toString())}
                    className={`p-4 text-left cursor-pointer transition-all ${
                      active
                        ? `${isDark ? 'bg-white/5 border-l-4 border-blue-500' : 'bg-blue-50/50 border-l-4 border-blue-600'}`
                        : `${t.cardInner}`
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] font-bold text-blue-500">{tk.ticketNumber}</span>
                      <span className={`text-[10px] font-medium ${t.textMuted}`}>{dateString}</span>
                    </div>

                    <h4 className="font-bold text-xs mt-1.5 line-clamp-1 tracking-tight">{tk.subject}</h4>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1 min-w-0 mr-2">
                        <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className={`text-[10px] font-semibold truncate ${t.textSub}`}>{tk.userName || tk.userEmail || 'Member'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Badge variant={tk.priority === 'HIGH' || tk.priority === 'URGENT' ? 'rose' : tk.priority === 'MEDIUM' ? 'amber' : 'neutral'}>
                          {tk.priority}
                        </Badge>
                        <Badge variant={tk.status === 'OPEN' ? 'rose' : tk.status === 'PENDING_USER' ? 'amber' : 'emerald'}>
                          {statusLabel}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className={`p-8 text-center font-medium text-xs ${t.textMuted}`}>
                No inquiry tickets found.
              </div>
            )}
          </div>
        </Card>

        {/* Right pane: Chat details */}
        <Card className="lg:col-span-7 p-0 overflow-hidden flex flex-col h-full relative">
          {activeTicket ? (
            <>
              {/* Header details bar */}
              <div className={`p-4 border-b flex items-center justify-between gap-4 ${t.sep}`}>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-blue-500">{activeTicket.ticketNumber}</span>
                    <Badge variant={activeTicket.priority === 'HIGH' || activeTicket.priority === 'URGENT' ? 'rose' : activeTicket.priority === 'MEDIUM' ? 'amber' : 'neutral'}>
                      {activeTicket.priority} Priority
                    </Badge>
                  </div>
                  <h4 className="font-display font-bold text-xs tracking-tight truncate mt-1">{activeTicket.subject}</h4>
                </div>

                <div className="flex gap-1.5 shrink-0">
                  {/* Reopen Action if closed or resolved */}
                  {(activeTicket.status === 'CLOSED' || activeTicket.status === 'RESOLVED') ? (
                    <button
                      onClick={() => handleUpdateStatus(activeTicket.id, 'OPEN')}
                      disabled={isActionLoading}
                      className="p-1.5 rounded-xl border border-blue-500/20 bg-blue-500/5 text-blue-500 hover:bg-blue-500/10 transition-colors cursor-pointer disabled:opacity-50"
                      title="Re-open Ticket"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(activeTicket.id, 'RESOLVED')}
                        disabled={isActionLoading}
                        className="p-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-500 hover:bg-emerald-500/10 transition-colors cursor-pointer disabled:opacity-50"
                        title="Mark Resolved"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(activeTicket.id, 'CLOSED')}
                        disabled={isActionLoading}
                        className="p-1.5 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer disabled:opacity-50"
                        title="Close Ticket"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Chat Messages Feed */}
              <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-black/10">
                {/* Original inquiry message details */}
                <div className="flex justify-start">
                  <div className={`max-w-[80%] rounded-2xl p-3.5 text-xs text-left shadow-xs ${
                    isDark ? 'bg-white/5 text-gray-200' : 'bg-white text-gray-800'
                  } border border-white/5 rounded-tl-none`}>
                    <div className="flex items-center justify-between gap-4 mb-1 border-b border-white/10 pb-0.5">
                      <span className="font-mono text-[9px] uppercase tracking-wider font-extrabold opacity-75">
                        Inquiry Initiator: {activeTicket.userName || activeTicket.userEmail || 'User'}
                      </span>
                      <span className="text-[8px] opacity-60 font-mono font-medium">
                        {new Date(activeTicket.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="leading-relaxed whitespace-pre-wrap">{activeTicket.description}</p>

                    {/* Download attachment */}
                    {activeTicket.attachmentName && activeTicket.attachmentData && (
                      <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between">
                        <div className="flex items-center space-x-1.5 text-[10px] text-blue-400 font-mono">
                          <FileText className="w-3.5 h-3.5" />
                          <span className="truncate max-w-[150px]">{activeTicket.attachmentName}</span>
                        </div>
                        <a
                          href={activeTicket.attachmentData}
                          download={activeTicket.attachmentName}
                          className="text-[10px] font-bold bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded transition-colors"
                        >
                          Download Attachment
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sub-replies thread messages */}
                {isMessagesLoading ? (
                  <div className="py-8 text-center">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span className="text-[10px] text-gray-500">Loading conversation feed...</span>
                  </div>
                ) : (
                  messages
                    .filter((msg: any) => msg.message !== activeTicket.description) // Skip initial ticket description since we rendered it as header card
                    .map((msg, idx) => {
                      const isAdmin = msg.senderType === 'ADMIN' || msg.senderType === 'SYSTEM';
                      return (
                        <div
                          key={msg.id || idx}
                          className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[80%] rounded-2xl p-3.5 text-xs text-left shadow-xs ${
                            isAdmin
                              ? 'bg-blue-600 text-white rounded-tr-none'
                              : `${isDark ? 'bg-white/5 text-gray-200' : 'bg-white text-gray-800'} border border-white/5 rounded-tl-none`
                          }`}>
                            <div className="flex items-center justify-between gap-4 mb-1 border-b border-white/10 pb-0.5">
                              <span className="font-mono text-[9px] uppercase tracking-wider font-extrabold opacity-75">
                                {isAdmin ? 'System Auditor (Admin)' : (activeTicket.userName || activeTicket.userEmail || 'Member')}
                              </span>
                              <span className="text-[8px] opacity-60 font-mono font-medium">
                                {new Date(msg.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>

              {/* Chat Input area */}
              {activeTicket.status !== 'CLOSED' && activeTicket.status !== 'RESOLVED' ? (
                <form onSubmit={handleSendMessage} className={`p-4 border-t flex gap-2 ${t.sep}`}>
                  <input
                    type="text"
                    placeholder="Type your message or solution details here..."
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    disabled={isActionLoading}
                    className={`flex-grow px-4 py-3 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all ${t.input}`}
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isActionLoading || !replyText.trim()}
                    className="p-3 shrink-0 rounded-xl"
                    leftIcon={<Send className="w-4 h-4" />}
                  />
                </form>
              ) : (
                <div className={`p-4 border-t text-center font-bold text-xs ${t.sep} ${t.textMuted}`}>
                  This inquiry is settled and finalized. Re-open to send messages.
                </div>
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center text-gray-500">
              <MessageSquare className="w-8 h-8 text-gray-400 mb-2" />
              <p className="text-sm font-semibold">No Ticket Selected</p>
              <p className="text-xs text-gray-400 mt-1">Select an item from the left panel to begin reviewing troubleshooting communications.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

// Local helpers for clean parsing
function filteredTicketsList(tickets: any[]) {
  // Filtering is already handled on API layer, so we just return the array safely
  return tickets || [];
}

function formatStatusLabel(status: string) {
  switch (status) {
    case 'OPEN':
      return 'Open';
    case 'PENDING_USER':
      return 'Pending User';
    case 'RESOLVED':
      return 'Resolved';
    case 'CLOSED':
      return 'Closed';
    default:
      return status;
  }
}

export default SupportView;
