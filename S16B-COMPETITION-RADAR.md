# S16B · Competition radar ("Daily, or for everyone. Never both." → "Only VoxWave.")

New slide for criterion 3.2 (existing alternatives & advantages). Recreate it **literally**: the full source is at the end of this document. Copy it as `src/slides/S16B.tsx`. Nothing else in the repo needs to change: `import.meta.glob('./S*.tsx')` in `src/slides/index.ts` picks it up, and the id `S16B` sorts it right after `S16` (growth) and before `S17`.

## What it is

The sonar from the video pitch (around second 130), rebuilt on the axes of `VoxWave_competitive_landscape_en.png`:

- **X axis:** how often the disease is measured. **Y axis:** who can actually use it.
- A sweep turns and finds each alternative as a signal, in the same positions as in the PNG.
- The last signal it finds is VoxWave, alone in the empty quadrant.

No criterion labels appear on screen.

**Build 0 (13 s, auto-advances)**

- **Headline (left, 72 px, top 112):** "Daily, or for everyone." (ink-60) / "Never both." (paper). When VoxWave is found, "Until now." appears in coral.
- **Radar** (centre 1200,590, r 360):
  - 4 dotted range rings and 72 outer ticks.
  - A coral sweep line with a 42° fading wedge, starting at 60° and turning counter-clockwise at 40°/s from t = 1.2 s.
- **Axes:** thin lines through the centre. Labels (mono 17, uppercase, ink-60):
  - X axis, above the line: "One-off snapshot" (left), "Daily, at home" (right).
  - Y axis: "Anyone · one button · Spanish" (top), "Needs a phone, watch or clinic" (bottom).
- **Signals.** Positions are 0..1 with y up, mapped onto a square of half-width 0.92·r. Each competitor is a grey disk that flashes and emits one expanding ping when the sweep passes it, then shows its label (Sora 24 + Inter 19):

  | Signal | Description | x | y |
  |---|---|---|---|
  | Tucuvi | Phone calls, asks questions | 0.38 | 0.80 |
  | Neurologist visit | Every ~6 months | 0.10 | 0.40 |
  | Canary Speech | Voice API, English | 0.22 | 0.22 |
  | STAT-ON | Belt sensor, worn for days | 0.62 | 0.35 |
  | Rune Labs | Apple Watch + iPhone | 0.86 | 0.15 |
  | **VoxWave** | 3 min of voice a day | 0.86 | 0.83 |

- **VoxWave is found last** (≈ 9.75 s):
  - It becomes a coral disk that breathes and keeps emitting 3 coral ripples.
  - Its label is Sora 36 coral.
  - The top-right quadrant gets a dashed coral rounded box with a 6% coral fill and the title "Every patient, every day" (Sora 28 coral, top-right).

**Build 1**

- The radar stays, calm: everything is found, the sweep keeps turning at low alpha and competitor labels dim.
- **Headline:** "Only" (paper) + "VoxWave." (coral).
- **Four rows**, each with a 3 px coral bar, a Sora 34 title and an Inter 26 line, entering with a 0.4 s stagger:
  1. **Our own AI model.** Our algorithms, built by us. Not a rented voice API.
  2. **Her own baseline.** Compared only with herself. Sharper every day.
  3. **Spanish first. Any language next.** Same model, new voice data for each language.
  4. **One button.** No phone, no app, no internet. Every day, at home.

**Engine**

- **Wave:** a low quiet thread, `wave({ y: 1010, amp: 14, speed: 0.7 })`, coral, opacity 0.3.
- **Particles:** all drawn by one `ParticleTarget` (`sonar(t0, calm)`), `size 5.2`. Build 1 reuses it with `calm = true`, so everything is already found.
- **Background:** `bg { pool: [0.62, 0.55], poolStrength: 1, warm: 0.5 }`.

**Script (`notes`):** included in the source.

## Full source: `src/slides/S16B.tsx`

