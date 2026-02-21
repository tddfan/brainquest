import { useCallback, useRef } from 'react';

// Use a singleton for the AudioContext
let globalAudioCtx = null;

export function useSound() {
  const initCtx = async () => {
    if (!globalAudioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        globalAudioCtx = new AudioContext();
      }
    }
    if (globalAudioCtx?.state === 'suspended') {
      await globalAudioCtx.resume();
    }
    return globalAudioCtx;
  };

  const playTone = async (freq, type, duration, volume = 0.1) => {
    const ctx = await initCtx();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  };

  const playSound = useCallback((name) => {
    try {
      if (name === 'correct') {
        // High-pitched "Ding"
        playTone(880, "sine", 0.3, 0.2);
        setTimeout(() => playTone(1108.73, "sine", 0.3, 0.2), 100);
      } else if (name === 'wrong') {
        // Low discordant "Buzz"
        playTone(150, "sawtooth", 0.4, 0.2);
        playTone(110, "sawtooth", 0.4, 0.2);
      } else if (name === 'click') {
        playTone(600, "sine", 0.1, 0.05);
      } else if (name === 'achievement') {
        // Triumphant Fanfare
        playTone(523.25, "sine", 0.4, 0.2);
        setTimeout(() => playTone(659.25, "sine", 0.4, 0.2), 150);
        setTimeout(() => playTone(783.99, "sine", 0.6, 0.2), 300);
      }
    } catch (e) {
      console.warn("Sound error:", e);
    }
  }, []);

  return { playSound };
}
