import * as THREE from 'three';
import { motion } from 'motion/react';
import { C, EASE } from '../brand/tokens';
import type { SlideDef } from '../deck/types';
import { put } from '../engine/paint';
import type { ParticleTarget } from '../engine/Particles';
import { wave } from '../engine/shapes';
import { At, Counter, Fade, Words } from '../ui/motion';

const ease = EASE as unknown as [number, number, number, number];

// 255 sessions a year (365 days x 70% adherence) vs 3 visits.
const SESSIONS = 255;
const COLS = 17, ROWS = 15;
const GX = 1050, GY = 250, SX = 42, SY = 34;
const VISITS = [
  [840, 330],
  [840, 470],
  [840, 610],
] as const;

const coral = new THREE.Color(C.coral);
const paper = new THREE.Color(C.paper);

function dataTarget(dim: number): ParticleTarget {
  return (pos, col, size, n, t) => {
    for (let i = 0; i < n; i++) {
      let x = 0, y = -200, a = 0, c = coral, s = 1;
      if (i < SESSIONS) {
        const cc = i % COLS, rr = Math.floor(i / COLS);
        x = GX + cc * SX;
        y = GY + rr * SY + Math.sin(t * 1.2 + i * 0.37) * 1.5;
        a = 0.95 * dim;
        s = 2.1;
      } else if (i < SESSIONS + VISITS.length) {
        const v = VISITS[i - SESSIONS];
        x = v[0];
        y = v[1];
        a = dim;
        c = paper;
        s = 4.2;
      } else {
        x = 960;
        y = -400;
      }
      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = 0;
      col[i * 4] = c.r;
      col[i * 4 + 1] = c.g;
      col[i * 4 + 2] = c.b;
      col[i * 4 + 3] = a;
      size[i] = s;
    }
  };
}

/** Points start above the frame and rain down into their places. */
function rainSeed(pos: Float32Array, col: Float32Array, n: number) {
  for (let i = 0; i < n; i++) {
    const cc = i % COLS;
    pos[i * 3] = i < SESSIONS ? GX + cc * SX : 840;
    pos[i * 3 + 1] = -60 - ((i * 37) % 300);
    pos[i * 3 + 2] = 0;
    col[i * 4] = coral.r;
    col[i * 4 + 1] = coral.g;
    col[i * 4 + 2] = coral.b;
    col[i * 4 + 3] = 0;
  }
}

const order = (() => {
  const o = new Float32Array(20000);
  for (let i = 0; i < o.length; i++) o[i] = i < SESSIONS ? (Math.floor(i / COLS) / ROWS) * 0.7 + ((i * 7919) % 97) / 97 * 0.3 : 0;
  return o;
})();

// ---------- KPI table ----------
const KPIS = [
  ['Detect earlier', 'Days from first sustained voice change to neurologist review', '90–180 days', '< 14 days'],
  ['Act earlier', 'Alerts that lead to a clinical action (medication, therapy, earlier visit)', 'Not measured', '≥ 30%'],
  ['Fewer emergencies', 'Emergency admissions per 100 patient-years vs. matched control', 'Control group', '−15% by year 3'],
  ['Used every day', 'Daily sessions completed', '—', '≥ 70%'],
  ['Safe', 'False alarms per patient-year', '—', '≤ 1'],
];

function Table() {
  return (
    <div className="glass glass-lite" style={{ position: 'absolute', left: 120, top: 330, width: 1680, padding: '18px 40px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr 220px 240px', gap: 20, padding: '14px 0', borderBottom: '1px solid rgba(241,237,228,0.14)' }}>
        {['Outcome', 'Indicator', 'Today', 'Target'].map((h, i) => (
          <div key={h} className="mono" style={{ fontSize: 13, color: i === 3 ? 'var(--coral)' : undefined }}>
            {h}
          </div>
        ))}
      </div>
      {KPIS.map((r, i) => (
        <motion.div
          key={r[0]}
          style={{ display: 'grid', gridTemplateColumns: '300px 1fr 220px 240px', gap: 20, padding: '20px 0', borderBottom: i < KPIS.length - 1 ? '1px solid rgba(241,237,228,0.08)' : 'none', alignItems: 'baseline' }}
          initial={{ opacity: 0, x: -14 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease, delay: 0.4 + i * 0.2 }}
        >
          <div className="display" style={{ fontSize: 30 }}>
            {r[0]}
          </div>
          <div className="body" style={{ fontSize: 22 }}>
            {r[1]}
          </div>
          <div className="body" style={{ fontSize: 24, color: 'var(--ink-60)' }}>
            {r[2]}
          </div>
          <div className="number coral" style={{ fontSize: 34 }}>
            {r[3]}
          </div>
        </motion.div>
      ))}
      <div className="mono" style={{ fontSize: 12, marginTop: 14, marginBottom: 6 }}>
        Targets are hypotheses the pilot will measure · also quality of life (PDQ-8), caregiver burden (Zarit) and neurologist time per report (&lt; 2 min)
      </div>
    </div>
  );
}

