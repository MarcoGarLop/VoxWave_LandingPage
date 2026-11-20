import { motion } from 'motion/react';
import { C } from '../brand/tokens';
import type { SlideDef } from '../deck/types';
import { put } from '../engine/paint';
import { trend } from '../engine/shapes';
import { At, Counter, Fade, Words } from '../ui/motion';

// Chart geometry (design px).
const D0 = -22, D1 = 124, ALERT = 9, NEXT = 120;
const X0 = 160, X1 = 1780;
const x = (d: number) => X0 + ((d - D0) / (D1 - D0)) * (X1 - X0);
const MID = 690, HALF = 46, SCALE = 52; // score 0 at MID; band = ±HALF px
const y = (s: number) => MID - s * SCALE;
const SPLIT = 0.62;
const alertScore = -1.55 + 0.0; // approx. drift at ALERT (noise ignored for the marker)

function paintTrend(out: Float32Array, n: number) {
  const m = Math.floor(n * SPLIT);
  for (let i = 0; i < n; i++) {
    if (i < m) {
      put(out, i, C.coral, 1);
      continue;
    }
    const k = i - m;
    put(out, i, C.muted, Math.floor(k / 5) % 2 === 0 ? 0.6 : 0);
  }
}

function Band() {
  return (
    <motion.svg
      width={1920}
      height={1080}
      style={{ position: 'absolute', left: 0, top: 0 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.6, delay: 0.6 }}
    >
      <defs>
        <linearGradient id="band" x1="0" x2="1">
          <stop offset="0" stopColor={C.tealBright} stopOpacity="0" />
          <stop offset="0.08" stopColor={C.tealBright} stopOpacity="0.16" />
          <stop offset="0.92" stopColor={C.tealBright} stopOpacity="0.16" />
          <stop offset="1" stopColor={C.tealBright} stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x={X0} y={MID - HALF} width={X1 - X0} height={HALF * 2} fill="url(#band)" />
      <line x1={X0 + 40} x2={X1 - 40} y1={MID - HALF} y2={MID - HALF} stroke={C.tealBright} strokeOpacity={0.45} strokeDasharray="3 7" />
      <line x1={X0 + 40} x2={X1 - 40} y1={MID + HALF} y2={MID + HALF} stroke={C.tealBright} strokeOpacity={0.45} strokeDasharray="3 7" />
      {/* day ticks */}
      {[0, 30, 60, 90, 120].map((d) => (
        <g key={d}>
          <line x1={x(d)} x2={x(d)} y1={MID + 176} y2={MID + 184} stroke="rgba(241,237,228,0.35)" />
          <text x={x(d)} y={MID + 210} fill="rgba(241,237,228,0.4)" fontFamily="JetBrains Mono" fontSize={15} textAnchor="middle" letterSpacing="2">
            DAY {d}
          </text>
        </g>
      ))}
      <text x={X0 + 40} y={MID - HALF - 16} fill={C.tealBright} fillOpacity={0.8} fontFamily="JetBrains Mono" fontSize={15} letterSpacing="3">
        MARÍA’S PERSONAL BASELINE
      </text>
    </motion.svg>
  );
}

