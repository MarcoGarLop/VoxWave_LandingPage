import { motion } from 'motion/react';
import { C, EASE } from '../brand/tokens';
import type { SlideDef } from '../deck/types';
import { wave } from '../engine/shapes';

const ease = EASE as unknown as [number, number, number, number];

/**
 * Who we build it with: each partner lands on the page like a rubber stamp; the
 * researchers we are talking to follow, lighter.
 */

const NAVY = C.navy, TEAL = C.teal, CORAL = C.coral;

// ---------- Timeline (s since the slide appeared) ----------
const T = { heads: 0.2, stamp0: 0.9, stampGap: 0.75 };

// ---------- The collaborators, stamped onto the page ----------
const STAMPS = [
  {
    logo: <img src="/media/partners/maranon_color.svg" alt="" style={{ width: 430, display: 'block' }} />,
    names: ['Dr. Gustavo Arrieta', 'Dr. Andrés Pastor'],
    tag: 'Clinical partner · Madrid',
    rot: -2.4,
  },
  {
    logo: <img src="/media/partners/fep_color.png" alt="" style={{ height: 122, display: 'block' }} />,
    names: ['Cristina Ibarrola'],
    tag: 'Asociación Navarra de Parkinson',
    rot: 1.8,
  },
];
const STAMP = { w: 780, h: 300, top: 330 };
const stampX = (k: number) => 120 + k * (STAMP.w + 120);

// Researchers we're talking to: lighter than the two stamps, but on the page.
const UNIS = [
  { name: 'University of Tartu', country: 'Estonia' },
  { name: 'Kaunas University of Technology', country: 'Lithuania' },
];

function Stamp({ k }: { k: number }) {
  const s = STAMPS[k];
  const d = T.stamp0 + k * T.stampGap;
  return (
    <div style={{ position: 'absolute', left: stampX(k), top: STAMP.top, width: STAMP.w, height: STAMP.h }}>
      {/* Ink ring that spreads on impact. */}
      <motion.div
        style={{ position: 'absolute', inset: 0, borderRadius: 30, border: `3px solid ${TEAL}` }}
        initial={{ opacity: 0, scale: 1 }}
        animate={{ opacity: [0, 0.35, 0], scale: [1, 1.06, 1.12] }}
        transition={{ duration: 0.7, delay: d + 0.28, ease: 'easeOut' }}
      />
      {/* The stamp: drops from above, hits, settles with a tiny rebound. */}
      <motion.div
        // Own GPU layer: the inked (filtered) edge is painted once, not on every frame of the drop.
        style={{ position: 'absolute', inset: 0, transformOrigin: '50% 50%', willChange: 'transform, opacity' }}
        initial={{ opacity: 0, scale: 1.55, rotate: s.rot - 7, y: -30 }}
        animate={{ opacity: [0, 1, 1, 1], scale: [1.55, 0.97, 1.015, 1], rotate: [s.rot - 7, s.rot + 0.4, s.rot - 0.1, s.rot], y: [-30, 0, 0, 0] }}
        transition={{ duration: 0.75, delay: d, times: [0, 0.42, 0.7, 1], ease: [0.5, 0, 0.75, 0] }}
      >
        <svg width={STAMP.w} height={STAMP.h} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
          <defs>
            {/* Rough inked edge, like rubber on paper. */}
            <filter id={`ink-${k}`} x="-5%" y="-5%" width="110%" height="110%">
              <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={k + 3} />
              <feDisplacementMap in="SourceGraphic" scale={2.6} />
            </filter>
          </defs>
          <g filter={`url(#ink-${k})`} fill="none" stroke={TEAL} opacity={0.9}>
            <rect x={3} y={3} width={STAMP.w - 6} height={STAMP.h - 6} rx={28} strokeWidth={4} />
            <rect x={14} y={14} width={STAMP.w - 28} height={STAMP.h - 28} rx={20} strokeWidth={1.6} />
          </g>
        </svg>
        <div className="mono" style={{ position: 'absolute', left: 0, right: 0, top: 36, textAlign: 'center', fontSize: 15, letterSpacing: '0.3em', color: TEAL }}>
          {s.tag}
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 72, height: 132, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.logo}</div>
        <div className="display" style={{ position: 'absolute', left: 0, right: 0, bottom: 34, textAlign: 'center', fontSize: 28, fontWeight: 600, color: NAVY }}>
          {s.names.join('  ·  ')}
        </div>
      </motion.div>
    </div>
  );
}

function Heading({ x, eyebrow, text, delay }: { x: number; eyebrow: string; text: string; delay: number }) {
  return (
    <motion.div style={{ position: 'absolute', left: x, top: 92 }} initial={{ opacity: 0, y: 14, filter: 'blur(8px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ duration: 0.9, ease, delay }}>
      <div className="mono" style={{ fontSize: 17, color: CORAL, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ width: 9, height: 9, borderRadius: 5, background: CORAL, display: 'inline-block' }} />
        {eyebrow}
      </div>
      <h2 className="display" style={{ fontSize: 52, marginTop: 16, color: NAVY }}>
        {text}
      </h2>
    </motion.div>
  );
}

function Content() {
  return (
    <div className="content">
      <Heading x={120} eyebrow="Built with" text="Our collaborators" delay={T.heads} />
      {STAMPS.map((_, k) => (
        <Stamp key={k} k={k} />
      ))}
      <motion.div
        style={{ position: 'absolute', left: 120, right: 120, top: STAMP.top + STAMP.h + 90, textAlign: 'center' }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease, delay: T.stamp0 + 2 * T.stampGap + 0.2 }}
      >
        <div className="mono" style={{ fontSize: 16, color: TEAL }}>
          And in conversation with researchers at
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 70, marginTop: 18, whiteSpace: 'nowrap' }}>
          {UNIS.map((u) => (
            <div key={u.name}>
              <span className="display" style={{ fontSize: 30, fontWeight: 600, color: NAVY }}>
                {u.name}
              </span>
              <span className="body" style={{ fontSize: 22, color: 'rgba(9,38,52,0.6)', marginLeft: 10 }}>
                {u.country}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export const S06: SlideDef = {
  id: 'S06',
  builds: 1,
  notes:
    "And we're not doing this alone. We're working with Dr. Gustavo Arrieta and Dr. Andrés Pastor at Gregorio Marañón, with Cristina Ibarrola at the Navarra Parkinson's Association, and with researchers in Estonia and Lithuania.",
  theme: () => 'light',
  wave: () => ({ shape: wave({ y: 540, amp: 30 }), opacity: 0, duration: 1600, stagger: 0 }),
  bg: () => ({ pool: [0.5, 0.5], poolStrength: 1, warm: 0.6 }),
  Content,
};
