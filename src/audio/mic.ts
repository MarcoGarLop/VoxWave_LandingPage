/**
 * Live microphone for the demo slide: waveform, a real F0 (pitch) estimate by
 * autocorrelation, loudness, and a rolling recording of the last seconds so the
 * jury's own "aah" can become the spectrogram of the next slide.
 * Nothing leaves the laptop.
 */

const RING_SECONDS = 8;

class Mic {
  ctx: AudioContext | null = null;
  analyser: AnalyserNode | null = null;
  private stream: MediaStream | null = null;
  private time = new Float32Array(2048);
  private ring = new Float32Array(1);
  private ringPos = 0;
  private proc: ScriptProcessorNode | null = null;
  sampleRate = 48000;
  active = false;
  /** Smoothed outputs, updated by `tick()`. */
  level = 0;
  f0 = 0;
  voiced = false;

  async start() {
    if (this.active) return true;
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
    } catch {
      return false;
    }
    this.ctx = new AudioContext();
    this.sampleRate = this.ctx.sampleRate;
    const src = this.ctx.createMediaStreamSource(this.stream);
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0;
    src.connect(this.analyser);
    this.time = new Float32Array(this.analyser.fftSize);
    // Rolling recording (ScriptProcessor is deprecated but universally available and simple).
    this.ring = new Float32Array(Math.round(this.sampleRate * RING_SECONDS));
    this.proc = this.ctx.createScriptProcessor(2048, 1, 1);
    this.proc.onaudioprocess = (e) => {
      const d = e.inputBuffer.getChannelData(0);
      for (let i = 0; i < d.length; i++) {
        this.ring[this.ringPos] = d[i];
        this.ringPos = (this.ringPos + 1) % this.ring.length;
      }
    };
    src.connect(this.proc);
    this.proc.connect(this.ctx.destination); // required for onaudioprocess in Chrome; output is silent
    this.active = true;
    return true;
  }

  stop() {
    this.stream?.getTracks().forEach((t) => t.stop());
    this.proc?.disconnect();
    this.ctx?.close();
    this.ctx = null;
    this.analyser = null;
    this.active = false;
    this.level = 0;
    this.f0 = 0;
    this.voiced = false;
  }

  /** Latest time-domain frame (−1…1). */
  frame() {
    if (this.analyser) this.analyser.getFloatTimeDomainData(this.time);
    return this.time;
  }

  /** Update level and pitch; call once per animation frame. */
  tick() {
    if (!this.analyser) return;
    const x = this.frame();
    let rms = 0;
    for (let i = 0; i < x.length; i++) rms += x[i] * x[i];
    rms = Math.sqrt(rms / x.length);
    this.level += (Math.min(1, rms * 6) - this.level) * 0.25;
    const f = rms > 0.012 ? pitch(x, this.sampleRate) : 0;
    this.voiced = f > 0;
    if (f > 0) this.f0 = this.f0 > 0 ? this.f0 + (f - this.f0) * 0.25 : f;
  }

  /** The loudest ~3 s of the last seconds (the "aah"), oldest → newest. */
  recording(seconds = 3): Float32Array | null {
    if (!this.active) return null;
    const n = this.ring.length;
    const lin = new Float32Array(n);
    for (let i = 0; i < n; i++) lin[i] = this.ring[(this.ringPos + i) % n];
    const win = Math.round(this.sampleRate * seconds);
    // Find the window with the most energy.
    const hop = Math.round(this.sampleRate * 0.1);
    let best = 0, bestE = -1;
    for (let s = 0; s + win <= n; s += hop) {
      let e = 0;
      for (let i = s; i < s + win; i += 8) e += lin[i] * lin[i];
      if (e > bestE) {
        bestE = e;
        best = s;
      }
    }
    return bestE > 1e-3 ? lin.slice(best, best + win) : null;
  }
}

/** Fundamental frequency by normalised autocorrelation (70–450 Hz). 0 if unvoiced. */
export function pitch(x: Float32Array, sr: number) {
  const minLag = Math.floor(sr / 450);
  const maxLag = Math.min(x.length - 1, Math.floor(sr / 70));
  let bestLag = 0, best = 0;
  let e0 = 0;
  for (let i = 0; i < x.length; i++) e0 += x[i] * x[i];
  if (e0 < 1e-6) return 0;
  let prev = 0, rising = false;
  for (let lag = minLag; lag <= maxLag; lag++) {
    let c = 0, e1 = 0;
    for (let i = 0; i + lag < x.length; i++) {
      c += x[i] * x[i + lag];
      e1 += x[i + lag] * x[i + lag];
    }
    const r = c / Math.sqrt(e0 * e1 + 1e-12);
    if (r > prev) rising = true;
    // First strong peak after the curve starts rising wins (avoids octave errors).
    if (rising && r < prev && prev > 0.55 && prev > best) {
      best = prev;
      bestLag = lag - 1;
      break;
    }
    prev = r;
  }
  return bestLag > 0 ? sr / bestLag : 0;
}

export const mic = new Mic();

/**
 * A synthetic sustained "aah" (≈ 190 Hz, natural jitter/shimmer, a few
 * harmonics). Used for the spectrogram when no microphone was available.
 */
export function syntheticAah(sr = 48000, seconds = 3) {
  const n = Math.round(sr * seconds);
  const out = new Float32Array(n);
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    const f = 190 * (1 + 0.012 * Math.sin(t * 5.1) + 0.004 * Math.sin(t * 23));
    ph += (2 * Math.PI * f) / sr;
    const env = Math.min(1, t / 0.15) * Math.min(1, (seconds - t) / 0.25);
    const amp = 0.5 * (1 + 0.05 * Math.sin(t * 7.3));
    let s = 0;
    const form = [1, 0.8, 0.9, 0.55, 0.35, 0.42, 0.3, 0.18, 0.12, 0.08];
    for (let h = 1; h <= form.length; h++) s += (form[h - 1] / h) * Math.sin(ph * h + h);
    out[i] = s * amp * env * 0.6;
  }
  return out;
}

/** The last "aah" captured live (or null). Set when leaving the demo slide. */
export const captured: { aah: Float32Array | null; sr: number } = { aah: null, sr: 48000 };
