import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { C, EASE } from '../brand/tokens';
import type { SlideDef } from '../deck/types';
import { wave } from '../engine/shapes';
import { DrawnFormula, prewarmTex } from '../ui/DrawnFormula';
import { Counter, Words } from '../ui/motion';

const ease = EASE as unknown as [number, number, number, number];

/**
 * How it works, on paper: the AI listens to María's voice (a scanner sweeps the
 * waveform), splits it like a prism into four signals, and measures each one —
 * name = equation — before comparing everything with her own baseline.
 */

// ---------- Timeline (seconds since the slide appeared) ----------
const TL = {
  bars: 0.25, // the waveform grows in
  scan0: 1.0, // the scanner starts…
  scan1: 3.3, // …and finishes
  split: 3.45, // prism: four coloured copies separate
  fly0: 4.05, // they fly into their cards
  fly1: 5.15,
  ai: 5.0, // the AI node appears
  card0: 5.5, // first card measured; one every CARD_GAP
  z: 12.2, // compared with her own baseline
};
const CARD_GAP = 1.55;

// ---------- Palette ----------
const NAVY = C.navy, TEAL = C.teal, CORAL = C.coral, MIST = '#8FB3C3';
const COPY_COLORS = [NAVY, CORAL, TEAL, MIST];

// ---------- The voice as rounded bars (like the app) ----------
const WV = { x0: 170, x1: 1750, y: 540, n: 86, h: 250 };
const BARS = (() => {
  // Syllable bursts separated by pauses: a voice speaking.
  const bursts = [0.08, 0.15, 0.24, 0.31, 0.47, 0.55, 0.62, 0.78, 0.86, 0.93];
  return Array.from({ length: WV.n }, (_, i) => {
    const u = i / (WV.n - 1);
    let e = 0;
    for (const b of bursts) e = Math.max(e, Math.exp(-((u - b) ** 2) / 0.0007));
    const tex = 0.55 + 0.45 * Math.abs(Math.sin(i * 1.93) * Math.cos(i * 0.71));
    return Math.max(0.05, e * tex);
  });
})();
const barX = (i: number) => WV.x0 + ((WV.x1 - WV.x0) * i) / (WV.n - 1);

// ---------- Cards ----------
const CARD = { w: 790, h: 318 };
const CARDS_AT: [number, number][] = [
  [120, 168],
  [1010, 168],
  [120, 556],
  [1010, 556],
];
const SIG = { x: 40, y: 92, w: 710, h: 96 }; // signal area inside a card

// The interpretable "voice dials" of the VoxWave paper (Table 4), with their eGeMAPS definitions.
const METRICS = [
  {
    key: 'Voice clarity',
    plain: 'How clean the voice sounds',
    value: 18.4,
    fmt: (v: number) => `${v.toFixed(1)} dB`,
    tex: String.raw`\mathrm{HNR}=10\log_{10}\frac{E_{\mathrm{harmonic}}}{E_{\mathrm{noise}}}`,
    size: 32,
  },
  {
    key: 'Pitch variation',
    plain: 'How lively the intonation is',
    value: 0.16,
    fmt: (v: number) => v.toFixed(2),
    tex: String.raw`\mathrm{Pitch\ variation}=\frac{\sigma\left(F_0^{\,\mathrm{st}}\right)}{\mu\left(F_0^{\,\mathrm{st}}\right)}`,
    size: 32,
  },
  {
    key: 'Syllable rate',
    plain: 'How fast she speaks',
    value: 4.3,
    fmt: (v: number) => `${v.toFixed(1)} /s`,
    tex: String.raw`\mathrm{Syllable\ rate}=\frac{N_{\mathrm{loudness\ peaks}}}{T}`,
    size: 32,
  },
  {
    key: 'Pause length',
    plain: 'How long the silences last',
    value: 0.35,
    fmt: (v: number) => `${v.toFixed(2)} s`,
    tex: String.raw`\mathrm{Pause}=\frac{1}{K}\sum\limits_{k=1}^{K}\ell_k^{\,\mathrm{unvoiced}}`,
    size: 32,
  },
];

// The model (paper, Eqs. 3, 4 and 11): remove the room, score the voice, alert on sustained drift.
const MODEL = [
  { label: 'Remove the room', tex: String.raw`\tilde{X}=X-C\hat{\beta}` },
  { label: 'VoxWave voice index', tex: String.raw`\mathrm{index}=100\,\sigma\!\left(w^{\top}z+b\right)` },
  { label: 'Alert on her own baseline', tex: String.raw`z_w=\frac{V_w-m}{s}\geq 1.5\ \text{for 3 weeks}` },
];
prewarmTex([...METRICS.map((m) => m.tex), ...MODEL.map((m) => m.tex)]);

