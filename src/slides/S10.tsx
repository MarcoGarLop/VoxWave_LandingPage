import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { C, EASE } from '../brand/tokens';
import type { SlideDef } from '../deck/types';
import { wave } from '../engine/shapes';

const ease = EASE as unknown as [number, number, number, number];

/**
 * How we'll prove it — the proposed clinical pilot, on paper.
 * Two lanes run for six months side by side (usual care vs VoxWave) while a time
 * cursor sweeps; then four indicators are written down, name = formula, with the
 * number that would prove each one.
 */

const NAVY = C.navy, TEAL = C.teal, CORAL = C.coral;
const GREY = 'rgba(9,38,52,0.38)';

// ---------- Timeline (s since the slide appeared) ----------
const T = { head: 0.2, chips: 0.55, lanes: 0.9, sweep0: 1.3, sweep1: 4.6, kpi0: 4.9, kpiGap: 0.55, scale: 8.2 };

// ---------- Lanes ----------
const LX0 = 400, LX1 = 1600; // months 0..6
const mx = (m: number) => LX0 + ((LX1 - LX0) * m) / 6;
const LANES = [
  { key: 'usual', label: 'Usual care', y: 318, color: GREY },
  { key: 'vox', label: 'With VoxWave', y: 448, color: CORAL },
];
// Illustrative events (months).
const ADMISSIONS_USUAL = [0.9, 1.9, 2.7, 3.5, 4.4, 5.3];
const ADMISSIONS_VOX = [2.3, 4.9];
const ALERTS_VOX = [0.7, 1.6, 2.6, 3.3, 4.1, 5.0, 5.6];

// ---------- Indicators: what we want, the number that proves it, one line of context ----------
const KPIS = [
  { goal: 'Better triage', big: '< 14 days', line: 'From the first drift to a neurologist’s review. Today: 90 – 180.', primary: true },
  { goal: 'Fewer emergency admissions', big: '7 in 10', line: 'Parkinson’s admissions are emergencies today. We measure the drop against usual care.' },
  { goal: 'Savings for hospitals', big: '1 in 9', line: 'One admission avoided per 9 patients a year pays for VoxWave: €4,400 vs €480.' },
  { goal: 'Better lives', big: 'PDQ-8', line: 'Quality of life, measured every three months against usual care.' },
];
const COL_W = 400, COL_X0 = 120, COL_GAP = 26;
const colX = (k: number) => COL_X0 + k * (COL_W + COL_GAP);

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const io = (v: number) => (v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2);

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

/** A hospital admission: a small square with a cross. */
function Admission({ x, y, color, on }: { x: number; y: number; color: string; on: number }) {
  if (on <= 0) return null;
  const s = 30 * (0.6 + 0.4 * Math.min(1, on * 1.6));
  return (
    <g opacity={Math.min(1, on * 2)} transform={`translate(${x} ${y})`}>
      <rect x={-s / 2} y={-s / 2} width={s} height={s} rx={7} fill={color} />
      <rect x={-2.5} y={-s * 0.3} width={5} height={s * 0.6} fill="#fbf9f5" />
      <rect x={-s * 0.3} y={-2.5} width={s * 0.6} height={5} fill="#fbf9f5" />
    </g>
  );
}

/** An early alert: a coral ring that pops above the lane. */
function Alert({ x, y, on }: { x: number; y: number; on: number }) {
  if (on <= 0) return null;
  const k = Math.min(1, on * 1.6);
  return (
    <g opacity={Math.min(1, on * 2)}>
      <line x1={x} x2={x} y1={y} y2={y - 30 * k} stroke={CORAL} strokeWidth={2} />
      <circle cx={x} cy={y - 40 * k} r={10} fill="#fbf9f5" stroke={CORAL} strokeWidth={3} />
      <text x={x} y={y - 40 * k + 5} textAnchor="middle" fontFamily="Sora, sans-serif" fontWeight={700} fontSize={14} fill={CORAL}>
        !
      </text>
    </g>
  );
}

