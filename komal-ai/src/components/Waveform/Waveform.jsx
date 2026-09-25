import React, { useEffect, useRef } from 'react';
import styles from './Waveform.module.css';

const NUM_BARS = 53;

const Waveform = ({ status = 'idle' }) => {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  const stateRef = useRef({
    status: status,
    barHeights: new Array(NUM_BARS).fill(4),
    targetHeights: new Array(NUM_BARS).fill(4),
    time: 0,
  });

  useEffect(() => {
    stateRef.current.status = status;
  }, [status]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let lastTime = performance.now();

    const render = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      const state = stateRef.current;
      state.time += dt;
      const t = state.time;
      const currentStatus = state.status;

      // Handle HiDPI retina displays
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const displayWidth = rect.width;
      const displayHeight = rect.height;

      if (
        canvas.width !== Math.floor(displayWidth * dpr) ||
        canvas.height !== Math.floor(displayHeight * dpr)
      ) {
        canvas.width = Math.floor(displayWidth * dpr);
        canvas.height = Math.floor(displayHeight * dpr);
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, displayWidth, displayHeight);

      const width = displayWidth;
      const height = displayHeight;
      const centerY = height / 2;

      // Calculate spacing and positions for bars
      const centerIdx = (NUM_BARS - 1) / 2;
      const totalWaveWidth = Math.min(width * 0.85, 680);
      const startX = (width - totalWaveWidth) / 2;
      const stepX = totalWaveWidth / (NUM_BARS - 1);
      const barWidth = Math.max(2.4, Math.min(3.6, stepX * 0.42));

      // 1. Draw horizontal center baseline (from startX to startX + totalWaveWidth)
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.42)';
      ctx.lineWidth = 1;
      ctx.moveTo(startX - 24, centerY);
      ctx.lineTo(startX + totalWaveWidth + 24, centerY);
      ctx.stroke();

      // 2. Compute target heights for each bar
      const maxAmplitude = height * 0.36;

      for (let i = 0; i < NUM_BARS; i++) {
        const distFromCenter = Math.abs(i - centerIdx) / centerIdx; // 0 at center, 1 at edge
        // Bell-curve envelope
        const bell = Math.exp(-0.5 * Math.pow(distFromCenter / 0.36, 2));

        let h = 2; // minimum tick height

        if (currentStatus === 'speaking') {
          // Dynamic vocal modulation: multiple harmonic frequencies travelling outward
          const speechPulse = 0.55 + 0.35 * Math.sin(t * 5.2 - i * 0.32) + 0.2 * Math.cos(t * 8.4 + i * 0.45);
          const vocalFormant = Math.max(0.15, speechPulse);
          h = 3 + maxAmplitude * bell * vocalFormant;
        } else if (currentStatus === 'listening') {
          // Acoustic alert ripples
          const ripple = 0.4 + 0.35 * Math.sin(t * 3.8 + i * 0.28) * Math.cos(t * 2.1 - i * 0.15);
          h = 3 + maxAmplitude * 0.55 * bell * Math.max(0.2, ripple);
        } else if (currentStatus === 'thinking') {
          // Slow rhythmic meditative breathing
          const breath = 0.5 + 0.5 * Math.sin(t * 1.8);
          h = 3 + maxAmplitude * 0.35 * bell * (0.4 + 0.6 * breath);
        } else if (currentStatus === 'paused') {
          // Collapsed to resting baseline
          h = 1;
        } else {
          // Idle: gentle subtle breathing
          const idleWave = 0.5 + 0.5 * Math.sin(t * 1.4 + i * 0.18);
          h = 2.5 + maxAmplitude * 0.2 * bell * idleWave;
        }

        state.targetHeights[i] = h;
      }

      // 3. Smooth exponential interpolation (lerp)
      const lerpFactor = currentStatus === 'speaking' ? 0.2 : 0.12;
      for (let i = 0; i < NUM_BARS; i++) {
        state.barHeights[i] += (state.targetHeights[i] - state.barHeights[i]) * lerpFactor;
      }

      // 4. Draw symmetrical vertical rounded bars
      ctx.lineCap = 'round';
      ctx.lineWidth = barWidth;

      for (let i = 0; i < NUM_BARS; i++) {
        const x = startX + i * stepX;
        const barH = state.barHeights[i];

        if (barH <= 1.2) continue; // collapsed into the baseline

        // Calculate opacity: slightly softer towards outer edges
        const distFromCenter = Math.abs(i - centerIdx) / centerIdx;
        const alpha = Math.max(0.35, 1 - distFromCenter * 0.55);

        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(x, centerY - barH);
        ctx.lineTo(x, centerY + barH);
        ctx.stroke();
      }

      ctx.restore();
      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);

    return () => {
      if (animRef.current) {
        cancelAnimationFrame(animRef.current);
      }
    };
  }, []);

  return (
    <div className={styles.waveformWrapper}>
      <canvas ref={canvasRef} className={styles.waveformCanvas} />
    </div>
  );
};

export default Waveform;
