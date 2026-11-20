import { smoothstep } from './math';
import { put } from './paint';

/**
 * A shape writes N points (design-space x, y) into `out` for time `t` (s).
 * Shapes are evaluated every frame, so they can be alive (breathing, vibrating).
 * The wave engine morphs between any two shapes point by point.
 */
export type ShapeFn = (out: Float32Array, n: number, t: number, layer: number) => void;

export interface WaveParams {
  /** Left and right ends of the thread, design px. */
  x0?: number;
  x1?: number;
  /** Baseline, design px from top. */
  y?: number;
  /** Peak amplitude in px. */
  amp?: number;
  /** Speed multiplier for the motion of the wave. */
  speed?: number;
  /** 0..1 position along the line after which the voice goes quiet. */
  quietFrom?: number;
  /** Width (0..1) of the quiet fade. */
  quietSoftness?: number;
  /** Residual amplitude inside the quiet zone (0..1). */
  quietLevel?: number;
}

/** The living voice: a sum of slow harmonics under an edge envelope. */
export function wave(p: WaveParams = {}): ShapeFn {
  const x0 = p.x0 ?? -40;
  const x1 = p.x1 ?? 1960;
  const y = p.y ?? 702;
  const amp = p.amp ?? 34;
  const speed = p.speed ?? 1;
  const qf = p.quietFrom ?? 2;
  const qs = p.quietSoftness ?? 0.18;
  const ql = p.quietLevel ?? 0.08;
  return (out, n, t, layer) => {
    const ts = t * speed;
    // Echo layers drift slightly out of phase and scale for depth.
    const ph = layer * 0.9;
    const sc = layer === 0 ? 1 : layer === 1 ? 0.82 : 1.14;
    const breathe = 0.82 + 0.18 * Math.sin(ts * 0.55 + ph * 0.3);
    for (let i = 0; i < n; i++) {
      const u = i / (n - 1);
      const env = smoothstep(0, 0.2, u) * smoothstep(1, 0.8, u);
      const quiet = 1 - (1 - ql) * smoothstep(qf, qf + qs, u);
      // A soft "packet" travelling left to right gives the wave a speaking rhythm.
      const packet = 0.65 + 0.35 * Math.sin(u * 5.2 - ts * 0.9 + ph);
      const f =
        0.56 * Math.sin(u * Math.PI * 2 * 1.55 + ts * 1.05 + ph) +
        0.3 * Math.sin(u * Math.PI * 2 * 3.6 - ts * 1.6 + 1.3 + ph * 1.7) +
        0.14 * Math.sin(u * Math.PI * 2 * 8.3 + ts * 2.7 + ph * 2.3);
      out[i * 2] = x0 + (x1 - x0) * u;
      out[i * 2 + 1] = y - amp * sc * env * quiet * breathe * packet * f;
    }
  };
}

/** Every point collapsed onto one spot (the spark before the voice is born). */
export function dot(x = 1180, y = 702): ShapeFn {
  return (out, n) => {
    for (let i = 0; i < n; i++) {
      out[i * 2] = x + (i / (n - 1) - 0.5) * 0.5;
      out[i * 2 + 1] = y;
    }
  };
}

/** Per-point colour along the thread. Returns [r,g,b] in linear 0..1 via `out`. */
export type ColorFn = (out: Float32Array, n: number) => void;

/** Cheap deterministic value noise in 1D (smooth). */
function vnoise(x: number, seed = 0) {
  const i = Math.floor(x), f = x - i;
  const h = (k: number) => {
    const s = Math.sin((k + seed * 57.13) * 127.1) * 43758.5453;
    return s - Math.floor(s);
  };
  const u = f * f * (3 - 2 * f);
  return h(i) * (1 - u) + h(i + 1) * u;
}

/**
 * Extreme close-up of the voice: a thick thread vibrating like a vocal cord
 * (standing modes plus a fine buzz).
 */
export function cord(p: { y?: number; amp?: number; x0?: number; x1?: number } = {}): ShapeFn {
  const y = p.y ?? 540, amp = p.amp ?? 90, x0 = p.x0 ?? -60, x1 = p.x1 ?? 1980;
  return (out, n, t, layer) => {
    const ph = layer * 0.7;
    for (let i = 0; i < n; i++) {
      const u = i / (n - 1);
      const env = Math.sin(Math.PI * u);
      const v =
        0.62 * Math.sin(Math.PI * u * 3) * Math.sin(t * 5.3 + ph) +
        0.28 * Math.sin(Math.PI * u * 5) * Math.sin(t * 8.1 + 1.1 + ph) +
        0.1 * Math.sin(Math.PI * u * 9) * Math.sin(t * 13.7 + 2.3 + ph);
      const buzz = Math.sin(u * 120 + t * 24 + ph) * 0.022;
      out[i * 2] = x0 + (x1 - x0) * u;
      out[i * 2 + 1] = y - amp * env * (v + buzz) * (layer === 0 ? 1 : 0.9);
    }
  };
}

