/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useSyncExternalStore, useCallback } from 'react';
import { DEFAULT_AVATAR_ID, getAvatarUrl } from '../lib/avatars.ts';

const STORAGE_KEY = 'metafirm.selectedAvatarId';

// TODO(Phase 2 — backend integration): replace this localStorage-backed mock
// store with a real call to `PATCH /users/profile/avatar` (or equivalent).
// Every consumer of `useAvatar()` below only depends on `avatarId` / `avatarUrl`
// / `setAvatar`, so swapping the persistence layer here is enough — no UI
// component needs to change.

type Listener = () => void;
const listeners = new Set<Listener>();

const readStored = (): string => {
  try {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_AVATAR_ID;
  } catch {
    return DEFAULT_AVATAR_ID;
  }
};

let currentId = readStored();

const emit = () => listeners.forEach((l) => l());

const subscribe = (listener: Listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const getSnapshot = () => currentId;

/**
 * Shared avatar-selection store. Any component calling `useAvatar()` reads
 * the same `avatarId`, and calling `setAvatar()` from any one of them
 * (e.g. the Profile page picker) instantly re-renders every other consumer
 * (e.g. the Dashboard TopNav identity pill) — no prop drilling required.
 */
export const useAvatar = () => {
  const avatarId = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const setAvatar = useCallback((id: string) => {
    currentId = id;
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // Mock persistence only — safe to ignore storage failures (e.g. private mode).
    }
    emit();
  }, []);

  return { avatarId, avatarUrl: getAvatarUrl(avatarId), setAvatar };
};

export default useAvatar;
