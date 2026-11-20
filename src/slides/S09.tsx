import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { C, EASE } from '../brand/tokens';
import type { SlideDef } from '../deck/types';
import { wave } from '../engine/shapes';
import { Counter } from '../ui/motion';

const ease = EASE as unknown as [number, number, number, number];

/**
 * Week 3 — the impact, on paper.
 * María's voice, day by day since her last visit, inside her own baseline band.
 * Suddenly it drops. Nine days later the alert fires and her next visit — pinned on
 * the timeline at day 180 — slides back to just after the alert. After that earlier
 * visit her voice returns to baseline; in grey, what would have happened without us.
 */

const NAVY = C.navy, TEAL = C.teal, CORAL = C.coral;
const GREY = 'rgba(9,38,52,0.32)';

// ---------- Story (days since the last visit) ----------
const ONSET = 100; // the voice starts to drift
const ALERT = ONSET + 21; // "Week 3": drift sustained 3 weeks (paper's alert rule), neurologist notified
const VISIT_OLD = 180; // next scheduled visit (6 months)
const VISIT_NEW = ALERT + 5; // the visit, moved forward
const LAST = 180;

// ---------- Timeline (s since the slide appeared) ----------
const T = {
  axis: 0.25,
  band: 0.7,
  pin: 0.9,
  stream0: 1.1, // days 0 → ALERT stream in
  stream1: 4.4,
  alert: 4.5,
  move0: 5.4, // the visit slides back
  move1: 6.7,
  after0: 6.9, // after the earlier visit: recovery (and, in grey, the counterfactual)
  after1: 8.9,
  stats: 9.1,
};

// ---------- Geometry ----------
const X0 = 170, X1 = 1750;
const xd = (d: number) => X0 + ((X1 - X0) * d) / LAST;
const MID = 452, UNIT = 52; // value 0 at MID; band = ±1
const yv = (v: number) => MID - v * UNIT;
const AXIS_Y = 790;

// ---------- María's daily voice stability (deterministic) ----------
const noise = (d: number) => 0.38 * Math.sin(d * 0.73) + 0.24 * Math.sin(d * 0.27 + 1.3) + 0.12 * Math.sin(d * 1.9 + 0.4);
// A sudden fall: most of it happens within a week.
const drop = (d: number) => (d <= ONSET ? 0 : 4.4 * (1 - Math.exp(-Math.pow((d - ONSET) / 5.5, 1.6))));
/** With VoxWave: the earlier visit adjusts treatment and the voice comes back. */
const withUs = (d: number) => noise(d) * 0.8 - (d <= VISIT_NEW ? drop(d) : drop(VISIT_NEW) * Math.exp(-(d - VISIT_NEW) / 6.5));
/** Without VoxWave: the drift keeps going until the visit at day 180. */
const without = (d: number) => noise(d) * 0.45 - drop(d) - (d > ONSET + 12 ? (d - ONSET - 12) * 0.016 : 0);

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

/** The trace from day a to day b (fractional), coloured by whether it's inside the band. */
function Trace({ f, a, b, ghost = false }: { f: (d: number) => number; a: number; b: number; ghost?: boolean }) {
  if (b <= a) return null;
  const segs: JSX.Element[] = [];
  const dots: JSX.Element[] = [];
  for (let d = Math.floor(a); d < b; d++) {
    const d2 = Math.min(b, d + 1);
    const v1 = f(d), v2 = f(d2);
    const out = !ghost && Math.min(v1, v2) < -1;
    segs.push(<line key={d} x1={xd(d)} y1={yv(v1)} x2={xd(d2)} y2={yv(v2)} stroke={ghost ? GREY : out ? CORAL : NAVY} strokeWidth={ghost ? 2.5 : 3} strokeLinecap="round" strokeDasharray={ghost ? '6 8' : undefined} />);
    if (!ghost && d % 3 === 0) dots.push(<circle key={d} cx={xd(d)} cy={yv(v1)} r={4.5} fill={v1 < -1 ? CORAL : NAVY} />);
  }
  return (
    <g>
      {segs}
      {dots}
    </g>
  );
}

