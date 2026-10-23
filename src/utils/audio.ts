/**
 * Audio synthesis helper using Web Audio API for timer chimes and ambient sounds.
 * 100% self-contained, no external audio files that could fail to load.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private ambientNode: AudioNode | null = null;
  private ambientGain: GainNode | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  /**
   * Plays a pleasant multi-tone chime when a session finishes.
   */
  playChime(type: 'complete' | 'break' | 'start' = 'complete', volume = 0.6) {
    const ctx = this.getContext();
    if (!ctx) return;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(volume, ctx.currentTime);
    masterGain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === 'complete') {
      // Harmonic celebratory chord (C5 - E5 - G5 - C6)
      const freqs = [523.25, 659.25, 783.99, 1046.5];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);

        gain.gain.setValueAtTime(0, now + idx * 0.12);
        gain.gain.linearRampToValueAtTime(0.35, now + idx * 0.12 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 1.2);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 1.3);
      });
    } else if (type === 'break') {
      // Gentle calm two-tone bell (E5 - B4)
      const freqs = [659.25, 493.88];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.25);

        gain.gain.setValueAtTime(0, now + idx * 0.25);
        gain.gain.linearRampToValueAtTime(0.3, now + idx * 0.25 + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.25 + 1.6);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(now + idx * 0.25);
        osc.stop(now + idx * 0.25 + 1.7);
      });
    } else {
      // Clean short tap/start sound
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(now);
      osc.stop(now + 0.11);
    }
  }

  /**
   * Starts synthesizing ambient background noise (rain, forest, waves, whitenoise).
   */
  startAmbient(type: 'rain' | 'forest' | 'waves' | 'whitenoise', volume = 0.3) {
    this.stopAmbient();
    if (type === 'none' as unknown as string) return;

    const ctx = this.getContext();
    if (!ctx) return;

    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Generate filtered white/pink noise
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      if (type === 'whitenoise') {
        data[i] = white * 0.5;
      } else if (type === 'rain') {
        // Pink-ish noise with high-pass for rainfall drizzle
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
      } else if (type === 'waves') {
        // Deep brown noise
        lastOut = (lastOut + 0.015 * white) / 1.015;
        data[i] = lastOut * 3;
      } else {
        // Forest gentle rustle
        data[i] = white * 0.3;
      }
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    // Filter node
    const filter = ctx.createBiquadFilter();
    if (type === 'rain') {
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, ctx.currentTime);
    } else if (type === 'waves') {
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, ctx.currentTime);
    } else if (type === 'whitenoise') {
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(4000, ctx.currentTime);
    } else {
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, ctx.currentTime);
      filter.Q.setValueAtTime(1.5, ctx.currentTime);
    }

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(volume * 0.4, ctx.currentTime);

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    noise.start();
    this.ambientNode = noise;
    this.ambientGain = gainNode;
  }

  setAmbientVolume(volume: number) {
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setValueAtTime(Math.max(0, Math.min(1, volume * 0.4)), this.ctx.currentTime);
    }
  }

  stopAmbient() {
    if (this.ambientNode) {
      try {
        (this.ambientNode as AudioBufferSourceNode).stop();
        this.ambientNode.disconnect();
      } catch {
        // ignore already stopped
      }
      this.ambientNode = null;
    }
    if (this.ambientGain) {
      this.ambientGain.disconnect();
      this.ambientGain = null;
    }
  }
}

export const soundEngine = new SoundEngine();
