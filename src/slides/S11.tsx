import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { C, EASE } from '../brand/tokens';
import type { SlideDef } from '../deck/types';
import { wave } from '../engine/shapes';
import { Words } from '../ui/motion';

const ease = EASE as unknown as [number, number, number, number];

/**
 * Built to last — part 1, on paper.
 * Left, "For us": the contribution line climbs out of the red and crosses zero at
 * break-even. Right, "For the clinic": a balance. VoxWave (€480 a patient-year) lands
 * on one pan; on the other, what Parkinson's costs per patient per year falls block by
 * block (healthcare, family care, lost work ≈ €14,300). VoxWave is 3.4% of that bill.
 */

const NAVY = C.navy, TEAL = C.teal, CORAL = C.coral;
const INK = 'rgba(9,38,52,0.72)';

// ---------- Timeline (s since the slide appeared) ----------
const T = {
  head: 0.15,
  cols: 0.45,
  chart: 0.6, // axes
  line0: 1.0, // the dot travels 0 → 600 patients
  line1: 4.2,
  scale: 2.6, // the balance appears
  vox: 3.5, // VoxWave lands on the left pan
  costs: [4.6, 5.5, 6.2], // what Parkinson's costs, block by block, on the right pan
  final: 7.3,
};

// ---------- Left: break-even chart ----------
const CH = { x0: 150, x1: 860, zero: 600, half: 150 };
const PMAX = 680, BE = 340; // patients; break-even (≈ €114k fixed / €335 contribution per patient-year)
const px = (p: number) => CH.x0 + ((CH.x1 - CH.x0) * p) / PMAX;
const py = (p: number) => CH.zero - ((p - BE) / BE) * CH.half; // straight line through break-even

// ---------- Right: the balance ----------
const PIV = { x: 1390, y: 470 };
const ARM = 250, HANG = 150;
const VOX = { w: 84, h: 40 };
// What Parkinson's costs per patient per year in Europe: mean €14,278, split like the
// COIN-Eu total (76% direct care, 19% informal care, 4% lost work). Movement Disorders 2026.
const COSTS = [
  { label: 'Healthcare', sub: 'stays · emergencies · visits · drugs', value: 10840, w: 240, h: 116 },
  { label: 'Family care', value: 2760, w: 214, h: 50 },
  { label: 'Lost work', value: 630, w: 160, h: 34 },
];
const MEAN = 14278;
const SHARE = ((480 / MEAN) * 100).toFixed(1); // 3.4
const DROP = 0.42; // seconds of free fall
const eur = (v: number) => `€${Math.round(v).toLocaleString('en-US')}`;

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const io = (v: number) => (v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2);
const inQ = (v: number) => v * v;

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

/** A damped spring that follows a target angle (gives the beam its weight and wobble). */
function useSpring(target: number, t: number) {
  const st = useRef({ x: 0, v: 0, t: 0 });
  const s = st.current;
  const dt = Math.min(0.05, Math.max(0, t - s.t));
  s.t = t;
  // Stiffness/damping tuned for a heavy, slightly bouncy beam.
  const k = 70, c = 9;
  for (let i = 0; i < 4; i++) {
    const h = dt / 4;
    const a = k * (target - s.x) - c * s.v;
    s.v += a * h;
    s.x += s.v * h;
  }
  return s.x;
}