function Pilot() {
  const facts = [
    ['Design', 'Prospective, with a matched control group (usual care)'],
    ['Where', 'Gregorio Marañón + 1–2 private clinics in Madrid'],
    ['Size', '≈ 60 patients · 6 months'],
    ['Primary endpoint', 'Days from first sustained change to clinical action'],
    ['Ethics', 'Ethics committee approval · informed consent'],
    ['Then', 'The same data supports CE marking'],
  ];
  return (
    <div style={{ position: 'absolute', left: 120, top: 330, width: 1680, display: 'flex', gap: 40 }}>
      <motion.div className="glass glass-lite" style={{ flex: '0 0 980px', padding: '34px 40px' }} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease, delay: 0.3 }}>
        <div className="mono" style={{ fontSize: 14, color: 'var(--coral)' }}>
          How we will measure it · Madrid pilot
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', rowGap: 18, columnGap: 24, marginTop: 26 }}>
          {facts.map(([k, v]) => (
            <div key={k} style={{ display: 'contents' }}>
              <div className="mono" style={{ fontSize: 14, paddingTop: 6 }}>
                {k}
              </div>
              <div className="body" style={{ fontSize: 26, color: 'var(--paper)' }}>
                {v}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 34 }}>
        {[
          ['Pilot', '≈ 60', 'Madrid'],
          ['Year 2', '≈ 300', 'break-even'],
          ['Year 3', '1,000', '≈ 0.5% of Spain'],
        ].map(([k, v, d], i) => (
          <motion.div key={k} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.9, ease, delay: 0.8 + i * 0.3 }}>
            <div className="mono" style={{ fontSize: 14 }}>
              {k}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
              <span className="number" style={{ fontSize: 84, color: i === 2 ? 'var(--coral)' : 'var(--paper)' }}>
                {v}
              </span>
              <span className="body" style={{ fontSize: 24 }}>
                patients · {d}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function Content({ build }: { build: number }) {
  return (
    <div className="content">
      <div className="text-col" style={{ top: 130, width: 1600 }}>
        <h2 className="display d-88" style={{ display: 'flex', alignItems: 'baseline', gap: 26 }}>
          <span className="number coral" style={{ fontSize: 120 }}>
            ≈<Counter to={60} duration={1.6} delay={0.6} format={(v) => String(Math.round(v))} />–<Counter to={125} duration={2} delay={0.8} format={(v) => String(Math.round(v))} />×
          </span>
          <Words text="more data" delay={1.2} />
        </h2>
      </div>

      <At build={build} at={0} until={1}>
        <div key="cmp">
          <Fade delay={1.6} style={{ position: 'absolute', left: 120, top: 330, width: 620 }}>
            <div className="mono" style={{ fontSize: 15 }}>
              Today
            </div>
            <div className="display" style={{ fontSize: 46, marginTop: 10 }}>
              2–4 visits a year
            </div>
            <p className="body" style={{ fontSize: 26, marginTop: 8 }}>
              a subjective assessment each time
            </p>
          </Fade>
          <Fade delay={2.6} style={{ position: 'absolute', left: 120, top: 560, width: 620 }}>
            <div className="mono" style={{ fontSize: 15, color: 'var(--coral)' }}>
              With VoxWave
            </div>
            <div className="display" style={{ fontSize: 46, marginTop: 10 }}>
              ≈ 255 objective sessions
            </div>
            <p className="body" style={{ fontSize: 26, marginTop: 8 }}>
              365 days × 70% adherence
            </p>
          </Fade>
          <Fade delay={3} style={{ position: 'absolute', left: GX, top: GY + ROWS * SY + 20 }}>
            <div className="mono" style={{ fontSize: 13 }}>
              One year of María · each point a session
            </div>
          </Fade>
        </div>
      </At>

      <At build={build} at={1} until={2}>
        <motion.div key="table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.4 } }}>
          <Table />
        </motion.div>
      </At>
      <At build={build} at={2}>
        <motion.div key="pilot" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <Pilot />
        </motion.div>
      </At>
    </div>
  );
}

const calm = (out: Float32Array, n: number) => {
  for (let i = 0; i < n; i++) put(out, i, C.coral, 1);
};

export const S10: SlideDef = {
  id: 'S10',
  builds: 3,
  auto: [8, 8],
  notes:
    "And instead of two to four visits a year, a neurologist gets around two hundred and fifty data points: over sixty times more information. Then we track what that early warning leads to: the share of alerts that end in a clinical action, emergency admissions against a control group, quality of life with the PDQ-8, caregiver burden, and false alarms: no more than one per patient per year. We'll measure it in a six-month pilot in Madrid, with around sixty patients and a matched control group. Those data also become the clinical evidence for CE marking. From there: three hundred patients, then a thousand in Spain by year three.",
  wave: () => ({ shape: wave({ y: 990, amp: 18, speed: 0.7 }), paint: calm, opacity: 0.45, core: 1.2, glow: 0.6, duration: 3000, stagger: 0.3 }),
  particles: (b) => ({
    seed: rainSeed,
    state: { target: dataTarget(b === 0 ? 1 : 0), duration: b === 0 ? 4200 : 1400, scatter: b === 0 ? 0.75 : 0.2, order: b === 0 ? order : undefined, size: 3.1, opacity: b === 0 ? 1 : 0 },
  }),
  bg: () => ({ pool: [0.6, 0.45], poolStrength: 1, warm: 0.5 }),
  Content,
};
