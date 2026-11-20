import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { C, EASE } from '../brand/tokens';
import type { SlideDef } from '../deck/types';
import { wave } from '../engine/shapes';
import { Words } from '../ui/motion';

const ease = EASE as unknown as [number, number, number, number];

/**
 * Demand, on paper: the scissors.
 * Patients with Parkinson's double by 2050 while neurology capacity stays flat.
 * The gap fills with patients nobody monitors between visits; VoxWave's coral wave
 * runs through it and lights them up. Then the three actors we need land as stamps.
 */

const NAVY = C.navy, TEAL = C.teal, CORAL = C.coral;
const INK = 'rgba(9,38,52,0.72)';

// ---------- Timeline (s since the slide appeared) ----------
const T = { head: 0.15, axes: 0.5, lines0: 0.9, lines1: 2.9, labels: 2.9, fill0: 3.2, fill1: 4.6, wave0: 4.9, wave1: 6.5, market: 6.3, stamp0: 7.0, stampGap: 0.55 };

// ---------- Chart ----------
const X0 = 170, X1 = 1460, BASE = 600;
const RISE = 330; // patients line rises this much by 2050 (doubling)
const ux = (u: number) => X0 + (X1 - X0) * u;
const yP = (u: number) => BASE - RISE * Math.pow(u, 1.25); // patients
const yN = (u: number) => BASE - 12 * u; // neurology capacity: flat
const YEARS: [number, string][] = [
  [0, '2021'],
  [0.31, '2030'],
  [0.655, '2040'],
  [1, '2050'],
];

// Dots of "patients nobody monitors" filling the gap (computed once).
const DOTS = (() => {
  const out: { x: number; y: number; u: number; h: number }[] = [];
  const sp = 19;
  for (let r = 0, y = BASE - 6; y > BASE - RISE - 10; r++, y -= sp * 0.866) {
    for (let x = X0 + 20 + (r % 2 ? sp / 2 : 0); x < X1; x += sp) {
      const u = (x - X0) / (X1 - X0);
      if (y < yP(u) + 9 || y > yN(u) - 9) continue;
      const hh = Math.sin(out.length * 12.9898) * 43758.5453;
      out.push({ x, y, u, h: hh - Math.floor(hh) });
    }
  }
  return out;
})();

// ---------- The three actors ----------
const ACTORS = [
  { tag: 'First customers', name: 'Private neurology clinics', logo: 'clinic' as const, rot: -2.2 },
  { tag: 'Clinical validation', name: 'Gregorio Marañón', logo: '/media/partners/maranon_color.svg', rot: 1.6 },
  { tag: 'Reaching patients', name: 'Asociación Navarra de Parkinson', logo: '/media/partners/fep_color.png', rot: -1.2 },
];
const STAMP = { w: 520, h: 214, top: 776 };
const stampX = (k: number) => 120 + k * (STAMP.w + 60);

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const io = (v: number) => (v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2);

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

