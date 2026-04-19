'use client';

class SoundManager {
  private ctx: AudioContext | null = null;
  private volume = 0.7;

  private getCtx(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  setVolume(v: number) {
    this.volume = Math.max(0, Math.min(1, v));
  }

  private playTone(freq: number, duration: number, type: OscillatorType = 'sine', gain = 0.1) {
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    g.gain.setValueAtTime(gain * this.volume, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  }

  private playNoise(duration: number, filterFreq: number, gain = 0.05) {
    const ctx = this.getCtx();
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(filterFreq, ctx.currentTime);
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain * this.volume, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    source.connect(filter);
    filter.connect(g);
    g.connect(ctx.destination);
    source.start(ctx.currentTime);
  }

  cardFlip() {
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(1200, ctx.currentTime + 0.1);
    g.gain.setValueAtTime(0.08 * this.volume, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  }

  cardPlace() {
    this.playNoise(0.05, 400, 0.06);
  }

  attackHit() {
    this.playTone(150, 0.1, 'sine', 0.12);
    this.playNoise(0.08, 800, 0.08);
  }

  rareReveal() {
    const ctx = this.getCtx();
    const notes = [523, 659, 784]; // C5, E5, G5
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
      g.gain.setValueAtTime(0.08 * this.volume, ctx.currentTime + i * 0.08);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.3);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.08);
      osc.stop(ctx.currentTime + i * 0.08 + 0.3);
    });
  }

  buttonClick() {
    this.playTone(600, 0.03, 'sine', 0.06);
  }

  packRip() {
    const ctx = this.getCtx();
    const bufferSize = ctx.sampleRate * 0.3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(200, ctx.currentTime);
    filter.frequency.linearRampToValueAtTime(2000, ctx.currentTime + 0.3);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.06 * this.volume, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    source.connect(filter);
    filter.connect(g);
    g.connect(ctx.destination);
    source.start(ctx.currentTime);
  }

  victory() {
    const ctx = this.getCtx();
    // C major chord
    [262, 330, 392].forEach((freq) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      g.gain.setValueAtTime(0.06 * this.volume, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    });
    // Octave C
    const osc2 = ctx.createOscillator();
    const g2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(524, ctx.currentTime + 0.4);
    g2.gain.setValueAtTime(0.08 * this.volume, ctx.currentTime + 0.4);
    g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.0);
    osc2.connect(g2);
    g2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.4);
    osc2.stop(ctx.currentTime + 1.0);
  }

  defeat() {
    const ctx = this.getCtx();
    // C minor descending
    const notes = [524, 466, 392, 311];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
      g.gain.setValueAtTime(0.06 * this.volume, ctx.currentTime + i * 0.1);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.4);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.1);
      osc.stop(ctx.currentTime + i * 0.1 + 0.4);
    });
  }

  levelUp() {
    const ctx = this.getCtx();
    // Triumphant ascending arpeggio C5 - E5 - G5 - C6
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.09);
      g.gain.setValueAtTime(0.09 * this.volume, ctx.currentTime + i * 0.09);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.09 + 0.45);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.09);
      osc.stop(ctx.currentTime + i * 0.09 + 0.45);
    });
    // Shimmer pad underneath
    const pad = ctx.createOscillator();
    const pg = ctx.createGain();
    pad.type = 'sawtooth';
    pad.frequency.setValueAtTime(130, ctx.currentTime);
    pg.gain.setValueAtTime(0.02 * this.volume, ctx.currentTime);
    pg.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    const pf = ctx.createBiquadFilter();
    pf.type = 'lowpass';
    pf.frequency.setValueAtTime(1200, ctx.currentTime);
    pad.connect(pf);
    pf.connect(pg);
    pg.connect(ctx.destination);
    pad.start(ctx.currentTime);
    pad.stop(ctx.currentTime + 0.8);
  }

  xpTick() {
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, ctx.currentTime);
    g.gain.setValueAtTime(0.025 * this.volume, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.06);
  }

  pointScored() {
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(880, ctx.currentTime + 0.25);
    g.gain.setValueAtTime(0.08 * this.volume, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.25);
  }
}

export const soundManager = new SoundManager();
