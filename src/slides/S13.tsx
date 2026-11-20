import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { C, EASE } from '../brand/tokens';
import { symbolLeft, symbolMid, symbolRight } from '../brand/logoPaths';
import type { SlideDef } from '../deck/types';
import { wave } from '../engine/shapes';
import { Words } from '../ui/motion';

const ease = EASE as unknown as [number, number, number, number];

/**
 * Follow the money, on paper.
 * A thin trickle of €40 runs from the clinic to VoxWave; the daily check-in runs
 * from VoxWave to María, who pays €0; and a wide river of savings — €4,400 per
 * avoided stay — flows back to the clinic. Later, insurers. Then everyone's win.
 */

const NAVY = C.navy, TEAL = C.teal, CORAL = C.coral;
const INK = 'rgba(9,38,52,0.72)';

// ---------- Timeline (s since the slide appeared) ----------
const T = { head: 0.15, nodes: 0.45, fee: 1.2, care: 2.5, zero: 3.4, river: 4.1, insurer: 5.4, wins: 6.2, winGap: 0.4, end: 8.2 };

// ---------- Nodes ----------
type NodeKey = 'maria' | 'clinic' | 'vox' | 'insurer';
const NODES: Record<NodeKey, { x: number; y: number; name: string; role: string; win: string; delay: number }> = {
  maria: { x: 330, y: 500, name: 'María', role: 'Patient', win: '€0 · someone listens every day', delay: 0 },
  clinic: { x: 960, y: 500, name: 'Clinic or hospital', role: 'Pays', win: 'Fewer emergencies · more patients, same team', delay: 0.15 },
  vox: { x: 1590, y: 500, name: 'VoxWave', role: 'Paid monthly', win: 'Recurring revenue · ≈ 70% gross margin', delay: 0.3 },
  insurer: { x: 1300, y: 806, name: 'Insurers', role: 'Next', win: 'Every avoided stay is a direct saving', delay: 0 },
};
const R = 62;

// ---------- Flows (quadratic Béziers) ----------
type Pt = [number, number];
const FEE: [Pt, Pt, Pt] = [[1030, 470], [1275, 380], [1520, 470]]; // clinic → VoxWave
const CARE: [Pt, Pt, Pt] = [[1560, 440], [960, -80], [360, 440]]; // VoxWave → María (high, over the €40 label)
const RIVER: [Pt, Pt, Pt] = [[395, 532], [645, 662], [895, 532]]; // María → clinic (savings)
const LATER: [Pt, Pt, Pt] = [[1016, 540], [1210, 560], [1262, 742]]; // clinic → insurer (clear of the clinic's text)

const bez = (b: [Pt, Pt, Pt], s: number): Pt => {
  const u = 1 - s;
  return [u * u * b[0][0] + 2 * u * s * b[1][0] + s * s * b[2][0], u * u * b[0][1] + 2 * u * s * b[1][1] + s * s * b[2][1]];
};
const norm = (b: [Pt, Pt, Pt], s: number): Pt => {
  const dx = 2 * (1 - s) * (b[1][0] - b[0][0]) + 2 * s * (b[2][0] - b[1][0]);
  const dy = 2 * (1 - s) * (b[1][1] - b[0][1]) + 2 * s * (b[2][1] - b[1][1]);
  const l = Math.hypot(dx, dy) || 1;
  return [-dy / l, dx / l];
};
/** An arrowhead at s along a curve, pointing the way the flow goes. */
function Arrow({ b, s, size, color, opacity }: { b: [Pt, Pt, Pt]; s: number; size: number; color: string; opacity: number }) {
  if (opacity <= 0.01) return null;
  const [x, y] = bez(b, s);
  const dx = 2 * (1 - s) * (b[1][0] - b[0][0]) + 2 * s * (b[2][0] - b[1][0]);
  const dy = 2 * (1 - s) * (b[1][1] - b[0][1]) + 2 * s * (b[2][1] - b[1][1]);
  const a = (Math.atan2(dy, dx) * 180) / Math.PI;
  return (
    <path
      d={`M${-size} ${-size * 0.75} L0 0 L${-size} ${size * 0.75}`}
      fill="none"
      stroke={color}
      strokeWidth={Math.max(3, size / 4)}
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={opacity}
      transform={`translate(${x} ${y}) rotate(${a})`}
    />
  );
}

