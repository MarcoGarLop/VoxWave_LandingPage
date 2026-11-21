import { motion } from 'motion/react';
import { C } from '../brand/tokens';
import type { SlideDef } from '../deck/types';
import { wave } from '../engine/shapes';
import { Words } from '../ui/motion';


/**
 * The science, still in the dark: four peer-reviewed studies unroll like sheets of
 * paper, each with what it found in big type. Then the light comes (VoxWave).
 */

const NAVY = C.navy;
const INK = 'rgba(9,38,52,0.62)';

const PAPERS = [
  {
    finding: 'The voice tracks how severe it is.',
    title: 'Nonlinear speech analysis algorithms mapped to a standard metric achieve clinically useful quantification of average Parkinson’s disease symptom severity',
    who: 'Tsanas et al. · 2011',
  },
  {
    finding: 'It changes years before diagnosis.',
    title: 'Speech biomarkers in rapid eye movement sleep behavior disorder and Parkinson disease',
    who: 'Rusz et al. · 2021',
  },
  {
    finding: 'Everyday recordings catch it early.',
    title: 'Smartphone voice calls provide early biomarkers of parkinsonism in rapid eye movement sleep behavior disorder',
    who: 'Illner et al. · 2024',
  },
  {
    finding: 'It can be measured at home.',
    title: 'Reliability and validity of the Roche PD Mobile Application for remote monitoring of early Parkinson’s disease',
    who: 'Lipsmeier et al. · 2022',
  },
];

const SHEET = { w: 820, h: 250, x0: 120, x1: 980, y0: 392, gap: 28 };
const T = { sheet0: 1.0, sheetGap: 0.45, unroll: 0.9 };

function Sheet({ k }: { k: number }) {
  const p = PAPERS[k];
  const x = k % 2 === 0 ? SHEET.x0 : SHEET.x1;
  const y = SHEET.y0 + Math.floor(k / 2) * (SHEET.h + SHEET.gap);
  const d = T.sheet0 + k * T.sheetGap;
  const roll = { duration: T.unroll, ease: [0.45, 0, 0.2, 1] as [number, number, number, number], delay: d };
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: SHEET.w, height: SHEET.h }}>
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, #fffefb 0%, #f3efe6 100%)',
          borderRadius: 4,
          boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
          overflow: 'hidden',
        }}
        initial={{ clipPath: 'inset(0 0 100% 0)' }}
        animate={{ clipPath: 'inset(0 0 0% 0)' }}
        transition={roll}
      >
        <div className="display" style={{ position: 'absolute', left: 38, right: 38, top: 32, fontSize: 38, fontWeight: 700, lineHeight: 1.12, color: NAVY }}>
          {p.finding}
        </div>
        <div className="body" style={{ position: 'absolute', left: 38, right: 38, bottom: 58, fontSize: 17, lineHeight: 1.35, color: INK, fontStyle: 'italic' }}>
          {p.title}
        </div>
        <div className="mono" style={{ position: 'absolute', left: 38, bottom: 24, fontSize: 14, color: C.coral }}>
          {p.who}
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 10, background: 'linear-gradient(180deg, rgba(9,38,52,0.08), transparent)' }} />
      </motion.div>
      {/* The paper roll travelling down as the sheet unrolls. */}
      <motion.div
        style={{
          position: 'absolute',
          left: -6,
          right: -6,
          height: 24,
          marginTop: -12,
          borderRadius: 12,
          background: 'linear-gradient(180deg, #e9e3d7 0%, #fffdf8 38%, #f3eee4 62%, #d8d0c1 100%)',
          boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
        }}
        initial={{ top: 0, opacity: 1, scaleY: 1 }}
        animate={{ top: SHEET.h, opacity: 0, scaleY: 0.4 }}
        transition={{ top: roll, opacity: { duration: 0.3, delay: d + T.unroll - 0.1 }, scaleY: { duration: 0.3, delay: d + T.unroll - 0.1 } }}
      />
    </div>
  );
}

function Content() {
  return (
    <div className="content">
      <div style={{ position: 'absolute', left: 120, top: 110 }}>
        <motion.div className="mono" style={{ fontSize: 18, color: 'var(--coral)' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.2 }}>
          Peer-reviewed science
        </motion.div>
        <h2 className="display" style={{ fontSize: 88, marginTop: 14, lineHeight: 1.02 }}>
          <Words text="The voice can be" delay={0.3} /> <Words text="measured." delay={0.6} wordClass={() => 'coral'} />
        </h2>
      </div>
      {PAPERS.map((_, k) => (
        <Sheet key={k} k={k} />
      ))}
    </div>
  );
}

export const S03E: SlideDef = {
  id: 'S03E',
  builds: 1,
  notes:
    "And science tells us something powerful: the voice can be measured. It tracks how severe the disease is. It changes years before diagnosis. Everyday recordings catch it early. And it works from home.",
  wave: () => ({ shape: wave({ y: 540, amp: 30 }), opacity: 0, duration: 1200, stagger: 0 }),
  particles: () => null,
  bg: () => ({ pool: [0.5, 0.5], poolStrength: 0.9, warm: 0.7 }),
  Content,
};