/**
 * `count` short voices stacked in rows. Rows listed in `shaky` tremble,
 * break up and lose energy; the others stay clean. Points between rows are
 * bridges (hide them with zero-intensity colour stops, see rowStops).
 */
export function rows(p: {
  count?: number;
  x0?: number;
  x1?: number;
  y0?: number;
  gap?: number;
  amp?: number;
  shaky?: (row: number) => boolean;
}): ShapeFn {
  const count = p.count ?? 10, x0 = p.x0 ?? 1000, x1 = p.x1 ?? 1780;
  const y0 = p.y0 ?? 260, gap = p.gap ?? 62, amp = p.amp ?? 14;
  const shaky = p.shaky ?? (() => false);
  return (out, n, t, layer) => {
    const per = n / count;
    for (let i = 0; i < n; i++) {
      const r = Math.min(count - 1, Math.floor(i / per));
      const u = (i - r * per) / (per - 1);
      const uu = Math.min(1, Math.max(0, u));
      const env = Math.sin(Math.PI * uu);
      const ph = r * 1.7 + layer * 0.6;
      let v = Math.sin(uu * Math.PI * 2 * 2.2 + t * 1.6 + ph) * 0.7 + Math.sin(uu * Math.PI * 2 * 5.1 - t * 2.3 + ph) * 0.3;
      if (shaky(r)) {
        // Tremor (fast jitter), shimmer (uneven loudness) and dropouts (pauses).
        const jitter = (vnoise(uu * 34 + t * 7, r) - 0.5) * 1.1 + (vnoise(uu * 13 - t * 3, r + 7) - 0.5) * 0.5;
        const shimmer = 0.55 + 0.45 * vnoise(uu * 6 + t * 0.9, r + 20);
        const gate = vnoise(uu * 3.2 - t * 0.35, r + 40) > 0.28 ? 1 : 0.12;
        v = (v * 0.75 + jitter) * shimmer * gate;
      }
      out[i * 2] = x0 + (x1 - x0) * uu;
      out[i * 2 + 1] = y0 + r * gap - amp * env * v;
    }
  };
}

/**
 * The voice between two visits: alive before the first visit and after the
 * second, silent (flat) in between. Optional `spike` erupts at u = spike.at
 * after `spike.after` seconds (the emergency nobody saw coming).
 */
export function timeline(p: {
  y?: number;
  amp?: number;
  a: number; // u of the first visit
  b: number; // u of the next visit
  spike?: { at: number; t0: number; after: number };
}): ShapeFn {
  const base = wave({ y: p.y, amp: p.amp ?? 46 });
  const y = p.y ?? 702;
  return (out, n, t, layer) => {
    base(out, n, t, layer);
    for (let i = 0; i < n; i++) {
      const u = i / (n - 1);
      const inGap = smoothstep(p.a - 0.01, p.a + 0.05, u) * (1 - smoothstep(p.b - 0.05, p.b + 0.01, u));
      let yy = out[i * 2 + 1];
      yy = y + (yy - y) * (1 - 0.94 * inGap);
      if (p.spike) {
        const k = t - p.spike.t0 - p.spike.after;
        if (k > 0) {
          const du = (u - p.spike.at) / 0.016;
          const pulse = Math.exp(-du * du) * Math.min(1, k * 1.6) * (0.8 + 0.2 * Math.sin(t * 5));
          yy -= pulse * 110 * (layer === 0 ? 1 : 0.7) * Math.sin(du * 5.2 + t * 6);
        }
      }
      out[i * 2 + 1] = yy;
    }
  };
}

export interface StackRow {
  y: number;
  x0: number;
  x1: number;
  amp: number;
  /** Signal in −1…1 for position u (0…1 along the row) at time t. */
  fn: (u: number, t: number, layer: number) => number;
}

/** Several independent voices stacked as rows (bridges hidden by paintRows). */
export function stack(list: StackRow[]): ShapeFn {
  const count = list.length;
  return (out, n, t, layer) => {
    const per = n / count;
    for (let i = 0; i < n; i++) {
      const r = Math.min(count - 1, Math.floor(i / per));
      const row = list[r];
      const u = Math.min(1, Math.max(0, (i - r * per) / (per - 1)));
      const env = smoothstep(0, 0.06, u) * smoothstep(1, 0.94, u);
      out[i * 2] = row.x0 + (row.x1 - row.x0) * u;
      out[i * 2 + 1] = row.y - row.amp * env * row.fn(u, t, layer);
    }
  };
}