const pathD = (b: [Pt, Pt, Pt]) => `M${b[0][0]} ${b[0][1]} Q${b[1][0]} ${b[1][1]} ${b[2][0]} ${b[2][1]}`;

const hash = (i: number) => {
  const h = Math.sin(i * 12.9898 + 4.1) * 43758.5453;
  return h - Math.floor(h);
};

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

function Flows({ t }: { t: number }) {
  const fee = clamp((t - T.fee) / 0.8);
  const care = io(clamp((t - T.care) / 1.1));
  const river = clamp((t - T.river) / 1.0);
  const later = clamp((t - T.insurer) / 0.8);

  // The daily check-in: a coral wave travelling along the arc (drawn progressively).
  const carePts: string[] = [];
  for (let i = 0; i <= 140 * care; i++) {
    const s = i / 140;
    const [x, y] = bez(CARE, s);
    const [nx, ny] = norm(CARE, s);
    const a = 9 * Math.sin(s * 44 - t * 4);
    carePts.push(`${(x + nx * a).toFixed(1)},${(y + ny * a).toFixed(1)}`);
  }

  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
      {/* tracks */}
      <path d={pathD(FEE)} fill="none" stroke="rgba(9,38,52,0.16)" strokeWidth={2} opacity={fee} />
      <path d={pathD(RIVER)} fill="none" stroke="rgba(255,110,66,0.14)" strokeWidth={52} strokeLinecap="round" opacity={river} />
      <path d={pathD(LATER)} fill="none" stroke="rgba(9,38,52,0.25)" strokeWidth={2} strokeDasharray="4 8" opacity={later} />

      {/* €40: a thin, steady trickle of navy coins */}
      {fee > 0 &&
        Array.from({ length: 12 }, (_, i) => {
          const s = ((t - T.fee) * 0.16 + i / 12) % 1;
          const [x, y] = bez(FEE, s);
          const fade = Math.min(1, s * 8, (1 - s) * 8);
          return <circle key={`f${i}`} cx={x} cy={y} r={4} fill={NAVY} opacity={fee * fade} />;
        })}

      {/* the check-in wave */}
      {carePts.length > 1 && <polyline points={carePts.join(' ')} fill="none" stroke={CORAL} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />}

      {/* €4,400: a wide river of coral savings flowing back */}
      {river > 0 &&
        Array.from({ length: 150 }, (_, i) => {
          const s = ((t - T.river) * 0.22 + hash(i)) % 1;
          const [x, y] = bez(RIVER, s);
          const [nx, ny] = norm(RIVER, s);
          const o = (hash(i + 7919) - 0.5) * 44;
          const fade = Math.min(1, s * 6, (1 - s) * 6);
          return <circle key={`r${i}`} cx={x + nx * o} cy={y + ny * o} r={3 + hash(i + 15497) * 2.4} fill={CORAL} opacity={river * fade * 0.9} />;
        })}

      {/* Direction: arrowheads at the end of every flow, chevrons riding the river. */}
      <Arrow b={FEE} s={0.97} size={16} color={NAVY} opacity={fee} />
      <Arrow b={CARE} s={0.9} size={20} color={CORAL} opacity={care >= 0.98 ? 1 : 0} />
      <Arrow b={RIVER} s={0.9} size={30} color={CORAL} opacity={river} />
      <Arrow b={LATER} s={0.95} size={14} color={CORAL} opacity={later * 0.8} />
      {river > 0 &&
        [0, 1, 2].map((i) => {
          const s = ((t - T.river) * 0.18 + i / 3) % 1;
          return <Arrow key={`ch${i}`} b={RIVER} s={0.12 + s * 0.74} size={16} color="#fbf9f5" opacity={river * Math.min(1, s * 5, (1 - s) * 5)} />;
        })}
      {/* later: insurers */}
      {later > 0 &&
        Array.from({ length: 5 }, (_, i) => {
          const s = ((t - T.insurer) * 0.18 + i / 5) % 1;
          const [x, y] = bez(LATER, s);
          return <circle key={`l${i}`} cx={x} cy={y} r={3.5} fill={CORAL} opacity={later * 0.6 * Math.min(1, s * 6, (1 - s) * 6)} />;
        })}
    </svg>
  );
}

