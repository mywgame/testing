/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SupportReply {
  id: string;
  sender: 'user' | 'support';
  message: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  category: 'DEPOSIT' | 'WITHDRAWAL' | 'VIP' | 'ACCOUNT' | 'OTHER';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  createdAt: string;
  attachmentName?: string;
  replies?: SupportReply[];
}
