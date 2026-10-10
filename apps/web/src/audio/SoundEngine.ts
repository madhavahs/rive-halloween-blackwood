/**
 * BLACKWOOD SURVEILLANCE TERMINAL - PROCEDURAL WEB AUDIO SYNTHESIZER
 * Zero external audio files: guaranteed 0ms latency, zero 404s, works offline.
 * Synthesizes ambient horror drone, mechanical camera relay clicks,
 * static feed bursts, and climactic dissonant stingers.
 */

export interface SoundEngineOptions {
  initialMuted?: boolean;
  masterVolume?: number;
}

export class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;
  private isUnlocked: boolean = false;

  // Ambient drone nodes
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private droneFilter: BiquadFilterNode | null = null;
  private droneGain: GainNode | null = null;

  constructor(options: SoundEngineOptions = {}) {
    this.isMuted = options.initialMuted ?? false;
  }

  /**
   * Initialize or resume the AudioContext upon user interaction.
   * Browsers require a user gesture before playing audio.
   */
  public async unlock(): Promise<boolean> {
    const scope = typeof window !== "undefined" ? window : (typeof globalThis !== "undefined" ? globalThis : null);
    if (!scope) return false;

    try {
      const AudioContextClass =
        (scope as unknown as { AudioContext?: typeof AudioContext }).AudioContext ||
        (scope as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return false;

      if (!this.ctx) {
        this.ctx = new AudioContextClass();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.8, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }

      if (this.ctx.state === "suspended") {
        await this.ctx.resume();
      }

      this.isUnlocked = this.ctx.state === "running";
      if (this.isUnlocked && !this.droneGain) {
        this.startAmbientDrone();
      }
      return this.isUnlocked;
    } catch {
      return false;
    }
  }

  public getUnlocked(): boolean {
    return this.isUnlocked;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 0.8, now, 0.05);
    }
  }

  /**
   * Start low-frequency binaural ambient drone (sub-bass oscillation 48Hz + 52Hz).
   */
  private startAmbientDrone(): void {
    if (!this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;

      // Low-pass filter to keep drone dark and subterranean
      this.droneFilter = this.ctx.createBiquadFilter();
      this.droneFilter.type = "lowpass";
      this.droneFilter.frequency.setValueAtTime(100, now);
      this.droneFilter.Q.setValueAtTime(3.0, now);

      this.droneGain = this.ctx.createGain();
      this.droneGain.gain.setValueAtTime(0.08, now);

      // Osc 1: 48Hz Sawtooth (dark low rumble)
      this.droneOsc1 = this.ctx.createOscillator();
      this.droneOsc1.type = "sawtooth";
      this.droneOsc1.frequency.setValueAtTime(48, now);

      // Osc 2: 52Hz Sine (creates a 4Hz binaural beat pulse)
      this.droneOsc2 = this.ctx.createOscillator();
      this.droneOsc2.type = "sine";
      this.droneOsc2.frequency.setValueAtTime(52, now);

      this.droneOsc1.connect(this.droneFilter);
      this.droneOsc2.connect(this.droneFilter);
      this.droneFilter.connect(this.droneGain);
      this.droneGain.connect(this.masterGain);

      this.droneOsc1.start();
      this.droneOsc2.start();
    } catch {
      // Audio node failure fallback
    }
  }

  /**
   * Modulate drone intensity as horror mounts.
   * @param tension 0.0 (calm normal state) to 1.0 (climax/entity tracking)
   */
  public setTension(tension: number): void {
    if (!this.ctx || !this.droneFilter || !this.droneGain) return;

    const clampedTension = Math.max(0, Math.min(1, tension));
    const now = this.ctx.currentTime;

    // Filter opens from 100Hz up to 260Hz, gain swells from 0.08 to 0.22
    const targetFreq = 100 + clampedTension * 160;
    const targetGain = 0.08 + clampedTension * 0.14;

    this.droneFilter.frequency.setTargetAtTime(targetFreq, now, 0.4);
    this.droneGain.gain.setTargetAtTime(targetGain, now, 0.4);
  }

  /**
   * Mechanical relay click when switching cameras.
   */
  public playCameraSwitch(): void {
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;

      // 1. High frequency mechanical switch snap
      const snapOsc = this.ctx.createOscillator();
      const snapGain = this.ctx.createGain();

      snapOsc.type = "triangle";
      snapOsc.frequency.setValueAtTime(1400, now);
      snapOsc.frequency.exponentialRampToValueAtTime(120, now + 0.03);

      snapGain.gain.setValueAtTime(0.2, now);
      snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      snapOsc.connect(snapGain);
      snapGain.connect(this.masterGain);

      snapOsc.start(now);
      snapOsc.stop(now + 0.04);

      // 2. Low electromagnetic relay clunk
      const clunkOsc = this.ctx.createOscillator();
      const clunkGain = this.ctx.createGain();

      clunkOsc.type = "sine";
      clunkOsc.frequency.setValueAtTime(95, now);
      clunkOsc.frequency.exponentialRampToValueAtTime(35, now + 0.05);

      clunkGain.gain.setValueAtTime(0.35, now);
      clunkGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      clunkOsc.connect(clunkGain);
      clunkGain.connect(this.masterGain);

      clunkOsc.start(now);
      clunkOsc.stop(now + 0.07);
    } catch {
      // Audio error catch
    }
  }

  /**
   * Tactile switch click when toggling flashlight.
   */
  public playFlashlightClick(): void {
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "square";
      osc.frequency.setValueAtTime(2200, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.015);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.025);
    } catch {
      // Audio error catch
    }
  }

  /**
   * Glitch white noise burst with bandpass sweep.
   */
  public playGlitchStatic(duration = 0.25, intensity = 0.4): void {
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      const bufferSize = Math.floor(this.ctx.sampleRate * duration);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Fill buffer with random noise
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.exponentialRampToValueAtTime(2400, now + duration);
      filter.Q.setValueAtTime(1.5, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(intensity, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noiseSource.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      noiseSource.start(now);
      noiseSource.stop(now + duration);
    } catch {
      // Audio error catch
    }
  }

  /**
   * Violent horror stinger for FINAL REVEAL:
   * Dissonant cluster chords + sub-bass frequency drop + harsh noise burst.
   */
  public playFinalRevealStinger(): void {
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      const duration = 2.4;

      // 1. Dissonant sawtooth cluster (minor seconds and tritone: 55Hz, 58Hz, 82.4Hz)
      const frequencies = [55, 58.27, 82.41, 116.54];
      frequencies.forEach((freq) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.7, now + duration);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + duration);
      });

      // 2. Sub-bass boom drop (180Hz -> 28Hz)
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();

      subOsc.type = "sine";
      subOsc.frequency.setValueAtTime(180, now);
      subOsc.frequency.exponentialRampToValueAtTime(28, now + 1.2);

      subGain.gain.setValueAtTime(0.6, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

      subOsc.connect(subGain);
      subGain.connect(this.masterGain);

      subOsc.start(now);
      subOsc.stop(now + 1.6);

      // 3. Accompanying noise surge
      this.playGlitchStatic(0.8, 0.7);
    } catch {
      // Audio error catch
    }
  }

  /**
   * Procedural rhythmic heartbeat thud ("lub-dub") responding to player panic.
   */
  public playHeartbeat(volume = 0.4): void {
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      // First beat: Lub
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(62, now);
      osc1.frequency.exponentialRampToValueAtTime(32, now + 0.12);

      gain1.gain.setValueAtTime(volume * 0.7, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc1.connect(gain1);
      gain1.connect(this.masterGain);
      osc1.start(now);
      osc1.stop(now + 0.15);

      // Second beat: Dub (180ms later)
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(54, now + 0.18);
      osc2.frequency.exponentialRampToValueAtTime(28, now + 0.32);

      gain2.gain.setValueAtTime(volume, now + 0.18);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.34);

      osc2.connect(gain2);
      gain2.connect(this.masterGain);
      osc2.start(now + 0.18);
      osc2.stop(now + 0.35);
    } catch {
      // Audio error catch
    }
  }

  /**
   * Sinister demon growl / guttural rumble.
   */
  public playDemonGrowl(): void {
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(42, now);
      osc.frequency.linearRampToValueAtTime(32, now + 0.6);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(140, now);
      filter.Q.setValueAtTime(4.0, now);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.75);
    } catch {
      // Audio error catch
    }
  }

  /**
   * Eerie ghostly whisper formant sweep.
   */
  public playWhisper(): void {
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      const duration = 0.8;
      const bufferSize = Math.floor(this.ctx.sampleRate * duration);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(1200, now);
      filter.frequency.exponentialRampToValueAtTime(600, now + duration);
      filter.Q.setValueAtTime(5.0, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noiseSource.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      noiseSource.start(now);
      noiseSource.stop(now + duration);
    } catch {
      // Audio error catch
    }
  }

  /**
   * Clean up and close audio context.
   */
  public dispose(): void {
    try {
      this.droneOsc1?.stop();
      this.droneOsc2?.stop();
      this.ctx?.close();
    } catch {
      // Audio dispose catch
    } finally {
      this.ctx = null;
      this.masterGain = null;
      this.droneGain = null;
      this.droneFilter = null;
      this.droneOsc1 = null;
      this.droneOsc2 = null;
      this.isUnlocked = false;
    }
  }
}

// Global singleton instance for easy cross-component access
export const soundEngine = new SoundEngine();