/** The three daily activities as signals. */
export const voices = {
  /** Hold an "aah": one steady, sustained tone. */
  aah: (u: number, t: number, l: number) => Math.sin(u * Math.PI * 2 * 11 + t * 3.2 + l * 0.5) * (0.82 + 0.1 * Math.sin(t * 0.8)),
  /** Read a line: seven words, seven bursts with short pauses. */
  read: (u: number, t: number, l: number) => {
    const words = 7;
    const w = u * words;
    const k = w - Math.floor(w);
    const burst = k < 0.78 ? Math.pow(Math.sin(Math.PI * (k / 0.78)), 1.5) : 0;
    const loud = 0.65 + 0.35 * vnoise(Math.floor(w) * 3.1, 9);
    return burst * loud * Math.sin(u * Math.PI * 2 * 17 + t * 4.4 + l * 0.6);
  },
  /** Chat a little: free conversation, uneven rhythm and natural pauses. */
  chat: (u: number, t: number, l: number) => {
    const env = Math.max(0, vnoise(u * 6.5 - t * 0.25, 3) * 1.5 - 0.35);
    return env * Math.sin(u * Math.PI * 2 * 19 + t * 3.8 + l * 0.6 + 2 * vnoise(u * 9, 5));
  },
};

/**
 * Between two visits, a small check-in every day: the silent gap of the
 * timeline is filled with regular pulses.
 */
export function daily(p: { y?: number; a: number; b: number; days?: number; amp?: number }): ShapeFn {
  const base = wave({ y: p.y, amp: 46 });
  const y = p.y ?? 702;
  const days = p.days ?? 30;
  const amp = p.amp ?? 34;
  return (out, n, t, layer) => {
    base(out, n, t, layer);
    for (let i = 0; i < n; i++) {
      const u = i / (n - 1);
      const inGap = smoothstep(p.a - 0.01, p.a + 0.05, u) * (1 - smoothstep(p.b - 0.05, p.b + 0.01, u));
      if (inGap <= 0) continue;
      const k = ((u - p.a) / (p.b - p.a)) * days;
      const f = k - Math.floor(k);
      const g = (f - 0.5) / 0.16;
      const beat = Math.exp(-g * g) * Math.sin((f - 0.5) * 15 + Math.sin(t * 1.6 + Math.floor(k)) * 0.6 + layer * 0.4);
      const live = y + (out[i * 2 + 1] - y) * 0.15 - beat * amp * (0.8 + 0.2 * Math.sin(t * 1.3 + Math.floor(k)));
      out[i * 2 + 1] = out[i * 2 + 1] * (1 - inGap) + live * inGap;
    }
  };
}

/**
 * The live microphone drawn as the thread. Falls back to a calm breathing
 * wave when the mic is off, so the line never dies on stage.
 */
export function live(p: { y?: number; gain?: number; source: () => Float32Array | null; tick?: () => void }): ShapeFn {
  const y = p.y ?? 702, gain = p.gain ?? 300;
  const idle = wave({ y, amp: 30 });
  return (out, n, t, layer) => {
    if (layer === 0) p.tick?.();
    const buf = p.source();
    if (!buf) return idle(out, n, t, layer);
    const m = buf.length;
    for (let i = 0; i < n; i++) {
      const u = i / (n - 1);
      const env = smoothstep(0, 0.12, u) * smoothstep(1, 0.88, u);
      const v = buf[Math.min(m - 1, Math.floor(u * (m - 1)))];
      out[i * 2] = -40 + 2000 * u;
      out[i * 2 + 1] = y - Math.max(-1, Math.min(1, v * (layer === 0 ? 1 : 0.8))) * gain * env;
    }
  };
}

/**
 * María's daily voice score on a timeline. Days map to x; the score stays
 * inside her personal band, then drifts out and crosses it on `alertDay`.
 * After the alert the thread continues flat (to be painted as a dashed "no data" line).
 */