function Lanes({ t }: { t: number }) {
  const lp = io(clamp((t - T.lanes) / 0.8));
  const sweep = clamp((t - T.sweep0) / (T.sweep1 - T.sweep0));
  const now = 6 * sweep; // months elapsed
  const appear = (m: number) => clamp((now - m) / 0.35);
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
      {/* Month ticks */}
      {[0, 1, 2, 3, 4, 5, 6].map((m) => (
        <g key={m} opacity={lp}>
          <line x1={mx(m)} x2={mx(m)} y1={268} y2={498} stroke="rgba(9,38,52,0.08)" strokeWidth={1.5} />
          <text x={mx(m)} y={530} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize={17} fill="rgba(9,38,52,0.5)">
            {m === 0 ? 'Start' : `Month ${m}`}
          </text>
        </g>
      ))}
      {LANES.map((l) => (
        <g key={l.key}>
          <line x1={LX0} x2={LX0 + (LX1 - LX0) * lp} y1={l.y} y2={l.y} stroke={l.color} strokeWidth={3} strokeLinecap="round" />
          {/* progress along the lane */}
          <line x1={LX0} x2={mx(now)} y1={l.y} y2={l.y} stroke={l.key === 'vox' ? CORAL : NAVY} strokeWidth={5} strokeLinecap="round" opacity={0.85} />
        </g>
      ))}
      {ADMISSIONS_USUAL.map((m, i) => (
        <Admission key={`u${i}`} x={mx(m)} y={LANES[0].y} color={NAVY} on={appear(m)} />
      ))}
      {ALERTS_VOX.map((m, i) => (
        <Alert key={`a${i}`} x={mx(m)} y={LANES[1].y} on={appear(m)} />
      ))}
      {ADMISSIONS_VOX.map((m, i) => (
        <Admission key={`v${i}`} x={mx(m)} y={LANES[1].y} color={GREY} on={appear(m)} />
      ))}
      {/* Time cursor */}
      {sweep > 0 && sweep < 1 && <line x1={mx(now)} x2={mx(now)} y1={260} y2={506} stroke={CORAL} strokeWidth={2} />}
    </svg>
  );
}

function LaneLabels({ t }: { t: number }) {
  const done = t >= T.sweep1;
  return (
    <>
      {LANES.map((l, i) => (
        <motion.div
          key={l.key}
          className="display"
          style={{ position: 'absolute', left: 120, top: l.y - 18, fontSize: 25, fontWeight: 600, color: i === 0 ? 'rgba(9,38,52,0.6)' : CORAL }}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease, delay: T.lanes + i * 0.15 }}
        >
          {l.label}
        </motion.div>
      ))}
      {done && (
        <>
          <motion.div className="mono" style={{ position: 'absolute', left: LX1 + 40, top: LANES[0].y - 14, fontSize: 19, color: NAVY, whiteSpace: 'nowrap' }} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            {ADMISSIONS_USUAL.length} admissions
          </motion.div>
          <motion.div className="mono" style={{ position: 'absolute', left: LX1 + 40, top: LANES[1].y - 14, fontSize: 19, color: CORAL, whiteSpace: 'nowrap' }} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.15 }}>
            {ADMISSIONS_VOX.length} admissions
          </motion.div>
        </>
      )}
    </>
  );
}

