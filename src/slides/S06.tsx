import { motion } from 'motion/react';
import { C, EASE } from '../brand/tokens';
import type { SlideDef } from '../deck/types';
import { wave } from '../engine/shapes';
import { DrawnFormula, prewarmTex } from '../ui/DrawnFormula';

const ease = EASE as unknown as [number, number, number, number];

/**
 * The evidence, minimal and physical: on the left each study unrolls like a sheet
 * of paper; on the right each collaborator lands on the page like a rubber stamp.
 */

const NAVY = C.navy, TEAL = C.teal, CORAL = C.coral;

// ---------- Timeline (s since the slide appeared) ----------
const T = { heads: 0.2, rule: 0.3, sheet0: 0.7, sheetGap: 0.55, unroll: 1.0, stamp0: 3.3, stampGap: 0.75 };

// ---------- The studies (titles split by hand: MathJax doesn't wrap) ----------
const PAPERS = [
  {
    title: ['Nonlinear speech analysis algorithms mapped to a standard', 'metric achieve clinically useful quantification of average', "Parkinson's disease symptom severity"],
    who: 'Tsanas et al. · 2011',
  },
  {
    title: ['Speech biomarkers in rapid eye movement sleep', 'behavior disorder and Parkinson disease'],
    who: 'Rusz et al. · 2021',
  },
  {
    title: ['Smartphone voice calls provide early biomarkers of', 'parkinsonism in rapid eye movement sleep behavior disorder'],
    who: 'Illner et al. · 2024',
  },
  {
    title: ['Reliability and validity of the Roche PD Mobile Application', "for remote monitoring of early Parkinson's disease"],
    who: 'Lipsmeier et al. · 2022',
  },
];
const LINE = 33; // px per title line
const sheetH = (lines: number) => 30 + lines * LINE + 52;
const SHEET_W = 800;
const SHEETS_TOP = 250;
const SHEET_GAP = 18;
const sheetTop = (k: number) => SHEETS_TOP + PAPERS.slice(0, k).reduce((a, p) => a + sheetH(p.title.length) + SHEET_GAP, 0);

const tex = (line: string) => String.raw`\text{${line.replace(/([&%$#_{}])/g, '\\$1')}}`;

prewarmTex(PAPERS.flatMap((p) => p.title).map(tex));

/** A sheet that unrolls downwards from a paper roll, then the roll vanishes. */
function Sheet({ k }: { k: number }) {
  const p = PAPERS[k];
  const h = sheetH(p.title.length);
  const d = T.sheet0 + k * T.sheetGap;
  const roll = { duration: T.unroll, ease: [0.45, 0, 0.2, 1] as [number, number, number, number], delay: d };
  return (
    <div style={{ position: 'absolute', left: 120, top: sheetTop(k), width: SHEET_W, height: h }}>
      {/* The sheet, revealed from the top as the roll travels down. */}
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, #fffefb 0%, #fbf8f2 100%)',
          borderRadius: 4,
          boxShadow: '0 14px 34px rgba(9,38,52,0.10), 0 2px 6px rgba(9,38,52,0.06)',
          overflow: 'hidden',
        }}
        initial={{ clipPath: 'inset(0 0 100% 0)' }}
        animate={{ clipPath: 'inset(0 0 0% 0)' }}
        transition={roll}
      >
        <div style={{ position: 'absolute', left: 34, top: 26, display: 'flex', flexDirection: 'column', gap: LINE - 27 }}>
          {p.title.map((line, i) => (
            <DrawnFormula key={i} tex={tex(line)} size={22.5} still color={NAVY} />
          ))}
        </div>
        <div className="mono" style={{ position: 'absolute', left: 34, bottom: 17, fontSize: 15, color: CORAL }}>
          {p.who}
        </div>
        {/* A faint fold where the paper was rolled. */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 10, background: 'linear-gradient(180deg, rgba(9,38,52,0.07), transparent)' }} />
      </motion.div>
      {/* The roll itself: a paper cylinder with light and shadow, travelling down. */}
      <motion.div
        style={{
          position: 'absolute',
          left: -6,
          right: -6,
          height: 26,
          marginTop: -13,
          borderRadius: 13,
          background: 'linear-gradient(180deg, #e9e3d7 0%, #fffdf8 38%, #f3eee4 62%, #d8d0c1 100%)',
          boxShadow: '0 8px 16px rgba(9,38,52,0.16)',
        }}
        initial={{ top: 0, opacity: 1, scaleY: 1 }}
        animate={{ top: h, opacity: 0, scaleY: 0.4 }}
        transition={{ top: roll, opacity: { duration: 0.35, delay: d + T.unroll - 0.1 }, scaleY: { duration: 0.35, delay: d + T.unroll - 0.1 } }}
      />
    </div>
  );
}

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
const STAMP = { x: 1062, w: 700, h: 276 };
const stampTop = (k: number) => 250 + k * (STAMP.h + 36);

// Researchers we're talking to: lighter than the two stamps, but on the page.
const UNIS = [
  { name: 'University of Tartu', country: 'Estonia' },
  { name: 'Kaunas University of Technology', country: 'Lithuania' },
];

function Stamp({ k }: { k: number }) {
  const s = STAMPS[k];
  const d = T.stamp0 + k * T.stampGap;
  return (
    <div style={{ position: 'absolute', left: STAMP.x, top: stampTop(k), width: STAMP.w, height: STAMP.h }}>
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
      <Heading x={120} eyebrow="Peer-reviewed" text="Scientific evidence behind us" delay={T.heads} />
      <Heading x={STAMP.x} eyebrow="Built with" text="Our collaborators" delay={T.heads + 0.15} />
      <motion.div
        style={{ position: 'absolute', left: 991, top: 104, width: 1.5, height: 880, background: 'rgba(9,38,52,0.12)', transformOrigin: '50% 0%' }}
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 1.4, ease, delay: T.rule }}
      />
      {PAPERS.map((_, k) => (
        <Sheet key={k} k={k} />
      ))}
      {STAMPS.map((_, k) => (
        <Stamp key={k} k={k} />
      ))}
      <motion.div
        style={{ position: 'absolute', left: STAMP.x, top: stampTop(2) + 4, width: STAMP.w }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease, delay: T.stamp0 + 2 * T.stampGap + 0.2 }}
      >
        <div className="mono" style={{ fontSize: 14, color: TEAL }}>
          And in conversation with researchers at
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 10, whiteSpace: 'nowrap' }}>
          {UNIS.map((u) => (
            <div key={u.name}>
              <span className="display" style={{ fontSize: 23, fontWeight: 600, color: NAVY }}>
                {u.name}
              </span>
              <span className="body" style={{ fontSize: 18, color: 'rgba(9,38,52,0.6)', marginLeft: 8 }}>
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
    "And this isn't a hunch. Peer-reviewed research shows the voice tracks Parkinson's, even before diagnosis, from home and on ordinary phones. And we're building it with Dr. Gustavo Arrieta and Dr. Andrés Pastor at Gregorio Marañón, and Cristina Ibarrola at the Navarra Parkinson's Association.",
  theme: () => 'light',
  wave: () => ({ shape: wave({ y: 540, amp: 30 }), opacity: 0, duration: 1600, stagger: 0 }),
  bg: () => ({ pool: [0.5, 0.5], poolStrength: 1, warm: 0.6 }),
  Content,
};
