import { motion } from 'motion/react';
import { C, EASE } from '../brand/tokens';
import type { SlideDef } from '../deck/types';
import { put } from '../engine/paint';
import { wave } from '../engine/shapes';
import { Words } from '../ui/motion';

const ease = EASE as unknown as [number, number, number, number];

/**
 * Just the beginning — back in the dark, many voices braided at the bottom.
 * One voice model: other languages (our own preprint) and other diseases (stroke,
 * from published research).
 */

const CORAL = C.coral;

const PATHS = [
  {
    k: 'Other languages',
    big: '0.79',
    line: 'Trained only on Spanish, our model recognises Parkinson’s in English. No retraining.',
    src: 'VoxWave preprint · 2026',
  },
  {
    k: 'Other diseases',
    big: '97%',
    line: 'Speech AI already tells post-stroke speech apart from healthy speech.',
    src: 'Sanguedolce et al. · Interspeech 2025 · F1 score',
  },
];

function Content() {
  return (
    <div className="content">
      <div style={{ position: 'absolute', left: 120, top: 120, width: 1680 }}>
        <motion.div className="mono" style={{ fontSize: 18, color: CORAL }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.2 }}>
          And this is just the beginning
        </motion.div>
        <h2 className="display" style={{ fontSize: 92, marginTop: 16, lineHeight: 1.04 }}>
          <Words text="One voice model." delay={0.4} />
        </h2>
        <h2 className="display coral" style={{ fontSize: 92, lineHeight: 1.04 }}>
          <Words text="Many languages. Many diseases." delay={1.0} />
        </h2>
      </div>
      <div style={{ position: 'absolute', left: 120, top: 470, width: 1680, display: 'flex', gap: 90 }}>
        {PATHS.map((p, i) => (
          <motion.div key={p.k} style={{ flex: 1, paddingTop: 26, borderTop: '2px solid rgba(255,110,66,0.6)' }} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease, delay: 2.0 + i * 0.6 }}>
            <div className="mono" style={{ fontSize: 17, color: 'var(--ink-70)' }}>
              {p.k}
            </div>
            <div className="number coral" style={{ fontSize: 110, lineHeight: 1, marginTop: 12 }}>
              {p.big}
            </div>
            <div className="display" style={{ fontSize: 32, fontWeight: 600, marginTop: 14, lineHeight: 1.2 }}>
              {p.line}
            </div>
            <div className="mono" style={{ fontSize: 12, marginTop: 14, opacity: 0.6 }}>
              {p.src}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

const coral = (out: Float32Array, n: number) => {
  for (let i = 0; i < n; i++) put(out, i, C.coral, 1);
};

export const S18: SlideDef = {
  id: 'S18',
  builds: 1,
  notes:
    "And this is just the beginning. Trained only on Spanish, our model already recognises Parkinson's in English. And voice AI already detects stroke, with a ninety-seven percent score in recent research. One voice model. Many languages. Many diseases.",
  theme: () => 'dark',
  // Many voices, braided: the same model listening to more than one language and disease.
  wave: () => ({
    shape: wave({ y: 960, amp: 46, speed: 1.2 }),
    paint: coral,
    echoTint: [C.paper, C.tealBright],
    core: 1.4,
    glow: 1.1,
    echoes: 0.9,
    opacity: 1,
    duration: 2200,
    stagger: 0.3,
    dir: 1,
  }),
  bg: () => ({ pool: [0.5, 0.6], poolStrength: 1, warm: 0.8 }),
  Content,
};
