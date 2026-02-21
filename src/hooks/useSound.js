import { useCallback } from 'react';

let sharedCtx = null;

const getCtx = () => {
  if (typeof window === 'undefined') return null;
  if (!sharedCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      sharedCtx = new AudioContext();
    }
  }
  if (sharedCtx?.state === 'suspended') {
    sharedCtx.resume().catch(() => {});
  }
  return sharedCtx;
};

// Auto-resume context on any interaction
if (typeof window !== 'undefined') {
  const resume = () => {
    const ctx = getCtx();
    if (ctx) window.removeEventListener('mousedown', resume);
  };
  window.addEventListener('mousedown', resume);
  window.addEventListener('touchstart', resume);
}

export function useSound() {
  const playTone = useCallback((freq, type, duration, volume) => {
    const ctx = getCtx();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  }, []);

  const playSound = useCallback((name) => {
    try {
      if (name === 'correct') {
        playTone(523.25, 'sine', 0.3, 0.1); // C5
        setTimeout(() => playTone(659.25, 'sine', 0.3, 0.1), 100); // E5
      } else if (name === 'wrong') {
        playTone(220, 'sawtooth', 0.4, 0.1); // A3
        playTone(210, 'sawtooth', 0.4, 0.1); // Dissonance
      } else if (name === 'click') {
        playTone(800, 'sine', 0.1, 0.05);
      } else if (name === 'achievement') {
        playTone(523.25, 'sine', 0.5, 0.1);
        setTimeout(() => playTone(659.25, 'sine', 0.5, 0.1), 150);
        setTimeout(() => playTone(783.99, 'sine', 0.5, 0.1), 300);
        setTimeout(() => playTone(1046.50, 'sine', 0.8, 0.1), 450);
      } else if (name === 'claim') {
        playTone(880, 'sine', 0.5, 0.1);
        playTone(1108.73, 'sine', 0.5, 0.1);
      }
    } catch (e) {
      console.warn("Synth error:", e);
    }
  }, [playTone]);

  return { playSound };
}
