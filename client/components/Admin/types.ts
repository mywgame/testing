/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  mobile: string;
  rank: string;
  balance: string;
  referralCode: string;
  levelA: number;
  levelB: number;
  levelC: number;
  levelD: number;
  status: 'Active' | 'Suspended';
  joined: string;
  adminNotes?: string;
}

export interface AdminDeposit {
  id: string;
  user: string;
  amount: string;
  method: string;
  txHash: string;
  date: string;
  status: 'Pending' | 'Completed' | 'Rejected';
}

export interface AdminWithdrawal {
  id: string;
  user: string;
  amount: string;
  wallet: string;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface AdminTicket {
  id: string;
  user: string;
  subject: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Open' | 'Pending' | 'Resolved' | 'Closed';
  date: string;
  messages: Array<{
    sender: 'user' | 'admin';
    text: string;
    time: string;
  }>;
}

export interface AdminAuditLog {
  action: string;
  admin: string;
  ip: string;
  time: string;
  module: string;
}

export interface AdminSession {
  admin: string;
  ip: string;
  location: string;
  device: string;
  since: string;
  active: boolean;
}

export interface SecurityAlert {
  msg: string;
  level: 'High' | 'Medium' | 'Low';
  time: string;
}