export function trend(p: {
  x: (day: number) => number;
  y: (score: number) => number;
  from: number;
  alertDay: number;
  to: number;
  /** Fraction of the points used for the measured part. */
  split?: number;
}): ShapeFn {
  const split = p.split ?? 0.62;
  const score = (d: number, t: number) => {
    const noise = (vnoise(d * 0.42, 11) - 0.5) * 0.85 + (vnoise(d * 1.05 + t * 0.12, 12) - 0.5) * 0.3;
    const drift = d > 3 ? Math.pow((d - 3) / (p.alertDay - 3), 1.6) * 1.55 : 0;
    return noise - drift;
  };
  return (out, n, t) => {
    const m = Math.floor(n * split);
    const end = score(p.alertDay, t);
    for (let i = 0; i < n; i++) {
      let d: number, s: number;
      if (i < m) {
        d = p.from + ((p.alertDay - p.from) * i) / (m - 1);
        s = score(d, t);
      } else {
        d = p.alertDay + ((p.to - p.alertDay) * (i - m + 1)) / (n - m);
        s = end;
      }
      out[i * 2] = p.x(d);
      out[i * 2 + 1] = p.y(s);
    }
  };
}

/** A breathing ring of light (the thread closed on itself). */
export function ring(p: { cx: number; cy: number; r: number; ripple?: number; lobes?: number }): ShapeFn {
  const ripple = p.ripple ?? 8, lobes = p.lobes ?? 5;
  return (out, n, t, layer) => {
    for (let i = 0; i < n; i++) {
      const a = (i / (n - 1)) * Math.PI * 2 - Math.PI / 2;
      const rr = p.r + ripple * Math.sin(a * lobes + t * 0.9 + layer * 0.8) + (layer ? layer * 3 : 0);
      out[i * 2] = p.cx + Math.cos(a) * rr;
      out[i * 2 + 1] = p.cy + Math.sin(a) * rr;
    }
  };
}

/** Concentric elliptical orbits (bridges hidden with paintRows). */
export function orbits(p: { cx: number; cy: number; radii: number[]; squash?: number; tilt?: number }): ShapeFn {
  const count = p.radii.length, sq = p.squash ?? 0.42, tilt = p.tilt ?? -0.18;
  return (out, n, t) => {
    const per = n / count;
    const ct = Math.cos(tilt), st = Math.sin(tilt);
    for (let i = 0; i < n; i++) {
      const r = Math.min(count - 1, Math.floor(i / per));
      const u = Math.min(1, Math.max(0, (i - r * per) / (per - 1)));
      const a = u * Math.PI * 2 + t * (0.05 + r * 0.02);
      const ex = Math.cos(a) * p.radii[r];
      const ey = Math.sin(a) * p.radii[r] * sq;
      out[i * 2] = p.cx + ex * ct - ey * st;
      out[i * 2 + 1] = p.cy + ex * st + ey * ct;
    }
  };
}

/** Any fixed polyline (design px), resampled evenly along its length, with a gentle shimmer. */
export function path(pts: [number, number][], wobble = 1.5): ShapeFn {
  // cumulative lengths
  const L = [0];
  for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const total = L[L.length - 1];
  return (out, n, t, layer) => {
    let k = 0;
    for (let i = 0; i < n; i++) {
      const d = (i / (n - 1)) * total;
      while (k < pts.length - 2 && L[k + 1] < d) k++;
      const f = (d - L[k]) / Math.max(1e-6, L[k + 1] - L[k]);
      const x = pts[k][0] + (pts[k + 1][0] - pts[k][0]) * f;
      const y = pts[k][1] + (pts[k + 1][1] - pts[k][1]) * f;
      out[i * 2] = x;
      out[i * 2 + 1] = y + Math.sin(i * 0.05 + t * 1.3 + layer) * wobble;
    }
  };
}

/** One voice that splits into two diverging voices (rows 0 and 1, bridge hidden by paintRows). */
export function fork(p: { x0: number; x1: number; y: number; spread: number; at?: number; amp?: number }): ShapeFn {
  const at = p.at ?? 0.22, amp = p.amp ?? 26;
  return (out, n, t, layer) => {
    const per = n / 2;
    for (let i = 0; i < n; i++) {
      const r = i < per ? 0 : 1;
      const u = Math.min(1, Math.max(0, (i - r * per) / (per - 1)));
      const sgn = r === 0 ? -1 : 1;
      const k = smoothstep(at, 1, u);
      const env = smoothstep(0, 0.08, u) * smoothstep(1, 0.9, u);
      const ph = r * 1.9 + layer * 0.7;
      const v = Math.sin(u * Math.PI * 2 * (2.2 + r * 0.6) + t * (1.1 + r * 0.3) + ph) * 0.7 + Math.sin(u * Math.PI * 2 * 5.3 - t * 1.7 + ph) * 0.3;
      out[i * 2] = p.x0 + (p.x1 - p.x0) * u;
      out[i * 2 + 1] = p.y + sgn * p.spread * k * k - amp * env * v * (0.4 + 0.6 * k);
    }
  };
}