// ---------- Helpers ----------
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const io = (v: number) => (v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2);
const out = (v: number) => 1 - Math.pow(1 - v, 3);

/** Seconds since mount, every frame. */
function useElapsed() {
  const [t, setT] = useState(0);
  useEffect(() => {
    const t0 = performance.now();
    let raf = 0;
    const loop = () => {
      setT((performance.now() - t0) / 1000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  return t;
}

// ---------- The waveform, the scanner and the prism ----------
function Bars({ t, color, k = 0 }: { t: number; color?: string; k?: number }) {
  const scanX = WV.x0 - 60 + (WV.x1 - WV.x0 + 120) * io(clamp((t - TL.scan0) / (TL.scan1 - TL.scan0)));
  return (
    <>
      {BARS.map((a, i) => {
        const x = barX(i);
        const grow = out(clamp((t - TL.bars - Math.abs(i - WV.n / 2) * 0.012) / 0.6));
        const h = Math.max(9, a * WV.h * grow);
        // Scanned bars cool down; the bars inside the band glow coral.
        const inBand = color ? 0 : clamp(1 - Math.abs(x - scanX + 40) / 70);
        const passed = !color && x < scanX - 90;
        const fill = color ?? (inBand > 0.05 ? CORAL : passed ? TEAL : NAVY);
        return <rect key={i} x={x - 4.5 + k * 0} y={WV.y - h / 2} width={9} height={h} rx={4.5} fill={fill} opacity={color ? 1 : passed ? 0.75 : 1} />;
      })}
    </>
  );
}

function Scanner({ t }: { t: number }) {
  const p = clamp((t - TL.scan0) / (TL.scan1 - TL.scan0));
  if (p <= 0 || t > TL.split + 0.3) return null;
  const x = WV.x0 - 60 + (WV.x1 - WV.x0 + 120) * io(p);
  const fade = 1 - clamp((t - TL.scan1) / 0.4);
  // Dotted envelope traced over the peaks the scanner has already read.
  const pts: string[] = [];
  BARS.forEach((a, i) => {
    const bx = barX(i);
    if (bx < x - 20) pts.push(`${bx},${WV.y - Math.max(9, a * WV.h) / 2 - 16}`);
  });
  return (
    <g opacity={fade}>
      <defs>
        <linearGradient id="scan" x1="0" x2="1">
          <stop offset="0" stopColor={CORAL} stopOpacity={0} />
          <stop offset="1" stopColor={CORAL} stopOpacity={0.22} />
        </linearGradient>
      </defs>
      <rect x={x - 260} y={WV.y - 330} width={260} height={660} fill="url(#scan)" />
      <rect x={x - 1} y={WV.y - 330} width={2} height={660} fill={CORAL} />
      {pts.length > 1 && <polyline points={pts.join(' ')} fill="none" stroke={NAVY} strokeWidth={2} strokeDasharray="2 7" strokeLinecap="round" opacity={0.7} />}
    </g>
  );
}

/** One coloured copy of the voice: separates (prism), then flies into card k and dissolves. */
function Copy({ t, k }: { t: number; k: number }) {
  const sep = io(clamp((t - TL.split) / 0.6));
  const fly = io(clamp((t - TL.fly0) / (TL.fly1 - TL.fly0)));
  if (sep <= 0 || fly >= 1) return null;
  const [cx0, cy0] = CARDS_AT[k];
  const tx = cx0 + SIG.x + SIG.w / 2, ty = cy0 + SIG.y + SIG.h / 2;
  const sx = 1 + (SIG.w / (WV.x1 - WV.x0) - 1) * fly;
  const sy = 1 + (SIG.h / WV.h - 1) * fly;
  const ox = (k - 1.5) * 14 * sep * (1 - fly), oy = (k - 1.5) * 22 * sep * (1 - fly);
  const x = 960 + (tx - 960) * fly + ox, y = WV.y + (ty - WV.y) * fly + oy;
  const op = 0.82 * sep * (1 - clamp((fly - 0.6) / 0.4));
  return (
    <g transform={`translate(${x} ${y}) scale(${sx} ${sy}) translate(${-960} ${-WV.y})`} opacity={op} style={{ mixBlendMode: 'multiply' }}>
      <Bars t={99} color={COPY_COLORS[k]} />
    </g>
  );
}

// ---------- Each card's own signal (local coords: SIG.w x SIG.h) ----------
function Signal({ k, t, active }: { k: number; t: number; active: boolean }) {
  const col = active ? CORAL : NAVY;
  const W = SIG.w, H = SIG.h, mid = H / 2;
  if (k === 0) {
    // Tremor: a slow oscillation with a fine shake riding on it.
    const d = Array.from({ length: 180 }, (_, i) => {
      const x = (i / 179) * W;
      const y = mid - 30 * Math.sin(x * 0.034 - t * 2.2) - 4 * Math.sin(x * 0.42 + t * 9) * (active ? 1 : 0.4);
      return `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(' ');
    return <path d={d} fill="none" stroke={col} strokeWidth={3} strokeLinecap="round" />;
  }
  if (k === 1) {
    // Pitch: the F0 contour as dots, with a reading cursor.
    const cur = active ? ((t * 160) % W) : -10;
    return (
      <>
        {Array.from({ length: 64 }, (_, i) => {
          const x = (i / 63) * W;
          const y = mid - 26 * Math.sin(x * 0.011 + 0.6) - 9 * Math.sin(x * 0.037);
          return <circle key={i} cx={x} cy={y} r={3.4} fill={col} opacity={Math.abs(x - cur) < 30 ? 1 : 0.75} />;
        })}
        {active && <rect x={cur - 1} y={0} width={2} height={H} fill={NAVY} opacity={0.5} />}
      </>
    );
  }
  if (k === 2) {
    // Rhythm: the syllables as beats, slightly uneven.
    const xs = [10, 62, 104, 166, 214, 252, 318, 364, 420, 470, 530, 571, 636, 688];
    return (
      <>
        {xs.map((x, i) => {
          const h = 34 + 46 * Math.abs(Math.sin(i * 1.7 + 0.4));
          const pulse = active ? 1 + 0.12 * Math.max(0, Math.sin(t * 6 - i * 0.9)) : 1;
          return <rect key={i} x={x} y={mid - (h * pulse) / 2} width={13} height={h * pulse} rx={6.5} fill={col} />;
        })}
      </>
    );
  }
  // Pauses: speech, then silence (shaded), then speech.
  const gaps: [number, number][] = [
    [150, 260],
    [430, 520],
  ];
  const inGap = (x: number) => gaps.some(([a, b]) => x > a && x < b);
  return (
    <>
      {active && gaps.map(([a, b], i) => <rect key={i} x={a} y={4} width={b - a} height={H - 8} rx={10} fill={CORAL} opacity={0.12} />)}
      {Array.from({ length: 78 }, (_, i) => {
        const x = 4 + (i / 77) * (W - 8);
        if (inGap(x)) return <circle key={i} cx={x} cy={mid} r={2.2} fill={NAVY} opacity={0.35} />;
        const h = 10 + 62 * Math.abs(Math.sin(i * 2.31) * Math.sin(i * 0.37 + 1));
        return <rect key={i} x={x - 2.5} y={mid - h / 2} width={5} height={h} rx={2.5} fill={col} />;
      })}
    </>
  );
}

function Card({ k, t }: { k: number; t: number }) {
  const m = METRICS[k];
  const [x, y] = CARDS_AT[k];
  const start = TL.card0 + k * CARD_GAP;
  const active = t >= start && t < start + CARD_GAP + 0.15 && t < TL.z;
  return (
    <motion.div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: CARD.w,
        height: CARD.h,
        borderRadius: 26,
        background: '#fbf9f5',
        border: `2px solid ${active ? CORAL : 'rgba(9,38,52,0.08)'}`,
        boxShadow: active ? '0 24px 60px rgba(255,110,66,0.18)' : '0 18px 50px rgba(9,38,52,0.08)',
        transition: 'border-color .5s, box-shadow .5s',
        overflow: 'hidden',
      }}
      initial={{ opacity: 0, scale: 0.96, y: 18 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.9, ease, delay: TL.fly0 + 0.25 }}
    >
      <div style={{ position: 'absolute', left: 40, top: 28, display: 'flex', alignItems: 'baseline', gap: 16 }}>
        <span className="mono" style={{ fontSize: 17, color: CORAL }}>
          0{k + 1}
        </span>
        <span className="body" style={{ fontSize: 23, color: 'rgba(9,38,52,0.7)' }}>
          {m.plain}
        </span>
      </div>
      <div className="number" style={{ position: 'absolute', right: 40, top: 16, fontSize: 50, color: t >= start ? CORAL : 'rgba(9,38,52,0.18)', transition: 'color .6s' }}>
        {t >= start ? <Counter to={m.value} duration={1.2} delay={0} format={m.fmt} /> : '—'}
      </div>
      <svg width={SIG.w} height={SIG.h} style={{ position: 'absolute', left: SIG.x, top: SIG.y, overflow: 'visible' }}>
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: TL.fly1 - 0.35 }}>
          <Signal k={k} t={t} active={active} />
        </motion.g>
      </svg>
      <div style={{ position: 'absolute', left: 40, top: 212, height: 90, display: 'flex', alignItems: 'center' }}>
        <DrawnFormula tex={m.tex} size={m.size} delay={start + 0.1} duration={1.6} color={NAVY} />
      </div>
    </motion.div>
  );
}

function AINode({ t }: { t: number }) {
  const on = t >= TL.z;
  return (
    <motion.div
      style={{ position: 'absolute', left: 965 - 50, top: 524 - 50, width: 100, height: 100 }}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease, delay: TL.ai }}
    >
      <svg width={100} height={100} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        <circle cx={50} cy={50} r={48} fill="none" stroke={on ? CORAL : NAVY} strokeWidth={2} strokeDasharray="3 7" strokeLinecap="round" transform={`rotate(${t * 40} 50 50)`} opacity={0.6} />
      </svg>
      <div
        className="display"
        style={{
          position: 'absolute',
          inset: 13,
          borderRadius: '50%',
          background: on ? CORAL : NAVY,
          color: '#fbf9f5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 26,
          fontWeight: 700,
          transition: 'background .6s',
          boxShadow: on ? '0 0 40px rgba(255,110,66,0.45)' : '0 10px 30px rgba(9,38,52,0.25)',
        }}
      >
        AI
      </div>
    </motion.div>
  );
}

function Content() {
  const t = useElapsed();
  const status = t < TL.split ? 'Listening' : t < TL.z ? 'Reading the voice dials' : 'The VoxWave model';
  const showWave = t < TL.fly1 + 0.1;
  return (
    <div className="content">
      {/* Eyebrow + status, like a lab instrument. */}
      <div className="mono" style={{ position: 'absolute', left: 120, top: 62, fontSize: 18, color: NAVY, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ width: 10, height: 10, borderRadius: 5, background: CORAL, display: 'inline-block' }} />
        AI voice analysis
      </div>
      <motion.div key={status} className="mono" style={{ position: 'absolute', right: 120, top: 62, fontSize: 18, color: TEAL }} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        {status}
      </motion.div>

      {/* Title: present while the AI listens, then it makes room for the cards. */}
      <motion.div style={{ position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center' }} animate={{ opacity: t < TL.split ? 1 : 0, y: t < TL.split ? 0 : -16 }} transition={{ duration: 0.6, ease }}>
        <h2 className="display" style={{ fontSize: 64 }}>
          <Words text="Powered by the VoxWave voice model." delay={0.3} />
        </h2>
      </motion.div>

      {showWave && (
        <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
          <g opacity={1 - clamp((t - TL.split) / 0.35)}>
            <Bars t={t} />
          </g>
          <Scanner t={t} />
          {[0, 1, 2, 3].map((k) => (
            <Copy key={k} t={t} k={k} />
          ))}
        </svg>
      )}

      {/* Mounted from the start (hidden) so every delay runs on the slide's clock. */}
      {[0, 1, 2, 3].map((k) => (
        <Card key={k} k={k} t={t} />
      ))}
      <AINode t={t} />

      {/* Then: the model itself, in three steps. */}
      {t >= TL.z && (
        <div style={{ position: 'absolute', left: 120, top: 892, width: 1680, display: 'grid', gridTemplateColumns: '1fr 1fr 1.25fr', gap: 40 }}>
          {MODEL.map((m, i) => (
            <motion.div key={m.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease, delay: i * 0.55 }}>
              <div className="mono" style={{ fontSize: 15, color: CORAL }}>
                0{i + 1} · {m.label}
              </div>
              <div style={{ height: 70, display: 'flex', alignItems: 'center' }}>
                <DrawnFormula tex={m.tex} size={30} delay={0.3 + i * 0.55} duration={1.3} color={NAVY} />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="mono" style={{ position: 'absolute', left: 120, bottom: 34, fontSize: 13, color: 'rgba(9,38,52,0.45)' }}>
        VoxWave model · WavLM + channel correction · AUROC 0.91 in Spanish, 0.79 in English never seen · preprint, Nov 2026 · values illustrative
      </div>
    </div>
  );
}

export const S08: SlideDef = {
  id: 'S08',
  builds: 1,
  notes:
    "Behind it is our own voice model. It reads four voice dials: clarity, intonation, speed and pauses. First, we remove the room: in public datasets, even silence predicted Parkinson's. Then our model scores the voice: AUROC zero point nine one in Spanish, and zero point seven nine in English it was never trained on. And María is compared only with herself.",
  theme: () => 'light',
  wave: () => ({ shape: wave({ y: 540, amp: 30 }), opacity: 0, duration: 1600, stagger: 0 }),
  bg: () => ({ pool: [0.5, 0.5], poolStrength: 1, warm: 0.6 }),
  Content,
};