function BreakEven({ t }: { t: number }) {
  const ax = io(clamp((t - T.chart) / 0.7));
  const prog = io(clamp((t - T.line0) / (T.line1 - T.line0)));
  const p = PMAX * prog;
  const reached = p >= BE;
  const pulse = reached ? ((t - (T.line0 + (T.line1 - T.line0) * 0.5)) % 1.6) / 1.6 : 0;
  // Area under the line: red below zero, coral above.
  const neg = `M${px(0)},${CH.zero} L${px(0)},${py(0)} L${px(Math.min(p, BE))},${py(Math.min(p, BE))} L${px(Math.min(p, BE))},${CH.zero} Z`;
  const pos = p > BE ? `M${px(BE)},${CH.zero} L${px(p)},${py(p)} L${px(p)},${CH.zero} Z` : '';
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
      <path d={neg} fill={NAVY} opacity={0.07} />
      {pos && <path d={pos} fill={CORAL} opacity={0.14} />}
      {/* zero line + axis */}
      <line x1={CH.x0} x2={CH.x0 + (CH.x1 - CH.x0) * ax} y1={CH.zero} y2={CH.zero} stroke={NAVY} strokeWidth={2} />
      <text x={CH.x0 - 14} y={CH.zero - CH.half + 8} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize={16} fill={TEAL} opacity={ax}>
        PROFIT
      </text>
      <text x={CH.x0 - 14} y={CH.zero + CH.half} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize={16} fill="rgba(9,38,52,0.45)" opacity={ax}>
        LOSS
      </text>
      {[0, 170, 340, 510, 680].map((q) => (
        <text key={q} x={px(q)} y={CH.zero + CH.half + 54} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize={17} fill={q === BE ? CORAL : 'rgba(9,38,52,0.5)'} opacity={ax}>
          {q}
        </text>
      ))}
      <text x={CH.x1} y={CH.zero + CH.half + 84} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize={15} fill="rgba(9,38,52,0.45)" opacity={ax}>
        PATIENTS
      </text>
      {/* the line */}
      {prog > 0 && (
        <>
          <line x1={px(0)} y1={py(0)} x2={px(Math.min(p, BE))} y2={py(Math.min(p, BE))} stroke={NAVY} strokeWidth={4} strokeLinecap="round" />
          {p > BE && <line x1={px(BE)} y1={py(BE)} x2={px(p)} y2={py(p)} stroke={CORAL} strokeWidth={4} strokeLinecap="round" />}
          <circle cx={px(p)} cy={py(p)} r={8} fill={p > BE ? CORAL : NAVY} />
        </>
      )}
      {/* the break-even point */}
      {reached && (
        <g>
          <line x1={px(BE)} x2={px(BE)} y1={CH.zero} y2={CH.zero + CH.half + 26} stroke={CORAL} strokeWidth={1.5} strokeDasharray="3 6" />
          <circle cx={px(BE)} cy={CH.zero} r={11 + pulse * 26} fill="none" stroke={CORAL} strokeWidth={2} opacity={0.7 * (1 - pulse)} />
          <circle cx={px(BE)} cy={CH.zero} r={11} fill="#fbf9f5" stroke={CORAL} strokeWidth={4} />
        </g>
      )}
    </svg>
  );
}

