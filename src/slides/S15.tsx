import { motion } from 'motion/react';
import { C, EASE } from '../brand/tokens';
import type { SlideDef } from '../deck/types';
import { put } from '../engine/paint';
import { path } from '../engine/shapes';
import { At, Fade, Words } from '../ui/motion';

const ease = EASE as unknown as [number, number, number, number];

// Three rising steps.
const SX = [980, 1250, 1520, 1800];
const SY = [820, 640, 460, 280];
const STEP_PTS: [number, number][] = [
  [SX[0] - 40, SY[0] + 0],
  [SX[1], SY[0]],
  [SX[1], SY[1]],
  [SX[2], SY[1]],
  [SX[2], SY[2]],
  [SX[3], SY[2]],
];

const STEPS = [
  { n: '01', t: 'Clinical validation', d: 'Pilot with Gregorio Marañón · Spanish speech data (NeuroVoz)' },
  { n: '02', t: 'First revenue', d: 'Private clinics, hospital groups and insurers in Madrid · free 3-month pilot → paid contract' },
  { n: '03', t: 'Public health', d: 'Comunidad de Madrid, then other regions, with the pilot data as proof' },
];

/** Light the steps reached so far; the rest stays faint. */
function paintSteps(upto: number) {
  // cumulative length fractions where each step ends
  const segs = STEP_PTS.slice(1).map((p, i) => Math.hypot(p[0] - STEP_PTS[i][0], p[1] - STEP_PTS[i][1]));
  const total = segs.reduce((a, b) => a + b, 0);
  const ends = [segs[0] + segs[1], segs[0] + segs[1] + segs[2] + segs[3], total].map((v) => v / total);
  return (out: Float32Array, n: number) => {
    for (let i = 0; i < n; i++) {
      const u = i / (n - 1);
      const lit = u <= ends[upto] + 0.002;
      put(out, i, lit ? C.coral : C.muted, lit ? 1 : 0.22);
    }
  };
}

function Content({ build }: { build: number }) {
  return (
    <div className="content">
      <div className="text-col" style={{ top: 150, width: 720 }}>
        <div className="mono" style={{ fontSize: 15, color: 'var(--coral)' }}>
          Go-to-market
        </div>
        <h2 className="display d-88" style={{ marginTop: 18 }}>
          <Words text="Three steps to the market." delay={0.4} />
        </h2>
        <Fade delay={1.4}>
          <p className="body" style={{ marginTop: 22 }}>
            Neurologists recommend it. The patients’ association is our channel to patients.
          </p>
          <div style={{ marginTop: 36, display: 'flex', gap: 46 }}>
            <div>
              <div className="number" style={{ fontSize: 50 }}>≈ €2,000</div>
              <div className="mono" style={{ fontSize: 12, marginTop: 6 }}>to win a clinic · back in ≈ 6 months</div>
            </div>
            <div>
              <div className="number" style={{ fontSize: 50 }}>3–6 / 12–24</div>
              <div className="mono" style={{ fontSize: 12, marginTop: 6 }}>months sales cycle · private / public</div>
            </div>
          </div>
        </Fade>
      </div>

      {STEPS.map((s, i) => (
        <At key={s.n} build={build} at={i}>
          <motion.div
            key={s.n}
            style={{ position: 'absolute', left: SX[i] + 14, top: SY[i] - 168, width: i === 2 ? 270 : 238 }}
            initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease, delay: 0.9 }}
          >
            <div className="mono" style={{ fontSize: 14, color: 'var(--coral)' }}>
              {s.n}
            </div>
            <div className="display" style={{ fontSize: 29, marginTop: 6 }}>
              {s.t}
            </div>
            <div className="body" style={{ fontSize: 18, lineHeight: 1.35, marginTop: 8 }}>
              {s.d}
            </div>
          </motion.div>
        </At>
      ))}
    </div>
  );
}

export const S15: SlideDef = {
  id: 'S15',
  builds: 3,
  auto: [6, 6],
  notes:
    'Go-to-market. A clinical pilot with Gregorio Marañón, then free three-month pilots in private clinics that turn into paid contracts, with neurologists and the patient association as our champions.',
  wave: (b) => ({
    // The curve becomes a staircase.
    shape: path(STEP_PTS, 0.8),
    paint: paintSteps(b),
    core: 1.7,
    glow: 1,
    echoes: 0.15,
    duration: b === 0 ? 3200 : 1800,
    stagger: b === 0 ? 0.4 : 0.6,
    dir: 1,
  }),
  bg: () => ({ pool: [0.72, 0.45], poolStrength: 1, warm: 0.6 }),
  Content,
};
