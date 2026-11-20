import { motion } from 'motion/react';
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

function Content() {
  return (
    <div className="content">
      <Barriers />
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