function Balance({ t }: { t: number }) {
  const appear = io(clamp((t - T.scale) / 0.7));
  // Weight on each side (each block counts once it has landed, with a short settle).
  const settle = (land: number) => clamp((t - land) / 0.25);
  const L = 480 * settle(T.vox);
  const R = COSTS.reduce((s, c, i) => s + c.value * settle(T.costs[i]), 0);
  const target = 13 * Math.tanh((R - L) / 3500); // degrees; + = right side down
  const ang = useSpring(target, t);
  const a = (ang * Math.PI) / 180;
  const end = (side: -1 | 1): [number, number] => [PIV.x + side * ARM * Math.cos(a), PIV.y + side * ARM * Math.sin(a)];
  const [lx, ly] = end(-1), [rx, ry] = end(1);
  const lPan = { x: lx, y: ly + HANG }, rPan = { x: rx, y: ry + HANG };

  // Falling blocks: free fall from above, then ride on their pan.
  const fall = (land: number, panY: number, restY: number) => {
    const f = clamp((t - (land - DROP)) / DROP);
    const top = 360;
    return t < land ? top + (panY - top + restY) * inQ(f) : panY + restY;
  };

  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, overflow: 'visible' }} opacity={appear}>
      {/* stand */}
      <path d={`M${PIV.x} ${PIV.y} L${PIV.x} ${770} M${PIV.x - 90} ${776} L${PIV.x + 90} ${776}`} stroke={NAVY} strokeWidth={6} strokeLinecap="round" fill="none" />
      <path d={`M${PIV.x - 26} ${776} L${PIV.x} ${742} L${PIV.x + 26} ${776} Z`} fill={NAVY} />
      {/* beam */}
      <line x1={lx} y1={ly} x2={rx} y2={ry} stroke={NAVY} strokeWidth={7} strokeLinecap="round" />
      <circle cx={PIV.x} cy={PIV.y} r={13} fill="#fbf9f5" stroke={NAVY} strokeWidth={5} />
      {/* strings + pans */}
      {[lPan, rPan].map((pn, i) => (
        <g key={i}>
          <line x1={pn.x - 70} y1={pn.y} x2={i ? rx : lx} y2={i ? ry : ly} stroke="rgba(9,38,52,0.45)" strokeWidth={2} />
          <line x1={pn.x + 70} y1={pn.y} x2={i ? rx : lx} y2={i ? ry : ly} stroke="rgba(9,38,52,0.45)" strokeWidth={2} />
          <path d={`M${pn.x - 92} ${pn.y} Q${pn.x} ${pn.y + 34} ${pn.x + 92} ${pn.y}`} stroke={NAVY} strokeWidth={6} fill="none" strokeLinecap="round" />
        </g>
      ))}
      {/* VoxWave: €480, one patient for a year */}
      {t >= T.vox - DROP &&
        (() => {
          const y = fall(T.vox, lPan.y, -VOX.h - 6);
          const x = lPan.x - VOX.w / 2;
          const hit = Math.exp(-Math.pow((t - T.vox) * 7, 2));
          return (
            <g opacity={clamp((t - (T.vox - DROP)) / 0.15)}>
              <rect x={x} y={y} width={VOX.w} height={VOX.h} rx={9} fill={CORAL} />
              <text x={x + VOX.w / 2} y={y + 27} textAnchor="middle" fontFamily="Sora, sans-serif" fontWeight={700} fontSize={19} fill="#fff">
                €480
              </text>
              {hit > 0.02 && <rect x={x - 4} y={y - 4} width={VOX.w + 8} height={VOX.h + 8} rx={12} fill="none" stroke={CORAL} strokeWidth={2} opacity={hit} />}
            </g>
          );
        })()}
      {/* What Parkinson's costs, stacked block by block: each lands heavier than VoxWave */}
      {COSTS.map((c, i) => {
        const land = T.costs[i];
        if (t < land - DROP) return null;
        const below = COSTS.slice(0, i).reduce((s, b) => s + b.h + 4, 0);
        const y = fall(land, rPan.y, -below - c.h - 4);
        const x = rPan.x - c.w / 2;
        const hit = Math.exp(-Math.pow((t - land) * 5, 2));
        const big = i === 0;
        return (
          <g key={c.label} opacity={clamp((t - (land - DROP)) / 0.15)}>
            {big && hit > 0.02 && <ellipse cx={rPan.x} cy={rPan.y + 8} rx={110 + (1 - hit) * 60} ry={14} fill="none" stroke={NAVY} strokeWidth={2} opacity={hit * 0.6} />}
            <rect x={x} y={y} width={c.w} height={c.h} rx={big ? 14 : 9} fill={NAVY} opacity={big ? 1 : i === 1 ? 0.82 : 0.66} />
            {big && (
              <>
                <rect x={x + 22} y={y + 20} width={8} height={24} rx={2} fill="#fbf9f5" />
                <rect x={x + 14} y={y + 28} width={24} height={8} rx={2} fill="#fbf9f5" />
              </>
            )}
            <text x={big ? x + 50 : x + c.w / 2} y={big ? y + 40 : y + c.h / 2 + 7} textAnchor={big ? 'start' : 'middle'} fontFamily="Sora, sans-serif" fontWeight={700} fontSize={big ? 22 : i === 1 ? 16 : 14} fill="#fbf9f5">
              {big ? c.label : `${c.label} ${eur(c.value)}`}
            </text>
            {big && (
              <>
                <text x={x + c.w / 2} y={y + 80} textAnchor="middle" fontFamily="Sora, sans-serif" fontWeight={700} fontSize={30} fill="#fbf9f5">
                  {eur(c.value)}
                </text>
                <text x={x + c.w / 2} y={y + 102} textAnchor="middle" fontFamily="Inter, sans-serif" fontSize={13} fill="rgba(251,249,245,0.75)">
                  {c.sub}
                </text>
              </>
            )}
          </g>
        );
      })}
      {/* pan captions */}
      <text x={lPan.x} y={lPan.y + 66} textAnchor="middle" fontFamily="Inter, sans-serif" fontSize={20} fill={CORAL} opacity={clamp((t - T.vox) / 0.5)}>
        VoxWave · one patient, one year
      </text>
      <text x={rPan.x} y={rPan.y + 66} textAnchor="middle" fontFamily="Inter, sans-serif" fontSize={20} fill={INK} opacity={clamp((t - T.costs[0]) / 0.5)}>
        Parkinson’s, per patient, per year
      </text>
    </svg>
  );
}

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.85, ease, delay },
});