function Chart({ t }: { t: number }) {
  // How many days are drawn so far.
  const dMain = ALERT * io(clamp((t - T.stream0) / (T.stream1 - T.stream0)));
  const dAfter = ALERT + (LAST - ALERT) * io(clamp((t - T.after0) / (T.after1 - T.after0)));
  const mv = io(clamp((t - T.move0) / (T.move1 - T.move0)));
  const visitX = xd(VISIT_OLD + (VISIT_NEW - VISIT_OLD) * mv);
  const axisP = io(clamp((t - T.axis) / 0.8));
  const bandP = io(clamp((t - T.band) / 0.7));
  const alertOn = t >= T.alert;
  const pulse = alertOn ? (t - T.alert) % 1.6 : 0;
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
      {/* Personal baseline band */}
      <g opacity={bandP}>
        <rect x={X0} y={yv(1)} width={(X1 - X0) * bandP} height={UNIT * 2} fill={TEAL} opacity={0.08} />
        <line x1={X0} x2={X0 + (X1 - X0) * bandP} y1={yv(1)} y2={yv(1)} stroke={TEAL} strokeWidth={1.5} strokeDasharray="7 7" opacity={0.6} />
        <line x1={X0} x2={X0 + (X1 - X0) * bandP} y1={yv(-1)} y2={yv(-1)} stroke={TEAL} strokeWidth={1.5} strokeDasharray="7 7" opacity={0.6} />
      </g>

      {/* Time axis, days since her last visit */}
      <line x1={X0} x2={X0 + (X1 - X0) * axisP} y1={AXIS_Y} y2={AXIS_Y} stroke={NAVY} strokeWidth={2} />
      {[0, 30, 60, 90, 120, 150, 180].map((d) => (
        <g key={d} opacity={axisP}>
          <line x1={xd(d)} x2={xd(d)} y1={AXIS_Y} y2={AXIS_Y + 10} stroke={NAVY} strokeWidth={2} />
          <text x={xd(d)} y={AXIS_Y + 40} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize={19} fill="rgba(9,38,52,0.6)">
            {d === 0 ? 'Last visit' : `Day ${d}`}
          </text>
        </g>
      ))}

      {/* What would have happened without VoxWave (grey, dashed) */}
      <Trace f={without} a={ALERT} b={dAfter} ghost />
      {t >= T.after0 && (
        <motion.text
          x={xd(138)}
          y={yv(-3.1)}
          textAnchor="start"
          fontFamily="Inter, sans-serif"
          fontSize={22}
          fill="rgba(9,38,52,0.5)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          Without VoxWave: unnoticed until day 180
        </motion.text>
      )}

      {/* María's voice */}
      <Trace f={withUs} a={0} b={dMain} />
      <Trace f={withUs} a={ALERT} b={dAfter} />

      {/* Onset marker: where the drift began */}
      {dMain >= ONSET && (
        <g opacity={clamp((dMain - ONSET) / 3)}>
          <line x1={xd(ONSET)} x2={xd(ONSET)} y1={yv(1) - 8} y2={AXIS_Y} stroke={CORAL} strokeWidth={1.5} strokeDasharray="3 6" opacity={0.6} />
        </g>
      )}

      {/* The alert point */}
      {alertOn && (
        <g>
          <circle cx={xd(ALERT)} cy={yv(withUs(ALERT))} r={10 + pulse * 22} fill="none" stroke={CORAL} strokeWidth={2} opacity={0.6 * (1 - pulse / 1.6)} />
          <circle cx={xd(ALERT)} cy={yv(withUs(ALERT))} r={9} fill={CORAL} />
          <line x1={xd(ALERT)} x2={xd(ALERT)} y1={232} y2={yv(withUs(ALERT)) - 12} stroke={CORAL} strokeWidth={1.5} strokeDasharray="3 6" />
        </g>
      )}

      {/* "66 days earlier": bracket between the old and the new visit */}
      {t >= T.move0 && (
        <g opacity={mv}>
          <line x1={visitX} x2={xd(VISIT_OLD)} y1={AXIS_Y - 26} y2={AXIS_Y - 26} stroke={CORAL} strokeWidth={3} strokeLinecap="round" />
          <line x1={xd(VISIT_OLD)} x2={xd(VISIT_OLD)} y1={AXIS_Y - 36} y2={AXIS_Y - 16} stroke={CORAL} strokeWidth={3} strokeLinecap="round" />
          <rect x={xd(VISIT_OLD) - 9} y={AXIS_Y - 9} width={18} height={18} rx={9} fill="none" stroke={GREY} strokeWidth={2} strokeDasharray="3 4" />
        </g>
      )}

      {/* The next visit: a pin on the timeline that slides back when the alert fires */}
      <g opacity={io(clamp((t - T.pin) / 0.6))}>
        <line x1={visitX} x2={visitX} y1={348} y2={AXIS_Y} stroke={mv > 0 ? CORAL : NAVY} strokeWidth={2} strokeDasharray="2 7" strokeLinecap="round" />
        <circle cx={visitX} cy={AXIS_Y} r={9} fill={mv > 0.98 ? CORAL : NAVY} />
      </g>
    </svg>
  );
}