```tsx
import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import { C, EASE } from '../brand/tokens';
import type { SlideDef } from '../deck/types';
import { clock } from '../engine/Engine';
import { clamp } from '../engine/math';
import { lin, put } from '../engine/paint';
import type { ParticleTarget } from '../engine/Particles';
import { wave } from '../engine/shapes';
import { At, Words } from '../ui/motion';

/*
 * S16B · The competition, as a sonar (after the radar in the video), on the axes of the
 * competitive landscape: how often the disease is measured × who can actually use it.
 *   Build 0 · "Daily, or for everyone. Never both."  The sweep turns and finds each alternative
 *             in turn. The last signal it finds is VoxWave, alone in the empty quadrant → "Until now."
 *   Build 1 · "Hard to copy."  The radar stays; three reasons it is hard to copy.
 */

const ease = EASE as unknown as [number, number, number, number];
const D2R = Math.PI / 180;
const R = { cx: 1200, cy: 590, r: 360 };
const SPAN = R.r * 0.92; // half-width of the plotted square
const px = (x: number) => R.cx + (x - 0.5) * 2 * SPAN;
const py = (y: number) => R.cy - (y - 0.5) * 2 * SPAN;

// ---------- The sweep ----------
const SWEEP = { start: 1.2, from: 60, speed: 40 }; // deg, deg/s, counter-clockwise (y up)
const WEDGE = 42; // trailing wedge, deg
const sweepDeg = (k: number) => SWEEP.from + SWEEP.speed * Math.max(0, k - SWEEP.start);

// ---------- Signals (positions from the competitive-landscape chart, 0..1 with y up) ----------
interface Sig { name: string; desc: string; x: number; y: number; us?: boolean }
const SIGNALS: Sig[] = [
  { name: 'Tucuvi', desc: 'Phone calls, asks questions', x: 0.38, y: 0.8 },
  { name: 'Neurologist visit', desc: 'Every ~6 months', x: 0.1, y: 0.4 },
  { name: 'Canary Speech', desc: 'Voice API, English', x: 0.22, y: 0.22 },
  { name: 'STAT-ON', desc: 'Belt sensor, worn for days', x: 0.62, y: 0.35 },
  { name: 'Rune Labs', desc: 'Apple Watch + iPhone', x: 0.86, y: 0.15 },
  { name: 'VoxWave', desc: '3 min of voice a day', x: 0.86, y: 0.83, us: true },
];
/** When the sweep passes each signal (the sweep starts at 60°, so VoxWave at ≈42° is found last). */
const FOUND = SIGNALS.map((s) => {
  let a = Math.atan2(s.y - 0.5, s.x - 0.5) / D2R;
  if (a < 0) a += 360;
  if (a < SWEEP.from) a += 360;
  return SWEEP.start + (a - SWEEP.from) / SWEEP.speed;
});
const US = SIGNALS.length - 1;
const US_AT = FOUND[US];

// ---------- Particle layout ----------
const RINGS = [0.25, 0.5, 0.75, 1];
const PER_RING = [70, 130, 190, 260];
const TICKS = 72;
const LINE = 140;
const WEDGE_N = 1500;
const DOT = 40;
const PING = 60;
const US_DOT = 90;
const RIPPLES = 3;

const I_TICK = PER_RING.reduce((a, b) => a + b, 0);
const I_LINE = I_TICK + TICKS * 3;
const I_WEDGE = I_LINE + LINE;
const I_DOTS = I_WEDGE + WEDGE_N;
const I_PINGS = I_DOTS + (SIGNALS.length - 1) * DOT;
const I_US = I_PINGS + (SIGNALS.length - 1) * PING;
const I_RIP = I_US + US_DOT;
const I_END = I_RIP + RIPPLES * PING;

const K = { coral: lin(C.coral), hot: lin(C.coralHot), paper: lin(C.paper), muted: lin(C.muted) };
type Lin = { r: number; g: number; b: number };
const ASH: Lin = {
  r: K.muted.r + (K.paper.r - K.muted.r) * 0.45,
  g: K.muted.g + (K.paper.g - K.muted.g) * 0.45,
  b: K.muted.b + (K.paper.b - K.muted.b) * 0.45,
};
function setC(col: Float32Array, i: number, a: Lin, b: Lin, f: number, alpha: number) {
  col[i * 4] = a.r + (b.r - a.r) * f;
  col[i * 4 + 1] = a.g + (b.g - a.g) * f;
  col[i * 4 + 2] = a.b + (b.b - a.b) * f;
  col[i * 4 + 3] = alpha;
}
const io = (x: number) => {
  const f = clamp(x);
  return f * f * (3 - 2 * f);
};
const hh = (i: number) => {
  const s = Math.sin(i * 12.9898 + 4.1) * 43758.5453;
  return s - Math.floor(s);
};
function disk(m: number, count: number, r: number): [number, number] {
  const rr = r * Math.sqrt((m + 0.5) / count);
  const a = m * 2.39996;
  return [Math.cos(a) * rr, Math.sin(a) * rr];
}
function at(pos: Float32Array, i: number, x: number, y: number) {
  pos[i * 3] = x;
  pos[i * 3 + 1] = y;
  pos[i * 3 + 2] = 0;
}

function sonar(t0: number, calm: boolean): ParticleTarget {
  return (pos, col, size, n, t) => {
    const k = calm ? 30 + (t - t0) : t - t0; // build 1: everything already found
    const appear = calm ? 1 : io((k - 0.2) / 1.2);
    const th = sweepDeg(k) * D2R;
    for (let i = 0; i < n; i++) {
      if (i >= I_END) {
        at(pos, i, R.cx, R.cy);
        col[i * 4 + 3] = 0;
        size[i] = 0.5;
        continue;
      }
      if (i < I_TICK) {
        // Dotted range rings, drawn outwards.
        let r = 0, m = i;
        while (m >= PER_RING[r]) m -= PER_RING[r++];
        const c = PER_RING[r];
        const a = (m / c) * Math.PI * 2;
        const rr = RINGS[r] * R.r;
        at(pos, i, R.cx + Math.cos(a) * rr, R.cy - Math.sin(a) * rr);
        const draw = io((k - 0.2 - r * 0.15 - (m / c) * 0.6) / 0.4);
        setC(col, i, K.paper, K.paper, 0, (r === 3 ? 0.22 : 0.12) * draw);
        size[i] = 0.7;
        continue;
      }
      if (i < I_LINE) {
        // Ticks around the outer ring.
        const j = i - I_TICK;
        const tk = Math.floor(j / 3);
        const a = (tk / TICKS) * Math.PI * 2;
        const rr = R.r * (1.03 + (j % 3) * 0.012 * (tk % 3 === 0 ? 2 : 1));
        at(pos, i, R.cx + Math.cos(a) * rr, R.cy - Math.sin(a) * rr);
        setC(col, i, K.paper, K.paper, 0, 0.22 * appear);
        size[i] = 0.6;
        continue;
      }
      if (i < I_WEDGE) {
        // The sweep line.
        const u = (i - I_LINE + 0.5) / LINE;
        at(pos, i, R.cx + Math.cos(th) * u * R.r, R.cy - Math.sin(th) * u * R.r);
        const on = calm ? 0.35 : io((k - SWEEP.start + 0.4) / 0.4);
        setC(col, i, K.coral, K.hot, 0.2, on * (0.55 + 0.4 * u));
        size[i] = 0.95;
        continue;
      }
      if (i < I_DOTS) {
        // The trailing wedge: fades away behind the line.
        const m = i - I_WEDGE;
        const back = hh(m) * WEDGE * D2R;
        const rr = Math.sqrt(hh(m + 7919)) * R.r;
        const a = th - back;
        at(pos, i, R.cx + Math.cos(a) * rr, R.cy - Math.sin(a) * rr);
        const on = calm ? 0.35 : io((k - SWEEP.start) / 0.6);
        const fall = Math.pow(1 - back / (WEDGE * D2R), 2.2);
        setC(col, i, K.coral, K.coral, 0, on * fall * 0.32);
        size[i] = 0.7;
        continue;
      }
      if (i < I_PINGS) {
        // Competitors: a grey signal that flashes when the sweep finds it.
        const s = Math.floor((i - I_DOTS) / DOT);
        const [ox, oy] = disk((i - I_DOTS) % DOT, DOT, 7);
        at(pos, i, px(SIGNALS[s].x) + ox, py(SIGNALS[s].y) + oy);
        const found = io((k - FOUND[s]) / 0.25);
        const flash = Math.exp(-Math.pow(k - FOUND[s] - 0.15, 2) * 10);
        setC(col, i, ASH, K.paper, flash, found * (calm ? 0.55 : 0.75 + 0.25 * flash));
        size[i] = 1;
        continue;
      }
      if (i < I_US) {
        // One expanding ping per competitor.
        const s = Math.floor((i - I_PINGS) / PING);
        const a = (((i - I_PINGS) % PING) / PING) * Math.PI * 2;
        const p = clamp((k - FOUND[s]) / 1.1);
        const rr = 8 + 36 * p;
        at(pos, i, px(SIGNALS[s].x) + Math.cos(a) * rr, py(SIGNALS[s].y) + Math.sin(a) * rr);
        setC(col, i, K.paper, K.paper, 0, p > 0 && p < 1 ? (1 - p) * 0.5 : 0);
        size[i] = 0.7;
        continue;
      }
      const ux = px(SIGNALS[US].x), uy = py(SIGNALS[US].y);
      if (i < I_RIP) {
        // VoxWave: found last, coral, alive.
        const found = io((k - US_AT) / 0.35);
        const flash = Math.exp(-Math.pow(k - US_AT - 0.2, 2) * 6);
        const [ox, oy] = disk(i - I_US, US_DOT, 12 * (1 + 0.08 * Math.sin(t * 3)) * (1 + 0.5 * flash));
        at(pos, i, ux + ox, uy + oy);
        setC(col, i, K.coral, K.hot, Math.max(flash, 0.25), found);
        size[i] = 1.25;
        continue;
      }
      // Ripples that keep coming out of VoxWave once it is found.
      const r = Math.floor((i - I_RIP) / PING);
      const a = (((i - I_RIP) % PING) / PING) * Math.PI * 2;
      const live = k > US_AT ? 1 : 0;
      const p = ((((k - US_AT) / 1.6 + r / RIPPLES) % 1) + 1) % 1;
      const rr = 14 + 46 * p;
      at(pos, i, ux + Math.cos(a) * rr, uy + Math.sin(a) * rr);
      setC(col, i, K.coral, K.coral, 0, live * (1 - p) * 0.55);
      size[i] = 0.8;
    }
  };
}

// ---------- Overlay ----------
function Fade({ delay, style, children, x = 0 }: { delay: number; style: object; children: ReactNode; x?: number }) {
  return (
    <motion.div
      style={{ position: 'absolute', ...style }}
      initial={{ opacity: 0, x, y: x ? 0 : 10 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, transition: { duration: 0.35 } }}
      transition={{ duration: 0.8, ease, delay }}
    >
      {children}
    </motion.div>
  );
}
const axisLabel = { fontSize: 17, letterSpacing: '0.16em', textTransform: 'uppercase' as const, color: 'var(--ink-60)', whiteSpace: 'nowrap' as const };

function Radar({ calm }: { calm: boolean }) {
  const d = (s: number) => (calm ? 0 : s);
  const q = { left: R.cx + 6, top: R.cy - SPAN - 6, w: SPAN + 4, h: SPAN };
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {/* Axes */}
      <motion.div
        style={{ position: 'absolute', left: R.cx - R.r - 30, top: R.cy, width: 2 * R.r + 60, height: 1, background: 'rgba(241,237,228,0.3)' }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1, ease, delay: d(0.3) }}
      />
      <motion.div
        style={{ position: 'absolute', left: R.cx, top: R.cy - R.r - 30, width: 1, height: 2 * R.r + 60, background: 'rgba(241,237,228,0.3)' }}
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 1, ease, delay: d(0.4) }}
      />
      <Fade delay={d(0.8)} style={{ left: R.cx - R.r - 30, top: R.cy - 34, ...axisLabel }}>
        One-off snapshot
      </Fade>
      <Fade delay={d(0.8)} style={{ left: R.cx + R.r + 30, top: R.cy - 34, ...axisLabel }}>
        <span style={{ display: 'inline-block', transform: 'translateX(-100%)' }}>Daily, at home</span>
      </Fade>
      <Fade delay={d(0.9)} style={{ left: R.cx + 16, top: R.cy - R.r - 32, ...axisLabel }}>
        Anyone · one button · Spanish
      </Fade>
      <Fade delay={d(0.9)} style={{ left: R.cx + 16, top: R.cy + R.r + 8, ...axisLabel }}>
        Needs a phone, watch or clinic
      </Fade>

      {/* The empty quadrant, claimed */}
      <motion.div
        style={{ position: 'absolute', left: q.left, top: q.top, width: q.w, height: q.h, border: `1.5px dashed ${C.coral}`, borderRadius: 14, background: 'rgba(255,110,66,0.06)' }}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, ease, delay: d(US_AT + 0.3) }}
      />
      <Fade delay={d(US_AT + 0.6)} style={{ left: q.left + q.w - 18, top: q.top + 14 }}>
        <div className="display" style={{ fontSize: 28, color: 'var(--coral)', transform: 'translateX(-100%)', whiteSpace: 'nowrap' }}>
          Every patient, every day
        </div>
      </Fade>

      {/* Signal labels */}
      {SIGNALS.map((s, i) => {
        const x = px(s.x), y = py(s.y);
        const left = s.x > 0.7 && !s.us;
        return (
          <Fade key={s.name} delay={d(FOUND[i] + 0.15)} x={left ? 10 : -10} style={{ left: left ? x - 22 : x + (s.us ? 30 : 22), top: y - (s.us ? 26 : 22) }}>
            <div style={{ transform: left ? 'translateX(-100%)' : undefined, textAlign: left ? 'right' : 'left', whiteSpace: 'nowrap' }}>
              <div className="display" style={{ fontSize: s.us ? 36 : 24, lineHeight: 1.1, color: s.us ? 'var(--coral)' : calm ? 'rgba(241,237,228,0.55)' : 'var(--paper)' }}>
                {s.name}
              </div>
              <div className="body" style={{ fontSize: s.us ? 22 : 19, marginTop: 4, color: s.us ? 'var(--paper)' : undefined, opacity: calm && !s.us ? 0.6 : 1 }}>
                {s.desc}
              </div>
            </div>
          </Fade>
        );
      })}
    </div>
  );
}

const MOAT = [
  ['Our own AI model.', 'Our algorithms, built by us. Not a rented voice API.'],
  ['Her own baseline.', 'Compared only with herself. Sharper every day.'],
  ['Spanish first. Any language next.', 'Same model, new voice data for each language.'],
  ['One button.', 'No phone, no app, no internet. Every day, at home.'],
];

function Content({ build }: { build: number }) {
  return (
    <div className="content">
      <Radar calm={build >= 1} />
      <At build={build} at={0} until={1}>
        <motion.div key="h0" style={{ position: 'absolute', left: 120, top: 112, width: 660 }} exit={{ opacity: 0, y: -10, transition: { duration: 0.4, ease } }}>
          <h2 className="display" style={{ fontSize: 72, lineHeight: 1.06, color: 'var(--ink-60)' }}>
            <Words text="Daily, or for everyone." delay={0.3} />
          </h2>
          <h2 className="display" style={{ fontSize: 72, lineHeight: 1.06, marginTop: 4 }}>
            <Words text="Never both." delay={1.1} />
          </h2>
          <motion.h2
            className="display"
            style={{ fontSize: 72, lineHeight: 1.06, marginTop: 4, color: 'var(--coral)' }}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease, delay: US_AT + 0.5 }}
          >
            Until now.
          </motion.h2>
        </motion.div>
      </At>
      <At build={build} at={1}>
        <motion.div key="h1" style={{ position: 'absolute', left: 120, top: 112, width: 660 }}>
          <h2 className="display" style={{ fontSize: 72, lineHeight: 1.06 }}>
            <Words text="Only" delay={0.3} style={{ display: 'inline' }} />{' '}<span style={{ color: 'var(--coral)' }}><Words text="VoxWave." delay={0.5} style={{ display: 'inline' }} /></span>
          </h2>
          {MOAT.map(([a, b], i) => (
            <motion.div
              key={a}
              style={{ marginTop: i === 0 ? 56 : 28, display: 'flex', gap: 22 }}
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease, delay: 0.9 + i * 0.4 }}
            >
              <div style={{ width: 3, borderRadius: 2, background: 'var(--coral)', flex: 'none' }} />
              <div>
                <div className="display" style={{ fontSize: 34, lineHeight: 1.15 }}>
                  {a}
                </div>
                <p className="body" style={{ fontSize: 26, lineHeight: 1.35, margin: '6px 0 0' }}>
                  {b}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </At>
    </div>
  );
}

const coralPaint = (out: Float32Array, n: number) => {
  for (let i = 0; i < n; i++) put(out, i, C.coral, 1);
};

export const S16B: SlideDef = {
  id: 'S16B',
  builds: 2,
  auto: [13],
  notes:
    "Today you get one or the other. Measurement every day, but only with a smartwatch, an iPhone or a belt sensor, like Rune Labs or STAT-ON. Or something anyone can use, but only now and then: a neurologist visit every six months, a phone call from Tucuvi, an English voice API like Canary. Daily, or for everyone. Never both. Until now: three minutes of voice a day, one button, in Spanish. And only VoxWave has all of this: our own AI model and algorithms, not a rented voice API; every patient compared only with herself, sharper every day; Spanish first, and the same model goes to any language with new voice data; and one button, no phone, no app, every day at home.",
  wave: () => ({ shape: wave({ y: 1010, amp: 14, speed: 0.7 }), paint: coralPaint, opacity: 0.3, core: 1.1, glow: 0.5, duration: 1400, stagger: 0.3 }),
  particles: (b) => {
    const t0 = clock.t;
    return { state: { target: sonar(t0, b >= 1), duration: b === 0 ? 1800 : 900, scatter: b === 0 ? 0.4 : 0, size: 5.2 } };
  },
  bg: () => ({ pool: [0.62, 0.55], poolStrength: 1, warm: 0.5 }),
  Content,
};
```
