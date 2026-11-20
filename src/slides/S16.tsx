import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { C, EASE } from '../brand/tokens';
import { useAdvance, useEngine } from '../deck/engineContext';
import type { SlideDef } from '../deck/types';
import { wave } from '../engine/shapes';
import { media } from '../media/preload';
import { At, Words } from '../ui/motion';

const ease = EASE as unknown as [number, number, number, number];

/**
 * Growth & barriers — a change of style: night, space, the Earth (Kling).
 * Build 0: the coral light spreads from Madrid, across the Atlantic, over the
 * Americas and the world; the market numbers land in sync with the image.
 * Build 1: the last frame stays, dimmed, and the three barriers appear with how we
 * clear each one — and why, once cleared, they protect us.
 */

const CORAL = C.coral;
const PAPER = C.paper;
const CLIP = '/media/world/world.mp4';

// When each market number lands (clip seconds).
const MARKETS = [
  { at: 0.8, label: 'Spain', big: '200,000+', small: 'patients · where we start' },
  { at: 6.6, label: 'US Hispanic community', big: '68M', small: 'people · highest Parkinson’s incidence' },
  { at: 8.0, label: 'Spanish-speaking world', big: '≈ 2.3M', small: 'patients · ≈ €1.1B a year' },
  { at: 9.3, label: 'The world', big: '11.8M', small: 'patients · every language says “aah”' },
];
const HOLD_AFTER = 2.2; // seconds on the last frame before the barriers

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

/** Keeps the WebGL engine asleep while the fullscreen clip covers it. */
function useSuspend() {
  const eng = useEngine();
  useEffect(() => {
    const e = eng?.current;
    if (!e) return;
    e.suspended = true;
    return () => {
      e.suspended = false;
    };
  }, [eng]);
}

function World({ build }: { build: number }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [src] = useState(() => media(CLIP));
  const [time, setTime] = useState(0);
  const [ended, setEnded] = useState(false);
  const advance = useAdvance();
  useSuspend();
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.currentTime = 0;
    v.play().catch(() => {});
  }, []);
  useEffect(() => {
    if (!ended || build !== 0) return;
    const id = window.setTimeout(advance, HOLD_AFTER * 1000);
    return () => window.clearTimeout(id);
  }, [ended, build, advance]);
  const dim = build >= 1;
  return (
    <>
      <video
        ref={ref}
        src={src}
        muted
        playsInline
        preload="auto"
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onEnded={() => setEnded(true)}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
      />
      {/* Left shade so the numbers read; deepens for the barriers. */}
      <motion.div
        style={{ position: 'absolute', inset: 0 }}
        animate={{
          background: dim
            ? 'linear-gradient(90deg, rgba(4,20,28,0.94) 0%, rgba(4,20,28,0.86) 55%, rgba(4,20,28,0.7) 100%)'
            : 'linear-gradient(0deg, rgba(4,20,28,0.9) 0%, rgba(4,20,28,0.55) 20%, rgba(4,20,28,0) 42%)',
        }}
        transition={{ duration: 1.2, ease }}
      />
      {/* The markets, stacked, none ever leaves */}
      <motion.div style={{ position: 'absolute', left: 120, right: 120, top: 852, display: 'flex', gap: 40 }} animate={{ opacity: dim ? 0 : 1, y: dim ? 20 : 0 }} transition={{ duration: 0.8, ease }}>
        {MARKETS.map((m, i) => {
          const on = time >= m.at || ended;
          const latest = on && (i === MARKETS.length - 1 || time < MARKETS[i + 1].at) && !ended;
          return (
            <motion.div key={m.label} style={{ flex: 1 }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: on ? 1 : 0, y: on ? 0 : 16 }} transition={{ duration: 0.8, ease }}>
              <div className="mono" style={{ fontSize: 15, color: latest ? CORAL : 'rgba(241,237,228,0.6)' }}>
                {m.label}
              </div>
              <div className="number" style={{ fontSize: 64, lineHeight: 1, marginTop: 6, color: latest || i === MARKETS.length - 1 ? CORAL : PAPER }}>
                {m.big}
              </div>
              <div className="body" style={{ fontSize: 19, marginTop: 8, color: 'rgba(241,237,228,0.75)' }}>
                {m.small}
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </>
  );
}

function Barriers() {
  return (
    <div style={{ position: 'absolute', left: 120, top: 210, width: 1680 }}>
      <div className="mono" style={{ fontSize: 17, color: CORAL }}>
        Growth · the barriers
      </div>
      <h2 className="display" style={{ fontSize: 66, marginTop: 14, color: PAPER }}>
        <Words text="What stands in the way." delay={0.2} />
      </h2>
      <div style={{ display: 'flex', gap: 60, marginTop: 70 }}>
        {BARRIERS.map((b, i) => (
          <motion.div key={b.k} style={{ flex: 1, paddingTop: 26, borderTop: '2px solid rgba(255,110,66,0.6)' }} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease, delay: 0.8 + i * 0.35 }}>
            <svg className="draw-in" width={60} height={60} viewBox="0 0 48 48" fill="none" stroke={CORAL} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible', animationDelay: `${0.9 + i * 0.35}s` }}>
              {b.icon}
            </svg>
            <div className="display" style={{ fontSize: 32, fontWeight: 700, color: PAPER, marginTop: 18, lineHeight: 1.15 }}>
              {b.k}
            </div>
            <div className="body" style={{ fontSize: 24, color: 'rgba(241,237,228,0.78)', marginTop: 12, lineHeight: 1.4 }}>
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

function Content({ build }: { build: number }) {
  return (
    <div className="content">
      <World build={build} />
      <div className="mono" style={{ position: 'absolute', left: 120, top: 62, fontSize: 18, color: PAPER, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ width: 10, height: 10, borderRadius: 5, background: CORAL, display: 'inline-block' }} />
        Growth
      </div>
      <At build={build} at={0} until={1}>
        <motion.h2 key="where" className="display" style={{ position: 'absolute', left: 120, top: 104, fontSize: 60, color: PAPER }} exit={{ opacity: 0 }}>
          <Words text="Where we grow." delay={0.4} />
        </motion.h2>
      </At>
      <At build={build} at={1}>
        <Barriers key="barriers" />
      </At>
    </div>
  );
}

export const S16: SlideDef = {
  id: 'S16',
  builds: 2,
  // The clip drives the first build; it advances itself when it ends.
  auto: [Infinity],
  notes:
    "From Spain, to two point three million Spanish-speaking patients, to twelve million worldwide. What stands in the way? Regulation: we build for the CE mark and the FDA from day one. Reimbursement: private clinics pay first. And every variety of Spanish: we validate with real clinical voices. Once we clear these barriers, they protect us.",
  theme: () => 'black',
  wave: () => ({ shape: wave({ y: 540, amp: 30 }), opacity: 0, duration: 1600, stagger: 0 }),
  bg: () => ({ pool: [0.5, 0.5], poolStrength: 1, warm: 0.6 }),
  Content,
};