function VisitChip({ t }: { t: number }) {
  const mv = io(clamp((t - T.move0) / (T.move1 - T.move0)));
  const moved = mv > 0.98;
  const x = xd(VISIT_OLD + (VISIT_NEW - VISIT_OLD) * mv);
  return (
    <motion.div
      className="display"
      style={{
        position: 'absolute',
        left: x,
        top: 300,
        x: '-50%',
        padding: '12px 22px',
        borderRadius: 30,
        background: moved ? CORAL : NAVY,
        color: '#fbf9f5',
        fontSize: 22,
        fontWeight: 600,
        whiteSpace: 'nowrap',
        boxShadow: moved ? '0 14px 30px rgba(255,110,66,0.35)' : '0 12px 26px rgba(9,38,52,0.22)',
        transition: 'background .4s, box-shadow .4s',
      }}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease, delay: T.pin }}
    >
      {moved ? `Visit moved to day ${VISIT_NEW}` : 'Next visit · day 180'}
    </motion.div>
  );
}

function AlertCard() {
  return (
    <motion.div
      style={{
        position: 'absolute',
        left: xd(ALERT) - 300,
        top: 118,
        width: 600,
        padding: '24px 28px',
        borderRadius: 22,
        background: '#fbf9f5',
        border: `2px solid ${CORAL}`,
        boxShadow: '0 24px 60px rgba(255,110,66,0.2)',
        display: 'flex',
        gap: 22,
        alignItems: 'center',
      }}
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 380, damping: 22, delay: T.alert }}
    >
      <div className="display" style={{ width: 62, height: 62, borderRadius: 16, background: CORAL, color: '#fff', fontSize: 38, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
        !
      </div>
      <div>
        <div className="display" style={{ fontSize: 34, fontWeight: 700, color: NAVY, lineHeight: 1.05 }}>
          Trend change detected
        </div>
        <div className="body" style={{ fontSize: 21, marginTop: 8, color: 'rgba(9,38,52,0.7)' }}>
          Week 3 of the drift · her neurologist is notified
        </div>
      </div>
    </motion.div>
  );
}

function Stats() {
  return (
    <div style={{ position: 'absolute', left: 170, top: 880, display: 'flex', gap: 110, alignItems: 'flex-end' }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease, delay: T.stats }}>
        <div className="number" style={{ fontSize: 92, lineHeight: 1, color: CORAL }}>
          <Counter to={3} duration={0.9} delay={T.stats} format={(v) => `${Math.round(v)} weeks`} />
        </div>
        <div className="display" style={{ fontSize: 26, fontWeight: 600, marginTop: 10, color: NAVY }}>
          to catch the change, with VoxWave
        </div>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease, delay: T.stats + 0.45 }}>
        <div className="number" style={{ fontSize: 92, lineHeight: 1, color: 'rgba(9,38,52,0.3)' }}>
          <Counter to={VISIT_OLD - ONSET} duration={1.1} delay={T.stats + 0.45} format={(v) => `${Math.round(v)} days`} />
        </div>
        <div className="display" style={{ fontSize: 26, fontWeight: 600, marginTop: 10, color: 'rgba(9,38,52,0.45)' }}>
          waiting for the next visit
        </div>
      </motion.div>
    </div>
  );
}

function Content() {
  const t = useElapsed();
  const status = t < T.alert ? 'Monitoring' : t < T.move0 ? 'Attention' : t < T.after0 ? 'Visit moved forward' : 'Back to her baseline';
  return (
    <div className="content">
      <div className="mono" style={{ position: 'absolute', left: 120, top: 62, fontSize: 18, color: NAVY, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ width: 10, height: 10, borderRadius: 5, background: CORAL, display: 'inline-block' }} />
        María · daily voice stability
      </div>
      <motion.div key={status} className="mono" style={{ position: 'absolute', right: 120, top: 62, fontSize: 18, color: status === 'Attention' ? CORAL : TEAL }} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        {status}
      </motion.div>
      <motion.div
        className="display"
        style={{ position: 'absolute', left: X0, top: yv(1) - 54, fontSize: 18, fontWeight: 600, color: '#fbf9f5', background: TEAL, padding: '7px 16px', borderRadius: 20 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: T.band + 0.3 }}
      >
        Her own baseline
      </motion.div>

      <Chart t={t} />
      <VisitChip t={t} />
      {t >= T.alert && <AlertCard />}
      <Stats />
    </div>
  );
}

export const S09: SlideDef = {
  id: 'S09',
  builds: 1,
  notes:
    "Here's the impact. María's voice, every day, inside her own baseline. Then it drops. After three weeks of sustained drift, her neurologist gets an alert and her visit moves forward. Treatment is adjusted, and her voice comes back. Without VoxWave, nobody notices until day one hundred and eighty.",
  theme: () => 'light',
  wave: () => ({ shape: wave({ y: 540, amp: 30 }), opacity: 0, duration: 1600, stagger: 0 }),
  bg: () => ({ pool: [0.5, 0.5], poolStrength: 1, warm: 0.6 }),
  Content,
};