function Kpi({ k }: { k: number }) {
  const m = KPIS[k];
  const d = T.kpi0 + k * T.kpiGap;
  return (
    <motion.div
      style={{ position: 'absolute', left: colX(k), top: 612, width: COL_W, paddingTop: 24, borderTop: `2px solid ${m.primary ? CORAL : 'rgba(9,38,52,0.14)'}` }}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease, delay: d }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, height: 24 }}>
        <span className="display" style={{ fontSize: 26, fontWeight: 600, color: NAVY }}>
          {m.goal}
        </span>
        {m.primary && (
          <span className="mono" style={{ fontSize: 13, color: '#fbf9f5', background: CORAL, padding: '3px 10px', borderRadius: 12 }}>
            Primary
          </span>
        )}
      </div>
      <motion.div
        className="number"
        style={{ fontSize: 78, lineHeight: 1, color: CORAL, marginTop: 30 }}
        initial={{ opacity: 0, y: 12, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.8, ease, delay: d + 0.25 }}
      >
        {m.big}
      </motion.div>
      <div className="body" style={{ fontSize: 22, lineHeight: 1.4, marginTop: 20, color: 'rgba(9,38,52,0.72)', maxWidth: 370 }}>
        {m.line}
      </div>
    </motion.div>
  );
}

function Content() {
  const t = useElapsed();
  const status = t < T.sweep1 ? 'Proposed clinical pilot' : t < T.scale ? 'What we will measure' : 'Then we scale';
  return (
    <div className="content">
      <div className="mono" style={{ position: 'absolute', left: 120, top: 62, fontSize: 18, color: NAVY, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ width: 10, height: 10, borderRadius: 5, background: CORAL, display: 'inline-block' }} />
        How we’ll prove it
      </div>
      <motion.div key={status} className="mono" style={{ position: 'absolute', right: 120, top: 62, fontSize: 18, color: TEAL }} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        {status}
      </motion.div>

      <motion.div style={{ position: 'absolute', left: 120, top: 110, display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease, delay: T.head }}>
        <h2 className="display" style={{ fontSize: 46, color: NAVY, marginRight: 14 }}>
          A clinical pilot with Gregorio Marañón
        </h2>
        {['60 patients', '6 months', 'Matched control group'].map((c, i) => (
          <motion.span
            key={c}
            className="display"
            style={{ fontSize: 20, fontWeight: 600, color: TEAL, border: `2px solid ${TEAL}`, padding: '7px 16px', borderRadius: 22 }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease, delay: T.chips + i * 0.12 }}
          >
            {c}
          </motion.span>
        ))}
      </motion.div>

      <Lanes t={t} />
      <LaneLabels t={t} />

      {KPIS.map((_, k) => (
        <Kpi key={k} k={k} />
      ))}

      <motion.div style={{ position: 'absolute', left: 120, top: 978, display: 'flex', alignItems: 'baseline', gap: 22 }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease, delay: T.scale }}>
        <span className="mono" style={{ fontSize: 17, color: CORAL }}>
          Then
        </span>
        <span className="display" style={{ fontSize: 34, fontWeight: 700, color: NAVY }}>
          60 → 300 → 1,000 patients
        </span>
        <span className="mono" style={{ fontSize: 13, color: 'rgba(9,38,52,0.45)', marginLeft: 30 }}>
          Proposed design · lanes are illustrative
        </span>
      </motion.div>
    </div>
  );
}

export const S10: SlideDef = {
  id: 'S10',
  builds: 1,
  notes:
    "How will we prove it? With a clinical pilot we're proposing with Gregorio Marañón: sixty patients for six months, against a matched control group with usual care. We'll measure four things. Fewer emergency admissions, against the control group. Savings: at forty euros a month, VoxWave pays for itself if it avoids one admission per nine patients a year — every admission costs about four thousand four hundred euros. Better triage — our primary indicator: the days from the first sustained change to a neurologist's review, under fourteen, from three to six months today. And better lives, measured with the PDQ-8 quality-of-life scale. Then we scale: sixty, three hundred, a thousand patients.",
  theme: () => 'light',
  wave: () => ({ shape: wave({ y: 540, amp: 30 }), opacity: 0, duration: 1600, stagger: 0 }),
  bg: () => ({ pool: [0.5, 0.5], poolStrength: 1, warm: 0.6 }),
  Content,
};