/** A flat line with a single heartbeat travelling along it. */
export function heartbeat(p: { y: number; x0?: number; x1?: number; amp?: number; period?: number }): ShapeFn {
  const x0 = p.x0 ?? -40, x1 = p.x1 ?? 1960, amp = p.amp ?? 70, period = p.period ?? 4.2;
  return (out, n, t) => {
    const head = ((t % period) / period) * 1.3 - 0.15;
    for (let i = 0; i < n; i++) {
      const u = i / (n - 1);
      const d = (u - head) / 0.018;
      // PQRST-like blip
      const beat =
        0.12 * Math.exp(-Math.pow(d + 2.2, 2)) -
        0.18 * Math.exp(-Math.pow((d + 0.6) / 0.35, 2)) +
        1.0 * Math.exp(-Math.pow(d / 0.32, 2)) -
        0.32 * Math.exp(-Math.pow((d - 0.7) / 0.4, 2)) +
        0.2 * Math.exp(-Math.pow((d - 2.6) / 0.9, 2));
      out[i * 2] = x0 + (x1 - x0) * u;
      out[i * 2 + 1] = p.y - beat * amp;
    }
  };
}

/**
 * One voice that opens into several strands (S08).
 * Strand 0 = trunk + first branch; strands 1..K-1 start at the split point.
 * With open = 0 every strand lies on the trunk's continuation, so it reads as a
 * single zoomed voice; with open = 1 they fan out to `ys`, each with its own character.
 * Strands run off the right edge: the voice never visibly ends.
 */
export function branches(p: {
  y0: number;
  ys: number[];
  /** Where the strands part, and where they reach their own row. */
  xs: number;
  xr: number;
  open: number;
  /** The zoomed voice, −1…1, at design x and time t. */
  voice: (x: number, t: number) => number;
  /** Each strand's own signal once open, −1…1. */
  character: ((x: number, t: number) => number)[];
  amp?: number;
  ampOpen?: number;
}): ShapeFn {
  const K = p.ys.length;
  const X0 = -40, X1 = 1960;
  const amp = p.amp ?? 70, ampOpen = p.ampOpen ?? 16;
  const trunkLen = p.xs - X0, branchLen = X1 - p.xs;
  const total = trunkLen + K * branchLen;
  // Points per strand, proportional to length.
  const counts: number[] = [];
  return (out, n, t, layer) => {
    if (counts.length === 0) {
      let used = 0;
      for (let k = 0; k < K; k++) {
        const c = k === K - 1 ? n - used : Math.round((n * (k === 0 ? trunkLen + branchLen : branchLen)) / total);
        counts.push(c);
        used += c;
      }
    }
    const ph = layer * 0.6;
    let i = 0;
    for (let k = 0; k < K; k++) {
      const c = counts[k];
      const xa = k === 0 ? X0 : p.xs;
      for (let j = 0; j < c; j++, i++) {
        const x = xa + ((X1 - xa) * j) / Math.max(1, c - 1);
        // How far along the branch (0 at the split, 1 once on its own row).
        const b = smoothstep(p.xs, p.xr, x);
        const yRow = p.y0 + (p.ys[k] - p.y0) * b * p.open;
        const v = p.voice(x, t + ph * 0.1);
        const own = p.character[k](x, t + ph * 0.1);
        // Before the split: the voice. After: it hands over to the strand's character.
        const mix = p.open * smoothstep(p.xs - 120, p.xs + (p.xr - p.xs) * 0.7, x);
        const a = amp * (1 - mix) + ampOpen * mix;
        const sig = v * (1 - mix) + own * mix;
        out[i * 2] = x;
        out[i * 2 + 1] = yRow - a * sig * (layer === 0 ? 1 : 0.9);
      }
    }
  };
}

/** Paint for `branches`: the joins between strands are invisible. */
export function paintBranches(K: number, n: number, xs: number, look: (k: number) => [string, number]) {
  const X0 = -40, X1 = 1960;
  const trunkLen = xs - X0, branchLen = X1 - xs;
  const total = trunkLen + K * branchLen;
  return (out: Float32Array) => {
    let i = 0;
    let used = 0;
    for (let k = 0; k < K; k++) {
      const c = k === K - 1 ? n - used : Math.round((n * (k === 0 ? trunkLen + branchLen : branchLen)) / total);
      used += c;
      const [hex, kk] = look(k);
      for (let j = 0; j < c; j++, i++) {
        const edge = j < 2 || j >= c - 2;
        // New strands fade in from the split so the node doesn't flare.
        const fadeIn = k === 0 ? 1 : Math.min(1, j / (c * 0.14)) ** 1.5;
        put(out, i, hex, edge ? 0 : kk * fadeIn);
      }
    }
  };
}