/** Line icons for each actor (traced in). */
function Icon({ k }: { k: NodeKey }) {
  const common = { fill: 'none', stroke: NAVY, strokeWidth: 2.4, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  if (k === 'vox')
    return (
      <svg viewBox="130 330 1000 420" width={70}>
        <path d={symbolLeft} fill={NAVY} />
        <path d={symbolMid} fill={CORAL} />
        <path d={symbolRight} fill={TEAL} />
      </svg>
    );
  return (
    <svg className="draw-in" width={60} height={60} viewBox="0 0 48 48" style={{ overflow: 'visible' }} {...common}>
      {k === 'maria' && (
        <>
          <circle cx={24} cy={14} r={7} pathLength={1} />
          <path d="M9 42 C9 29 39 29 39 42" pathLength={1} />
        </>
      )}
      {k === 'clinic' && (
        <>
          <path d="M6 42 V18 L24 8 L42 18 V42 Z" pathLength={1} />
          <path d="M24 20 V32 M18 26 H30" stroke={CORAL} pathLength={1} />
        </>
      )}
      {k === 'insurer' && (
        <>
          <path d="M24 5 L40 11 V24 C40 33 33 40 24 43 C15 40 8 33 8 24 V11 Z" pathLength={1} />
          <path d="M17 24 L22 29 L31 19" stroke={CORAL} pathLength={1} />
        </>
      )}
    </svg>
  );
}

function Node({ k, t }: { k: NodeKey; t: number }) {
  const n = NODES[k];
  const appearAt = k === 'insurer' ? T.insurer : T.nodes + n.delay;
  const winAt = T.wins + (['maria', 'clinic', 'vox', 'insurer'] as NodeKey[]).indexOf(k) * T.winGap;
  const faint = k === 'insurer';
  return (
    <motion.div
      style={{ position: 'absolute', left: n.x - 200, top: n.y - R, width: 400, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: faint ? 0.85 : 1, y: 0 }}
      transition={{ duration: 0.8, ease, delay: appearAt }}
    >
      <div
        style={{
          width: R * 2,
          height: R * 2,
          borderRadius: '50%',
          background: '#fbf9f5',
          border: `2px solid ${faint ? 'rgba(9,38,52,0.25)' : 'rgba(9,38,52,0.14)'}`,
          borderStyle: faint ? 'dashed' : 'solid',
          boxShadow: faint ? 'none' : '0 16px 40px rgba(9,38,52,0.10)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animationDelay: `${appearAt}s`,
        }}
      >
        <div style={{ animationDelay: `${appearAt + 0.2}s` }}>
          <Icon k={k} />
        </div>
      </div>
      <div className="display" style={{ fontSize: 28, fontWeight: 700, color: NAVY, marginTop: 14, whiteSpace: 'nowrap' }}>
        {n.name}
      </div>
      <div className="mono" style={{ fontSize: 15, color: TEAL, marginTop: 4 }}>
        {n.role}
      </div>
      {t >= winAt && (
        <motion.div
          className="display"
          style={{ fontSize: 22, fontWeight: 600, color: CORAL, marginTop: 12, textAlign: 'center', maxWidth: 360, lineHeight: 1.25 }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
        >
          ✓ {n.win}
        </motion.div>
      )}
    </motion.div>
  );
}

function Content() {
  const t = useElapsed();
  const status = t < T.wins ? 'Follow the money' : 'Everyone wins';
  const ended = t >= T.end;
  const [fx, fy] = bez(FEE, 0.5);
  const [rx, ry] = bez(RIVER, 0.5);
  const [cx, cy] = bez(CARE, 0.5);
  return (
    <div className="content">
      <div className="mono" style={{ position: 'absolute', left: 120, top: 62, fontSize: 18, color: NAVY, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ width: 10, height: 10, borderRadius: 5, background: CORAL, display: 'inline-block' }} />
        Revenue
      </div>
      <motion.div key={status} className="mono" style={{ position: 'absolute', right: 120, top: 62, fontSize: 18, color: TEAL }} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        {status}
      </motion.div>
      <div style={{ position: 'absolute', left: 120, top: 104 }}>
        <AnimatePresence mode="wait">
          <motion.h2
            key={ended ? 'end' : 'start'}
            className="display"
            style={{ fontSize: 56, color: ended ? CORAL : NAVY }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8, transition: { duration: 0.3 } }}
            transition={{ duration: 0.6, ease }}
          >
            {ended ? 'Everyone wins. Especially María.' : <Words text="Who pays, and why everyone wins." delay={T.head} />}
          </motion.h2>
        </AnimatePresence>
      </div>

      <Flows t={t} />

      {/* flow labels */}
      <motion.div style={{ position: 'absolute', left: fx - 300, top: fy - 108, width: 440, textAlign: 'center' }} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease, delay: T.fee + 0.4 }}>
        <div className="display" style={{ fontSize: 30, fontWeight: 700, color: NAVY }}>
          €40 <span style={{ fontSize: 22, fontWeight: 600 }}>/ patient / month</span>
        </div>
        <motion.div className="body" style={{ fontSize: 19, color: INK, marginTop: 2 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: T.fee + 1.0 }}>
          less than one private neurology visit (€75 – 180)
        </motion.div>
      </motion.div>
      <motion.div className="display" style={{ position: 'absolute', left: cx - 200, top: cy + 26, width: 400, textAlign: 'center', fontSize: 22, fontWeight: 600, color: CORAL }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: T.care + 0.8 }}>
        A daily voice check-in
      </motion.div>
      <motion.div style={{ position: 'absolute', left: rx - 230, top: ry - 150, width: 460, textAlign: 'center' }} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease, delay: T.river + 0.5 }}>
        <div className="number" style={{ fontSize: 50, lineHeight: 1, color: CORAL }}>
          €4,400
        </div>
        <div className="display" style={{ fontSize: 20, fontWeight: 600, color: NAVY, marginTop: 6 }}>
          back for every hospital stay avoided
        </div>
      </motion.div>

      {(Object.keys(NODES) as NodeKey[]).map((k) => (
        <Node key={k} k={k} t={t} />
      ))}

      {/* €0, stamped on María */}
      <div style={{ position: 'absolute', left: NODES.maria.x + 40, top: NODES.maria.y - 104 }}>
        <motion.div
          className="number"
          style={{ width: 88, height: 88, borderRadius: '50%', border: `4px solid ${CORAL}`, color: CORAL, fontSize: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fbf9f5' }}
          initial={{ opacity: 0, scale: 1.8, rotate: -24 }}
          animate={{ opacity: [0, 1, 1, 1], scale: [1.8, 0.94, 1.03, 1], rotate: [-24, -8, -12, -11] }}
          transition={{ duration: 0.7, delay: T.zero, times: [0, 0.45, 0.72, 1], ease: [0.5, 0, 0.75, 0] }}
        >
          €0
        </motion.div>
      </div>
    </div>
  );
}

export const S13: SlideDef = {
  id: 'S13',
  builds: 1,
  notes:
    'Follow the money. The clinic or hospital pays forty euros per patient per month — less than a single private neurology visit. María pays nothing: she just gets a daily check-in. And for every hospital stay we help avoid, about four thousand four hundred euros flow back to the clinic. Later, insurers save the same way. Everyone wins: María gets someone listening every day, the clinic gets fewer emergencies and more patients with the same team, and we get recurring revenue at around seventy percent gross margin. Especially María.',
  theme: () => 'light',
  wave: () => ({ shape: wave({ y: 540, amp: 30 }), opacity: 0, duration: 1600, stagger: 0 }),
  bg: () => ({ pool: [0.5, 0.5], poolStrength: 1, warm: 0.6 }),
  Content,
};
