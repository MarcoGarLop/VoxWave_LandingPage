import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { C, EASE } from '../brand/tokens';
import type { SlideDef } from '../deck/types';
import { wave } from '../engine/shapes';
import { Words } from '../ui/motion';

const ease = EASE as unknown as [number, number, number, number];

/**
 * The barriers to growth, on paper: what stands in the way, how we clear each one,
 * and why, once cleared, they protect us. (Where we grow lives on the road slide.)
 */

const CORAL = C.coral;
const NAVY = C.navy;

const BARRIERS = [
  {
    k: 'Regulation',
    a: 'CE mark in year 2, FDA in year 3 — built in from day one.',
    icon: (
      <>
        <path d="M24 5 L40 11 V24 C40 33 33 40 24 43 C15 40 8 33 8 24 V11 Z" pathLength={1} />
        <path d="M17 24 L22 29 L31 19" pathLength={1} />
      </>
    ),
  },
  {
    k: 'Reimbursement, country by country',
    a: 'Private clinics pay directly first; public systems and insurers follow the evidence.',
    icon: (
      <>
        <rect x={6} y={12} width={36} height={24} rx={4} pathLength={1} />
        <circle cx={24} cy={24} r={5} pathLength={1} />
      </>
    ),
  },
  {
    k: 'Every variety of Spanish',
    a: 'We validate with real clinical voices, starting at Gregorio Marañón.',
    icon: (
      <>
        <path d="M4 20 C10 10 16 30 24 20 S38 10 44 20" pathLength={1} />
        <path d="M4 30 C10 20 16 40 24 30 S38 20 44 30" pathLength={1} />
      </>
    ),
  },
];

function Barriers() {
  return (
    <div style={{ position: 'absolute', left: 120, top: 150, width: 1680 }}>
      <div className="mono" style={{ fontSize: 17, color: CORAL }}>
        Growth · the barriers
      </div>
      <h2 className="display" style={{ fontSize: 66, marginTop: 14, color: NAVY }}>
        <Words text="What stands in the way." delay={0.2} />
      </h2>
      <div style={{ display: 'flex', gap: 60, marginTop: 70 }}>
        {BARRIERS.map((b, i) => (
          <motion.div key={b.k} style={{ flex: 1, paddingTop: 26, borderTop: '2px solid rgba(255,110,66,0.6)' }} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease, delay: 0.8 + i * 0.35 }}>
            <svg className="draw-in" width={60} height={60} viewBox="0 0 48 48" fill="none" stroke={CORAL} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible', animationDelay: `${0.9 + i * 0.35}s` }}>
              {b.icon}
            </svg>
            <div className="display" style={{ fontSize: 32, fontWeight: 700, color: NAVY, marginTop: 18, lineHeight: 1.15 }}>
              {b.k}
            </div>
            <div className="body" style={{ fontSize: 24, color: 'rgba(9,38,52,0.72)', marginTop: 12, lineHeight: 1.4 }}>
              → {b.a}
            </div>
          </motion.div>
        ))}
      </div>
      <motion.div className="display" style={{ fontSize: 46, fontWeight: 700, color: CORAL, marginTop: 80 }} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease, delay: 2.6 }}>
        Once we clear them, they protect us.
      </motion.div>
    </div>
  );
}

// ---------- The gate: we pay to get through once; then it keeps others out ----------
const G = { x: 1470, ground: 930, post: 96, h: 210, start: 3.0 };

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

const cl = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease3 = (v: number) => (v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2);

