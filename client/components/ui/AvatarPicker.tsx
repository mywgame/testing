/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme.ts';
import { useAvatar } from '../../hooks/useAvatar.ts';
import { SYSTEM_AVATARS } from '../../lib/avatars.ts';

interface AvatarPickerProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Avatar preview + selection + save modal. Reads/writes through the shared
 * `useAvatar()` store, so saving here instantly updates every other place
 * the avatar is rendered (Dashboard TopNav pill, Profile page, etc.).
 */
export const AvatarPicker: React.FC<AvatarPickerProps> = ({ isOpen, onClose }) => {
  const { t } = useTheme();
  const { avatarId, setAvatar } = useAvatar();
  const [pendingId, setPendingId] = useState(avatarId);

  if (!isOpen) return null;

  const handleSave = () => {
    setAvatar(pendingId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className={`relative w-full max-w-lg rounded-3xl border backdrop-blur-2xl p-6 max-h-[85vh] flex flex-col ${t.card}`}>
        <div className="flex items-center justify-between mb-5 shrink-0">
          <div>
            <h3 className={`text-lg font-extrabold ${t.text}`}>Choose Your Avatar</h3>
            <p className={`text-xs mt-0.5 ${t.textMuted}`}>Pick a system avatar for your MetaFirm profile</p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${t.isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'} ${t.textMuted}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 overflow-y-auto pr-1 pb-2">
          {SYSTEM_AVATARS.map((avatar) => {
            const selected = pendingId === avatar.id;
            return (
              <button
                key={avatar.id}
                onClick={() => setPendingId(avatar.id)}
                className={`relative rounded-2xl p-1 transition-all duration-200 cursor-pointer ${
                  selected ? 'ring-2 ring-cyan-500 ring-offset-2' : 'hover:scale-105'
                } ${t.isDark ? 'ring-offset-[#07091a]' : 'ring-offset-white'}`}
              >
                <img src={avatar.url} alt={avatar.id} className="w-full aspect-square rounded-full object-contain" />
                {selected && (
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-cyan-500 border-2 border-white flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className={`flex items-center justify-end gap-3 mt-5 pt-4 border-t shrink-0 ${t.sep}`}>
          <button
            onClick={onClose}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${t.isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'} ${t.textSub}`}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90 transition-opacity cursor-pointer shadow-lg shadow-cyan-500/20"
          >
            Save Avatar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvatarPicker;