function AlertMark() {
  const cx = x(ALERT), cy = y(alertScore);
  return (
    <motion.div style={{ position: 'absolute', left: cx, top: cy, width: 0, height: 0 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: 3.2, duration: 0.6 }}>
      {[0, 1].map((k) => (
        <motion.div
          key={k}
          style={{ position: 'absolute', left: -14, top: -14, width: 28, height: 28, borderRadius: 14, border: `2px solid ${C.coral}` }}
          animate={{ scale: [1, 3.2], opacity: [0.9, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, delay: 3.2 + k * 1.1, ease: 'easeOut' }}
        />
      ))}
      <div style={{ position: 'absolute', left: -7, top: -7, width: 14, height: 14, borderRadius: 7, background: C.coral, boxShadow: `0 0 24px ${C.coral}` }} />
      <div className="mono" style={{ position: 'absolute', left: 26, top: 22, whiteSpace: 'nowrap', fontSize: 16, color: C.coral }}>
        Day 9 · alert · neurologist notified
      </div>
    </motion.div>
  );
}

function NextVisit() {
  return (
    <motion.div style={{ position: 'absolute', left: x(NEXT), top: y(alertScore), width: 0 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: 4.2, duration: 0.9 }}>
      <div style={{ position: 'absolute', left: -8, top: -8, width: 16, height: 16, borderRadius: 8, border: '2px solid rgba(241,237,228,0.5)' }} />
      <div className="mono" style={{ position: 'absolute', right: 20, top: 24, whiteSpace: 'nowrap', fontSize: 15, color: 'var(--ink-60)' }}>
        Next visit · day 120 · without VoxWave, seen here
      </div>
    </motion.div>
  );
}

function Content({ build }: { build: number }) {
  return (
    <div className="content">
      <div className="text-col" style={{ top: 120, width: 820 }}>
        <div className="number coral" style={{ fontSize: 150 }}>
          <Words text="Day 9." delay={0.4} />
        </div>
        <Fade delay={1.1} dim={build >= 1}>
          <p className="body" style={{ marginTop: 18, maxWidth: 760 }}>
            María’s voice drifts from her own baseline. Her neurologist sees it that day, not in four months.
          </p>
        </Fade>
      </div>

      <Band />
      <AlertMark />
      <NextVisit />
      <Fade delay={2} style={{ position: 'absolute', right: 140, top: MID + 250 }}>
        <div className="mono" style={{ fontSize: 12 }}>
          Illustrative data
        </div>
      </Fade>

      <At build={build} at={1}>
        <div key="kpi" style={{ position: 'absolute', left: 1040, top: 150, width: 760 }}>
          <Fade delay={0.2}>
            <div className="mono" style={{ fontSize: 15 }}>
              Main indicator · days from first sustained change to neurologist review
            </div>
          </Fade>
          <div style={{ display: 'flex', gap: 70, marginTop: 26, alignItems: 'flex-end' }}>
            <Fade delay={0.5}>
              <div className="mono" style={{ fontSize: 14, marginBottom: 6 }}>
                Today
              </div>
              <div className="number" style={{ fontSize: 92, color: 'var(--ink-60)' }}>
                90–180
              </div>
              <div className="mono" style={{ fontSize: 13, marginTop: 8 }}>
                days · the next visit
              </div>
            </Fade>
            <Fade delay={1}>
              <div className="mono" style={{ fontSize: 14, marginBottom: 6, color: 'var(--coral)' }}>
                Pilot target
              </div>
              <div className="number coral" style={{ fontSize: 92 }}>
                &lt;&nbsp;<Counter to={14} from={120} duration={2.2} delay={1.2} format={(v) => String(Math.round(v))} />
              </div>
              <div className="mono" style={{ fontSize: 13, marginTop: 8 }}>
                days · to be measured
              </div>
            </Fade>
          </div>
        </div>
      </At>
    </div>
  );
}

export const S09: SlideDef = {
  id: 'S09',
  builds: 2,
  auto: [8],
  notes:
    "Day nine: María's voice drifts from her own baseline. Her neurologist sees it that day, not in four months. That's our main indicator: the days from the first sustained change in the voice to the moment a neurologist reviews it. Today, that's the next visit, three to six months away. Our target is under fourteen days.",
  wave: () => ({
    // The voice becomes María's daily record.
    shape: trend({ x, y, from: D0 + 2, alertDay: ALERT, to: NEXT, split: SPLIT }),
    paint: paintTrend,
    core: 1.6,
    glow: 0.9,
    echoes: 0,
    duration: 3600,
    stagger: 0.5,
    dir: 1,
  }),
  bg: (b) => ({ pool: [0.45, 0.55], poolStrength: b === 1 ? 1.05 : 0.95, warm: 0.8 }),
  Content,
};