function Content() {
  const t = useElapsed();
  const prog = io(clamp((t - T.line0) / (T.line1 - T.line0)));
  const patients = Math.min(BE, Math.round(PMAX * prog));
  const landed = COSTS.reduce((s, c, i) => s + (t >= T.costs[i] ? c.value : 0), 0);
  const status = t < T.costs[0] ? 'Unit economics' : t < T.final ? 'Weighing it up' : 'Worth it';
  return (
    <div className="content">
      <div className="mono" style={{ position: 'absolute', left: 120, top: 62, fontSize: 18, color: NAVY, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ width: 10, height: 10, borderRadius: 5, background: CORAL, display: 'inline-block' }} />
        Built to last
      </div>
      <motion.div key={status} className="mono" style={{ position: 'absolute', right: 120, top: 62, fontSize: 18, color: TEAL }} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        {status}
      </motion.div>
      <h2 className="display" style={{ position: 'absolute', left: 120, top: 104, fontSize: 52, color: NAVY }}>
        <Words text="Clinics pay, not grants. And it saves them money." delay={T.head} />
      </h2>

      {/* divider */}
      <motion.div style={{ position: 'absolute', left: 960, top: 230, width: 1.5, height: 690, background: 'rgba(9,38,52,0.12)', transformOrigin: '50% 0%' }} initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ duration: 1.2, ease, delay: T.cols }} />

      {/* ---- For us ---- */}
      <motion.div style={{ position: 'absolute', left: 120, top: 232 }} {...rise(T.cols)}>
        <div className="mono" style={{ fontSize: 17, color: CORAL }}>
          For us
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginTop: 6 }}>
          <span className="number" style={{ fontSize: 86, lineHeight: 1, color: patients >= BE ? CORAL : NAVY, transition: 'color .4s' }}>
            {patients}
          </span>
          <span className="display" style={{ fontSize: 30, fontWeight: 600, color: NAVY }}>
            patients
          </span>
        </div>
      </motion.div>
      <BreakEven t={t} />
      <motion.div style={{ position: 'absolute', left: 120, top: 850, width: 780 }} {...rise(T.line0 + 1.6)}>
        <div className="display" style={{ fontSize: 26, fontWeight: 600, color: NAVY }}>
          At €40 a patient a month, VoxWave pays for itself at 340.
        </div>
        <div className="body" style={{ fontSize: 21, marginTop: 6, color: INK }}>
          Just 0.17% of patients in Spain.
        </div>
      </motion.div>

      {/* ---- For the clinic ---- */}
      <motion.div style={{ position: 'absolute', left: 1040, top: 232 }} {...rise(T.cols + 0.15)}>
        <div className="mono" style={{ fontSize: 17, color: CORAL }}>
          For the clinic
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginTop: 6 }}>
          <span className="number" style={{ fontSize: 86, lineHeight: 1, color: t >= T.final ? CORAL : NAVY, transition: 'color .4s' }}>
            {t < T.costs[0] ? '€480' : t < T.final ? `€480 vs ${eur(landed)}` : `${SHARE}%`}
          </span>
          {t >= T.final && (
            <motion.span className="display" style={{ fontSize: 26, fontWeight: 600, color: NAVY }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
              of what Parkinson’s already costs
            </motion.span>
          )}
        </div>
      </motion.div>
      <Balance t={t} />
      <motion.div style={{ position: 'absolute', left: 1040, top: 832, width: 790 }} {...rise(T.final)}>
        <div className="display" style={{ fontSize: 25, fontWeight: 600, color: CORAL, lineHeight: 1.25 }}>
          Catch changes early, trim that bill by just {SHARE}%, and VoxWave pays for itself.
        </div>
        <div className="body" style={{ fontSize: 18, marginTop: 10, color: INK }}>
          Mean cost per patient in Europe: €14,278 a year · COIN-Eu, Movement Disorders 2026
        </div>
      </motion.div>
    </div>
  );
}

export const S11: SlideDef = {
  id: 'S11',
  builds: 1,
  notes:
    "And it's built to last. Clinics pay, not grants: forty euros a patient a month, and we break even at three hundred and forty patients. For the clinic, Parkinson's already costs over fourteen thousand euros per patient a year. VoxWave is three point four percent of that bill.",

  theme: () => 'light',
  wave: () => ({ shape: wave({ y: 540, amp: 30 }), opacity: 0, duration: 1600, stagger: 0 }),
  bg: () => ({ pool: [0.5, 0.5], poolStrength: 1, warm: 0.6 }),
  Content,
};