function Gate() {
  const t = useElapsed();
  const k = t - G.start;
  if (k < 0) return null;
  const appear = ease3(cl(k / 0.6));
  // Opens, VoxWave passes, closes behind it.
  const open = ease3(cl((k - 0.6) / 0.6)) * (1 - ease3(cl((k - 2.5) / 0.5)));
  const half = G.post - 9; // each door spans from its post to the middle
  const doorW = half * (1 - 0.86 * open);
  const doorTop = G.ground - G.h + 18;
  const doorH = G.h - 18;
  // VoxWave's dot: from the left, through the gate, settles on the far side.
  const pass = ease3(cl((k - 1.0) / 1.4));
  const vx = G.x - 330 + pass * 600;
  const vy = G.ground - 46;
  const glow = k > 2.4 ? 0.5 + 0.5 * Math.sin(k * 3) : 0;
  // Late entrants: arrive after the gate has closed and bounce off it.
  const others = [0, 1, 2].map((j) => {
    const t0 = 3.1 + j * 0.28;
    const rest = G.x - G.post - 70 - j * 52;
    const hit = G.x - G.post - 22;
    const p = cl((k - t0) / 0.6);
    if (p < 1) return { x: G.x - 470 - j * 40 + (hit - (G.x - 470 - j * 40)) * p * p, o: p > 0 ? 1 : 0 };
    const b = k - t0 - 0.6;
    return { x: rest + (hit - rest) * Math.exp(-5 * b) * Math.cos(12 * b), o: 1 };
  });
  const lock = ease3(cl((k - 3.0) / 0.4));
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, overflow: 'visible' }} opacity={appear}>
      {/* ground */}
      <line x1={G.x - 520} x2={G.x + 380} y1={G.ground} y2={G.ground} stroke="rgba(9,38,52,0.25)" strokeWidth={2} />
      {/* doors (hinged at the posts) */}
      {[-1, 1].map((side) => {
        const hinge = G.x + side * (G.post - 9);
        const x = side < 0 ? hinge : hinge - doorW;
        return (
          <g key={side}>
            <rect x={x} y={doorTop} width={doorW} height={doorH} fill={NAVY} opacity={0.88} />
            {[0.25, 0.5, 0.75].map((f) => (
              <line key={f} x1={x + doorW * f} x2={x + doorW * f} y1={doorTop + 10} y2={doorTop + doorH - 10} stroke="#fbf9f5" strokeWidth={2} opacity={0.35} />
            ))}
          </g>
        );
      })}
      {/* posts and beam */}
      <rect x={G.x - G.post - 9} y={G.ground - G.h} width={18} height={G.h} rx={4} fill={NAVY} />
      <rect x={G.x + G.post - 9} y={G.ground - G.h} width={18} height={G.h} rx={4} fill={NAVY} />
      <rect x={G.x - G.post - 18} y={G.ground - G.h - 14} width={2 * G.post + 36} height={16} rx={6} fill={NAVY} />
      {/* the lock clicks shut once VoxWave is through */}
      {lock > 0 && (
        <g transform={`translate(${G.x} ${G.ground - G.h / 2})`} opacity={lock}>
          <rect x={-17} y={-6} width={34} height={28} rx={6} fill={CORAL} />
          <path d="M-10 -6 V-14 A10 10 0 0 1 10 -14 V-6" fill="none" stroke={CORAL} strokeWidth={5} />
        </g>
      )}
      {/* late entrants */}
      {others.map((d, j) => (
        <circle key={j} cx={d.x} cy={G.ground - 34} r={15} fill="rgba(9,38,52,0.28)" opacity={d.o} />
      ))}
      {/* VoxWave */}
      {k > 0.9 && (
        <g>
          {glow > 0 && <circle cx={vx} cy={vy} r={22 + glow * 10} fill="none" stroke={CORAL} strokeWidth={2} opacity={0.5 * (1 - glow * 0.6)} />}
          <circle cx={vx} cy={vy} r={22} fill={CORAL} />
          <text x={vx} y={vy - 40} textAnchor="middle" fontFamily="Sora, sans-serif" fontWeight={700} fontSize={20} fill={CORAL} opacity={cl((k - 2.3) / 0.5)}>
            VoxWave
          </text>
        </g>
      )}
    </svg>
  );
}

function Content() {
  return (
    <div className="content">
      <Barriers />
      <Gate />
    </div>
  );
}

export const S16: SlideDef = {
  id: 'S16',
  builds: 1,
  notes:
    "What stands in the way? Regulation: the CE mark and the FDA, built in from day one. Reimbursement: private clinics pay first. Every variety of Spanish: we validate with real clinical voices. And once we clear these barriers, they protect us.",
  theme: () => 'light',
  wave: () => ({ shape: wave({ y: 540, amp: 30 }), opacity: 0, duration: 1600, stagger: 0 }),
  bg: () => ({ pool: [0.5, 0.5], poolStrength: 1, warm: 0.6 }),
  Content,
};
