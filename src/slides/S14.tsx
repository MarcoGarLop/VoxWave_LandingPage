import { motion } from 'motion/react';
import { C, EASE } from '../brand/tokens';
import type { SlideDef } from '../deck/types';
import { put } from '../engine/paint';
import { path } from '../engine/shapes';
import { At, Fade, Words } from '../ui/motion';

const ease = EASE as unknown as [number, number, number, number];

// Cumulative contribution (k€) vs patients: −115k one-off/fixed, +380 €/patient-year.
const PX0 = 980, PX1 = 1790, P_MAX = 1000;
const Y0 = 560, K = 1.25; // px per k€
const px = (p: number) => PX0 + (p / P_MAX) * (PX1 - PX0);
const py = (k: number) => Y0 - k * K;
const BREAK = 115000 / 380; // ≈ 303

function jCurve(): [number, number][] {
  const pts: [number, number][] = [];
  // drop: the one-off investment
  for (let i = 0; i <= 10; i++) {
    const f = i / 10;
    pts.push([px(0) + f * f * 14, py(-115 * Math.sin((f * Math.PI) / 2))]);
  }
  // rounded bottom then the climb
  for (let i = 1; i <= 60; i++) {
    const p = (i / 60) * P_MAX;
    const k = 0.38 * p - 115;
    const soft = Math.exp(-p / 40) * 8; // round the corner
    pts.push([px(p) + 14 * (1 - p / P_MAX), py(k - soft)]);
  }
  return pts;
}

function Content({ build }: { build: number }) {
  return (
    <div className="content">
      <div className="text-col" style={{ top: 150, width: 720 }}>
        <div className="mono" style={{ fontSize: 15, color: 'var(--coral)' }}>
          Costs & operations
        </div>
        <h2 className="display d-88" style={{ marginTop: 18 }}>
          <Words text="Pays back at ≈ 300 patients." delay={0.4} wordClass={(w) => (w === '300' ? 'coral' : undefined)} />
        </h2>
        <Fade delay={1.4} dim={build >= 1}>
          <p className="body" style={{ marginTop: 22 }}>
            That is 0.15% of people with Parkinson’s in Spain.
          </p>
        </Fade>
        <At build={build} at={1}>
          <div key="chips" style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 22 }}>
            {[
              ['≈ €100', 'cost per patient-year', 'cloud, processing, device loan, support, admin'],
              ['≈ 80%', 'contribution margin', 'Hinge Health 77% · Omada 61%'],
              ['€50–110k', 'CE marking, class IIa · once', 'plus ≈ €15k fixed costs in year one'],
            ].map(([v, k, d], i) => (
              <motion.div key={k} style={{ display: 'flex', alignItems: 'baseline', gap: 22 }} initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease, delay: 0.4 + i * 0.25 }}>
                <span className="number" style={{ fontSize: 54, minWidth: 250, color: i === 1 ? 'var(--coral)' : 'var(--paper)' }}>
                  {v}
                </span>
                <span>
                  <span className="body" style={{ fontSize: 26, color: 'var(--paper)' }}>
                    {k}
                  </span>
                  <span className="mono" style={{ display: 'block', fontSize: 12, marginTop: 4 }}>
                    {d}
                  </span>
                </span>
              </motion.div>
            ))}
          </div>
        </At>
      </div>

      {/* axes */}
      <motion.svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2, delay: 0.6 }}>
        <line x1={PX0 - 20} x2={PX1 + 20} y1={Y0} y2={Y0} stroke="rgba(241,237,228,0.3)" strokeDasharray="4 8" />
        {[0, 250, 500, 750, 1000].map((p) => (
          <text key={p} x={px(p)} y={Y0 + 214} fill="rgba(241,237,228,0.38)" fontFamily="JetBrains Mono" fontSize={14} textAnchor="middle" letterSpacing="2">
            {p.toLocaleString('en-US')}
          </text>
        ))}
        <text x={PX1} y={Y0 + 244} fill="rgba(241,237,228,0.38)" fontFamily="JetBrains Mono" fontSize={13} textAnchor="end" letterSpacing="2">
          PATIENTS
        </text>
        <text x={px(0) + 24} y={py(-115) + 6} fill="rgba(241,237,228,0.5)" fontFamily="JetBrains Mono" fontSize={14} letterSpacing="1.5">
          −€115k · CE marking + year-one fixed costs
        </text>
        <text x={px(1000) - 6} y={py(265) - 22} fill={C.coral} fontFamily="JetBrains Mono" fontSize={14} textAnchor="end" letterSpacing="1.5">
          +€380 per patient-year
        </text>
      </motion.svg>
      <motion.div style={{ position: 'absolute', left: px(BREAK), top: Y0, width: 0, height: 0 }} initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 3, duration: 0.8, ease }}>
        <div style={{ position: 'absolute', left: -9, top: -9, width: 18, height: 18, borderRadius: 9, background: C.paper, boxShadow: `0 0 0 8px rgba(241,237,228,0.08), 0 0 28px ${C.coral}` }} />
        <div className="mono" style={{ position: 'absolute', left: -2, top: -86, whiteSpace: 'nowrap', fontSize: 16, color: 'var(--paper)' }}>
          Break-even
        </div>
        <div className="number" style={{ position: 'absolute', left: -2, top: -66, whiteSpace: 'nowrap', fontSize: 40 }}>
          ≈ 300
        </div>
      </motion.div>
    </div>
  );
}

export const S14: SlideDef = {
  id: 'S14',
  builds: 2,
  auto: [8],
  notes:
    'Costs. Each patient costs us about a hundred euros a year: an eighty percent contribution margin, in line with digital health companies like Hinge Health. The big one-off cost is CE marking: up to a hundred thousand euros. About three hundred patients pay it back: zero point one five percent of Spain.',
  wave: () => ({
    // The beam of the balance bends into the payback curve.
    shape: path(jCurve(), 0.8),
    paint: (out, n) => {
      for (let i = 0; i < n; i++) put(out, i, C.coral, 1);
    },
    core: 1.7,
    glow: 1,
    echoes: 0.2,
    duration: 3400,
    stagger: 0.5,
    dir: 1,
  }),
  bg: () => ({ pool: [0.7, 0.45], poolStrength: 1, warm: 0.6 }),
  Content,
};