function Scissors({ t }: { t: number }) {
  const ax = io(clamp((t - T.axes) / 0.7));
  const lp = io(clamp((t - T.lines0) / (T.lines1 - T.lines0)));
  const fill = clamp((t - T.fill0) / (T.fill1 - T.fill0));
  const wv = io(clamp((t - T.wave0) / (T.wave1 - T.wave0)));
  const line = (f: (u: number) => number, upto: number) => {
    const pts: string[] = [];
    for (let i = 0; i <= 80 * upto; i++) {
      const u = i / 80;
      pts.push(`${ux(u).toFixed(1)},${f(u).toFixed(1)}`);
    }
    return pts.join(' ');
  };
  // VoxWave's wave, running through the middle of the gap.
  const wavePts: string[] = [];
  for (let i = 0; i <= 160 * wv; i++) {
    const u = i / 160;
    const mid = (yP(u) + yN(u)) / 2;
    const gap = yN(u) - yP(u);
    wavePts.push(`${ux(u).toFixed(1)},${(mid + Math.sin(u * 26 - t * 2) * gap * 0.22).toFixed(1)}`);
  }
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
      {/* axis */}
      <line x1={X0} x2={X0 + (X1 - X0) * ax} y1={BASE + 40} y2={BASE + 40} stroke="rgba(9,38,52,0.25)" strokeWidth={1.5} />
      {YEARS.map(([u, y]) => (
        <text key={y} x={ux(u)} y={BASE + 74} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize={18} fill="rgba(9,38,52,0.55)" opacity={ax}>
          {y}
        </text>
      ))}
      {/* the unmonitored patients */}
      {DOTS.map((d, i) => {
        if (d.u > fill + 0.02 * d.h) return null;
        const lit = wv > 0 && (wv >= 0.999 || d.u < wv - 0.02);
        return <circle key={i} cx={d.x} cy={d.y} r={lit ? 3.6 : 3.2} fill={lit ? CORAL : NAVY} opacity={lit ? 0.85 : 0.22} />;
      })}
      {/* the two blades */}
      {lp > 0 && (
        <>
          <polyline points={line(yN, lp)} fill="none" stroke={NAVY} strokeWidth={5} strokeLinecap="round" />
          <polyline points={line(yP, lp)} fill="none" stroke={CORAL} strokeWidth={5} strokeLinecap="round" />
          <circle cx={ux(0)} cy={BASE} r={9} fill={NAVY} />
          <circle cx={ux(lp)} cy={yP(lp)} r={9} fill={CORAL} />
          <circle cx={ux(lp)} cy={yN(lp)} r={9} fill={NAVY} />
        </>
      )}
      {/* VoxWave */}
      {wavePts.length > 1 && <polyline points={wavePts.join(' ')} fill="none" stroke={CORAL} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" />}
    </svg>
  );
}

function Stamp({ k }: { k: number }) {
  const a = ACTORS[k];
  const d = T.stamp0 + k * T.stampGap;
  return (
    <div style={{ position: 'absolute', left: stampX(k), top: STAMP.top, width: STAMP.w, height: STAMP.h }}>
      <motion.div
        style={{ position: 'absolute', inset: 0, borderRadius: 26, border: `3px solid ${TEAL}` }}
        initial={{ opacity: 0, scale: 1 }}
        animate={{ opacity: [0, 0.35, 0], scale: [1, 1.07, 1.13] }}
        transition={{ duration: 0.7, delay: d + 0.28, ease: 'easeOut' }}
      />
      <motion.div
        style={{ position: 'absolute', inset: 0 }}
        initial={{ opacity: 0, scale: 1.5, rotate: a.rot - 7, y: -24 }}
        animate={{ opacity: [0, 1, 1, 1], scale: [1.5, 0.97, 1.015, 1], rotate: [a.rot - 7, a.rot + 0.4, a.rot - 0.1, a.rot], y: [-24, 0, 0, 0] }}
        transition={{ duration: 0.72, delay: d, times: [0, 0.42, 0.7, 1], ease: [0.5, 0, 0.75, 0] }}
      >
        <svg width={STAMP.w} height={STAMP.h} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
          <defs>
            <filter id={`ink-d-${k}`} x="-5%" y="-5%" width="110%" height="110%">
              <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={k + 11} />
              <feDisplacementMap in="SourceGraphic" scale={2.4} />
            </filter>
          </defs>
          <g filter={`url(#ink-d-${k})`} fill="none" stroke={TEAL} opacity={0.9}>
            <rect x={3} y={3} width={STAMP.w - 6} height={STAMP.h - 6} rx={24} strokeWidth={3.5} />
            <rect x={13} y={13} width={STAMP.w - 26} height={STAMP.h - 26} rx={17} strokeWidth={1.4} />
          </g>
        </svg>
        <div className="mono" style={{ position: 'absolute', left: 0, right: 0, top: 28, textAlign: 'center', fontSize: 14, letterSpacing: '0.3em', color: TEAL }}>
          {a.tag}
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 50, height: 76, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {a.logo === 'clinic' ? (
            <svg width={170} height={70} viewBox="0 0 190 78" fill="none" stroke={NAVY} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
              {/* a row of three small clinics */}
              {[0, 1, 2].map((i) => (
                <g key={i} transform={`translate(${i * 64} ${i === 1 ? 0 : 10})`}>
                  <path d="M6 66 V26 L30 12 L54 26 V66 Z" />
                  <path d="M30 30 V46 M22 38 H38" stroke={CORAL} />
                  <path d="M24 66 V54 H36 V66" />
                </g>
              ))}
            </svg>
          ) : (
            <img src={a.logo} alt="" style={k === 1 ? { width: 300 } : { height: 72 }} />
          )}
        </div>
        <div className="display" style={{ position: 'absolute', left: 0, right: 0, bottom: 52, textAlign: 'center', fontSize: 24, fontWeight: 600, color: NAVY }}>
          {a.name}
        </div>
        <div className="display" style={{ position: 'absolute', left: 0, right: 0, bottom: 24, textAlign: 'center', fontSize: 20, fontWeight: 600, color: CORAL }}>
          ✓ Wants to collaborate
        </div>
      </motion.div>
    </div>
  );
}

