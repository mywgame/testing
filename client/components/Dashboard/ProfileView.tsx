/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth.ts';
import { useTheme } from '../../hooks/useTheme.ts';
import { useAvatar } from '../../hooks/useAvatar.ts';
import { Copy, Check, Mail, Calendar, Phone, Pencil, Save, X, AtSign, Fingerprint, Link as LinkIcon } from 'lucide-react';
import { AvatarPicker } from '../ui/AvatarPicker.tsx';
import { getReferralLink } from '../../utils/referral.ts';

// TODO(Phase 2 — backend integration): Name / Username / User ID edits below
// are held in local mock state only (no PATCH /users/profile endpoint exists
// yet). Once that endpoint is available, wire `handleSave` to call it and
// seed the mock state from the response instead of `useAuth().user`.

export const ProfileView: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTheme();
  const { avatarUrl } = useAvatar();
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [name, setName] = useState(user?.name || 'MetaFirm Member');
  const [username, setUsername] = useState(user?.email ? user.email.split('@')[0] : 'member');
  const [userId, setUserId] = useState(user?.userId || 'MF-PENDING');

  const referralCode = user?.referralCode || user?.userId || '';
  const referralLink = getReferralLink(referralCode);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => setIsEditing(false);
  const handleCancel = () => {
    setName(user?.name || 'MetaFirm Member');
    setUsername(user?.email ? user.email.split('@')[0] : 'member');
    setUserId(user?.userId || 'MF-PENDING');
    setIsEditing(false);
  };

  const fieldClass = `w-full rounded-xl px-3.5 py-2.5 text-sm font-semibold outline-none transition-all ${t.inset} ${t.text} ${
    isEditing ? 'focus:ring-2 focus:ring-cyan-500/50 cursor-text' : 'cursor-default opacity-90'
  }`;

  return (
    <div className="space-y-6 text-left" id="profile-view-tab">

      {/* Identity Banner */}
      <div className={`relative rounded-3xl border backdrop-blur-xl overflow-hidden transition-all duration-300 ${t.card}`}>
        <div className={`absolute -right-16 -top-16 w-64 h-64 rounded-full blur-3xl pointer-events-none ${t.isDark ? 'bg-cyan-500/20' : 'bg-violet-400/20'}`} />
        <div className={`absolute -left-10 -bottom-10 w-48 h-48 rounded-full blur-3xl pointer-events-none ${t.isDark ? 'bg-purple-600/20' : 'bg-sky-400/20'}`} />

        <div className="relative flex flex-col sm:flex-row sm:items-center gap-5 p-6">
          {/* Avatar */}
          <button
            onClick={() => setIsPickerOpen(true)}
            title="Change avatar"
            className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 border border-white/20 cursor-pointer hover:brightness-110 transition-all shadow-lg shadow-cyan-500/10 self-center sm:self-auto"
          >
            <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
            <span className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[9px] font-bold uppercase tracking-wider py-1 text-center">
              Change
            </span>
          </button>

          <div className="flex-1 min-w-0 text-center sm:text-left">
            {isEditing ? (
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`text-xl sm:text-2xl font-extrabold bg-transparent border-b-2 border-cyan-500/50 outline-none w-full max-w-xs mx-auto sm:mx-0 ${t.text}`}
              />
            ) : (
              <h2 className={`text-xl sm:text-2xl font-extrabold ${t.text}`}>{name}</h2>
            )}
            <p className={`text-sm mt-1 flex items-center justify-center sm:justify-start gap-1.5 ${t.textSub}`}>
              <AtSign className="w-3.5 h-3.5" /> {username}
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 shrink-0">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90 transition-opacity cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" /> Save
                </button>
                <button
                  onClick={handleCancel}
                  className={`p-2 rounded-xl transition-colors cursor-pointer ${t.isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'} ${t.textMuted}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${t.isDark ? 'border-white/15 hover:bg-white/10' : 'border-black/10 hover:bg-black/5'} ${t.text}`}
              >
                <Pencil className="w-3.5 h-3.5" /> Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className={`rounded-2xl border p-4 backdrop-blur-lg ${t.card}`}>
          <label className={`text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 ${t.textMuted}`}>
            <Fingerprint className="w-3.5 h-3.5" /> User ID
          </label>
          <input value={userId} onChange={(e) => setUserId(e.target.value)} readOnly={!isEditing} className={fieldClass} />
        </div>

        <div className={`rounded-2xl border p-4 backdrop-blur-lg ${t.card}`}>
          <label className={`text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 ${t.textMuted}`}>
            <AtSign className="w-3.5 h-3.5" /> Username
          </label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} readOnly={!isEditing} className={fieldClass} />
        </div>

        <div className={`rounded-2xl border p-4 backdrop-blur-lg ${t.card}`}>
          <label className={`text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 ${t.textMuted}`}>
            <Phone className="w-3.5 h-3.5" /> Mobile Number
          </label>
          <p className={`text-sm font-semibold rounded-xl px-3.5 py-2.5 ${t.inset} ${t.text}`}>{user?.phone || 'Not configured'}</p>
        </div>

        <div className={`rounded-2xl border p-4 backdrop-blur-lg ${t.card}`}>
          <label className={`text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 ${t.textMuted}`}>
            <Mail className="w-3.5 h-3.5" /> Email Address
          </label>
          <p className={`text-sm font-semibold rounded-xl px-3.5 py-2.5 truncate ${t.inset} ${t.text}`}>{user?.email || 'unverified@metafirm.app'}</p>
        </div>
      </div>

      {/* Referral Link */}
      <div className={`rounded-2xl border p-5 backdrop-blur-lg ${t.card}`}>
        <label className={`text-[10px] font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5 ${t.textMuted}`}>
          <LinkIcon className="w-3.5 h-3.5 text-cyan-500" /> Your Referral Link
        </label>
        <div className={`flex items-center gap-2 rounded-xl px-3.5 py-3 ${t.inset}`}>
          <span className={`text-xs sm:text-sm font-mono truncate flex-1 ${t.textSub}`}>{referralLink}</span>
          <button
            onClick={handleCopy}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90 transition-opacity cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Enrollment Timestamp */}
      <div className={`rounded-2xl border p-4 backdrop-blur-lg flex items-center gap-3 ${t.card}`}>
        <div className={`p-2 rounded-xl ${t.isDark ? 'bg-cyan-500/15' : 'bg-cyan-500/10'}`}>
          <Calendar className="w-4 h-4 text-cyan-500" />
        </div>
        <div>
          <span className={`text-[10px] font-bold uppercase tracking-wider block ${t.textMuted}`}>Enrollment Timestamp</span>
          <span className={`text-sm font-bold font-mono ${t.text}`}>
            {user?.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A'} UTC
          </span>
        </div>
      </div>

      <AvatarPicker isOpen={isPickerOpen} onClose={() => setIsPickerOpen(false)} />
    </div>
  );
};

export default ProfileView;
