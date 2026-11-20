import { pitch } from './mic';

/** In-place radix-2 FFT (re, im of length 2^k). */
function fft(re: Float64Array, im: Float64Array) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j], re[i]];
      [im[i], im[j]] = [im[j], im[i]];
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len;
    const wr = Math.cos(ang), wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let cr = 1, ci = 0;
      for (let j = 0; j < len / 2; j++) {
        const ar = re[i + j], ai = im[i + j];
        const br = re[i + j + len / 2] * cr - im[i + j + len / 2] * ci;
        const bi = re[i + j + len / 2] * ci + im[i + j + len / 2] * cr;
        re[i + j] = ar + br;
        im[i + j] = ai + bi;
        re[i + j + len / 2] = ar - br;
        im[i + j + len / 2] = ai - bi;
        const t = cr * wr - ci * wi;
        ci = cr * wi + ci * wr;
        cr = t;
      }
    }
  }
}

export interface Spectrogram {
  /** frames x bands, values 0..1 (log magnitude). */
  frames: Float32Array[];
  bands: number;
  /** Median F0 of the voiced frames (Hz) and duration (s). */
  f0: number;
  seconds: number;
}

/** Linear-frequency spectrogram (fmin..fmax) of a recording, plus its median pitch. */
export function spectrogram(x: Float32Array, sr: number, bands = 72, fmin = 60, fmax = 2400): Spectrogram {
  const N = 4096, hop = Math.round(sr / 40);
  const win = new Float64Array(N);
  for (let i = 0; i < N; i++) win[i] = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (N - 1));
  const frames: Float32Array[] = [];
  const re = new Float64Array(N), im = new Float64Array(N);
  let peak = 1e-9;
  const raw: Float32Array[] = [];
  for (let s = 0; s + N <= x.length; s += hop) {
    for (let i = 0; i < N; i++) {
      re[i] = x[s + i] * win[i];
      im[i] = 0;
    }
    fft(re, im);
    const out = new Float32Array(bands);
    for (let b = 0; b < bands; b++) {
      const f0 = fmin + ((fmax - fmin) * b) / bands;
      const f1 = fmin + ((fmax - fmin) * (b + 1)) / bands;
      const k0 = Math.floor((f0 / sr) * N), k1 = Math.max(k0 + 1, Math.ceil((f1 / sr) * N));
      let m = 0;
      for (let k = k0; k < k1; k++) m = Math.max(m, Math.hypot(re[k], im[k]));
      out[b] = m;
      peak = Math.max(peak, m);
    }
    raw.push(out);
  }
  for (const r of raw) {
    const o = new Float32Array(bands);
    for (let b = 0; b < bands; b++) o[b] = Math.max(0, 1 + (20 * Math.log10(r[b] / peak + 1e-9)) / 55);
    frames.push(o);
  }
  // Median pitch over voiced frames.
  const f0s: number[] = [];
  const fr = new Float32Array(2048);
  for (let s = 0; s + 2048 <= x.length; s += 2048) {
    fr.set(x.subarray(s, s + 2048));
    const f = pitch(fr, sr);
    if (f > 0) f0s.push(f);
  }
  f0s.sort((a, b) => a - b);
  return { frames, bands, f0: f0s.length ? f0s[Math.floor(f0s.length / 2)] : 0, seconds: x.length / sr };
}
