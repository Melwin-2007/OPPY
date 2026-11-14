import { useEffect, useRef, useState, useCallback } from 'react';

export function useWebAudio() {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const initAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      // 1. Generate Martian Wind Pink Noise
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.06;
        b6 = white * 0.115926;
      }

      const noiseNode = ctx.createBufferSource();
      noiseNode.buffer = noiseBuffer;
      noiseNode.loop = true;

      // 2. Low-Pass Resonant Filter (Thin Martian atmosphere at 140 Hz)
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(140, ctx.currentTime);
      filter.Q.setValueAtTime(3.0, ctx.currentTime);

      // 3. LFO to simulate wind gust pressure variations
      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.18, ctx.currentTime);
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(45, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      // 4. Master Gain Node
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.01, ctx.currentTime);
      gainNodeRef.current = masterGain;

      noiseNode.connect(filter);
      filter.connect(masterGain);
      masterGain.connect(ctx.destination);

      noiseNode.start();
      lfo.start();
    }

    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  }, []);

  const toggleAudio = useCallback(() => {
    initAudio();
    if (!audioCtxRef.current || !gainNodeRef.current) return;

    if (isPlaying) {
      gainNodeRef.current.gain.exponentialRampToValueAtTime(0.0001, audioCtxRef.current.currentTime + 0.8);
      setIsPlaying(false);
    } else {
      gainNodeRef.current.gain.exponentialRampToValueAtTime(0.35, audioCtxRef.current.currentTime + 1.2);
      setIsPlaying(true);
    }
  }, [isPlaying, initAudio]);

  const triggerSound = useCallback((type: 'drive' | 'servo' | 'rat' | 'comm') => {
    const ctx = audioCtxRef.current;
    if (!ctx || ctx.state !== 'running' || !isPlaying) return;

    try {
      const now = ctx.currentTime;
      if (type === 'drive') {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(52 + Math.random() * 8, now);
        g.gain.setValueAtTime(0.04, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.19);
      } else if (type === 'servo') {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(2200, now);
        osc.frequency.exponentialRampToValueAtTime(1600, now + 0.08);
        g.gain.setValueAtTime(0.02, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.09);
      } else if (type === 'rat') {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(340 + Math.random() * 160, now);
        g.gain.setValueAtTime(0.035, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.13);
      } else if (type === 'comm') {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1420, now);
        osc.frequency.setValueAtTime(2130, now + 0.04);
        g.gain.setValueAtTime(0.03, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.16);
      }
    } catch (e) {
      // Audio playback safety catch
    }
  }, [isPlaying]);

  return { isPlaying, toggleAudio, triggerSound };
}