function Content() {
  const t = useElapsed();
  const status = t < T.wave0 ? 'The gap' : t < T.stamp0 ? 'Our market' : 'Everyone wants in';
  const showLabels = t >= T.labels;
  return (
    <div className="content">
      <div className="mono" style={{ position: 'absolute', left: 120, top: 62, fontSize: 18, color: NAVY, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ width: 10, height: 10, borderRadius: 5, background: CORAL, display: 'inline-block' }} />
        Demand
      </div>
      <motion.div key={status} className="mono" style={{ position: 'absolute', right: 120, top: 62, fontSize: 18, color: TEAL }} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        {status}
      </motion.div>
      <h2 className="display" style={{ position: 'absolute', left: 120, top: 104, fontSize: 60, color: NAVY }}>
        <Words text="Patients double. Neurologists don’t." delay={T.head} />
      </h2>

      <Scissors t={t} />

      {/* Blade labels, at the right end */}
      {showLabels && (
        <>
          <motion.div style={{ position: 'absolute', left: X1 + 34, top: yP(1) - 44 }} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, ease }}>
            <div className="number" style={{ fontSize: 50, lineHeight: 1, color: CORAL }}>
              25.2M
            </div>
            <div className="body" style={{ fontSize: 20, marginTop: 6, color: INK }}>
              patients by 2050 · ×2
            </div>
          </motion.div>
          <motion.div style={{ position: 'absolute', left: X1 + 34, top: yN(1) - 30 }} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, ease, delay: 0.2 }}>
            <div className="display" style={{ fontSize: 28, fontWeight: 700, color: NAVY }}>
              Neurologists
            </div>
            <div className="body" style={{ fontSize: 20, marginTop: 4, color: INK }}>
              stagnant · ~800 short in Spain
            </div>
          </motion.div>
          <motion.div className="mono" style={{ position: 'absolute', left: X0 - 6, top: BASE + 12, fontSize: 15, color: 'rgba(9,38,52,0.55)', transform: 'translateX(-100%)' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
            11.8M
          </motion.div>
        </>
      )}
      {/* What fills the gap: a bracket spanning it at the right end, and its name. */}
      {t >= T.fill0 + 0.3 && (
        <>
          <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none' }}>
            <motion.path
              d={`M${X1 + 18} ${yP(1) + 54} h10 V${yN(1) - 30} h-10`}
              fill="none"
              stroke={CORAL}
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            />
          </svg>
          <motion.div
            className="display"
            style={{ position: 'absolute', left: X1 + 46, top: (yP(1) + yN(1)) / 2 - 36, fontSize: 25, fontWeight: 700, lineHeight: 1.2, color: NAVY }}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease }}
          >
            Patients nobody
            <br />
            monitors between visits
          </motion.div>
        </>
      )}
      {t >= T.market && (
        <motion.div className="display" style={{ position: 'absolute', left: ux(0.08), top: BASE - 250, fontSize: 40, fontWeight: 700, color: CORAL }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease }}>
          That gap is our market.
        </motion.div>
      )}

      {ACTORS.map((_, k) => (
        <Stamp key={k} k={k} />
      ))}
    </div>
  );
}

export const S12: SlideDef = {
  id: 'S12',
  builds: 1,
  notes:
    "Why now? Patients double by 2050, while neurologists don't. That gap is our market. And clinics, Gregorio Marañón and patient associations all want in.",
  theme: () => 'light',
  wave: () => ({ shape: wave({ y: 540, amp: 30 }), opacity: 0, duration: 1600, stagger: 0 }),
  bg: () => ({ pool: [0.5, 0.5], poolStrength: 1, warm: 0.6 }),
  Content,
};
