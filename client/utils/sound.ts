/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Web Audio API sound synthesizer for user actions and notification alerts
let audioCtx: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
};

/**
 * Check if sound effects are muted by user preference
 */
export const isSoundMuted = (): boolean => {
  if (typeof localStorage === 'undefined') return false;
  return localStorage.getItem('metafirm_sound_muted') === 'true';
};

/**
 * Toggle sound mute setting
 */
export const setSoundMuted = (muted: boolean): void => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('metafirm_sound_muted', muted ? 'true' : 'false');
  }
};

/**
 * Play a pleasant ascending multi-tone chime for successful user actions
 */
export const playSuccessSound = (): void => {
  if (isSoundMuted()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    
    // Ascending harmonic chord (C5 -> E5 -> G5 -> C6)
    const notes = [523.25, 659.25, 783.99, 1046.50];
    
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      // Smooth attack and soft exponential decay
      const startTime = now + idx * 0.08;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.12, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.35);
    });
  } catch (e) {
    // Ignore audio context errors gracefully
  }
};

/**
 * Play an elegant double-ping notification alert sound
 */
export const playNotificationSound = (): void => {
  if (isSoundMuted()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    
    // Two soft bell notes (E5 -> A5)
    const notes = [659.25, 880.00];
    
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);

      const startTime = now + idx * 0.1;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.15, startTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.4);
    });
  } catch (e) {
    // Ignore audio context errors gracefully
  }
};

/**
 * Play a soft low alert tone for errors
 */
export const playErrorSound = (): void => {
  if (isSoundMuted()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.linearRampToValueAtTime(180, now + 0.2);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  } catch (e) {
    // Ignore audio errors
  }
};
