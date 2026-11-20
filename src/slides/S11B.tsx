import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { C, EASE } from '../brand/tokens';
import type { SlideDef } from '../deck/types';
import { wave } from '../engine/shapes';
import { Words } from '../ui/motion';

const ease = EASE as unknown as [number, number, number, number];

/**
 * Built to last — part 2: "Every risk has an answer."
 * María's voice runs across the page as a thread. It breaks in six places, each
 * under an objection; one by one a coral pulse stitches every gap and the answer
 * appears below, with a small line icon. It ends whole, calm and coral.
 */

const NAVY = C.navy, TEAL = C.teal, CORAL = C.coral;

const X0 = 90, X1 = 1830, Y = 548;
const N = 6;
const CX = Array.from({ length: N }, (_, k) => X0 + ((k + 0.5) * (X1 - X0)) / N);

// ---------- Timeline (s since the slide appeared) ----------
const T = { head: 0.15, break0: 0.7, break1: 1.3, heal0: 2.0, healGap: 0.95, healDur: 0.45 };
const healAt = (k: number) => T.heal0 + k * T.healGap;
const ALL_HEALED = healAt(N - 1) + T.healDur;

const GAP = 36; // half-width of each break
const ZONE = 145; // half-width of the stretch that turns coral once stitched

const ITEMS: { q: string; a: string; icon: JSX.Element }[] = [
  {
    q: 'More work for her doctor?',
    a: 'One page.\nUnder 2 minutes.',
    icon: (
      <>
        <rect x={13} y={6} width={22} height={34} rx={3} pathLength={1} />
        <path d="M18 16 H30 M18 22 H30 M18 28 H25" pathLength={1} />
      </>
    ),
  },
  {
    q: 'What if it’s wrong?',
    a: 'It never diagnoses.\nHer doctor decides.',
    icon: (
      <>
        <circle cx={24} cy={14} r={7} pathLength={1} />
        <path d="M9 41 C9 29 39 29 39 41" pathLength={1} />
        <path d="M33 33 V41 M29 37 H37" pathLength={1} />
      </>
    ),
  },
  {
    q: 'Who hears her voice?',
    a: 'Only her doctor.\nData stays in the EU.',
    icon: (
      <>
        <rect x={12} y={21} width={24} height={19} rx={3} pathLength={1} />
        <path d="M17 21 V15 A7 7 0 0 1 31 15 V21" pathLength={1} />
        <path d="M24 28 V33" pathLength={1} />
      </>
    ),
  },
  {
    q: 'Does it work for every voice?',
    a: 'It compares her\nonly with herself.',
    icon: (
      <>
        <path d="M4 20 C10 10 16 30 24 20 S38 10 44 20" pathLength={1} />
        <path d="M4 28 C10 18 16 38 24 28 S38 18 44 28" pathLength={1} />
      </>
    ),
  },
  {
    q: 'What if she can’t use tech?',
    a: 'One button.\nNo phone, no internet.',
    icon: (
      <>
        <rect x={8} y={8} width={32} height={32} rx={8} pathLength={1} />
        <circle cx={24} cy={24} r={7} pathLength={1} />
      </>
    ),
  },
  {
    q: 'And the waste?',
    a: 'Each device is\nrefurbished and reused.',
    icon: (
      <>
        <path d="M37 17 A15 15 0 0 0 10 19" pathLength={1} />
        <path d="M10 11 V19 H18" pathLength={1} />
        <path d="M11 31 A15 15 0 0 0 38 29" pathLength={1} />
        <path d="M38 37 V29 H30" pathLength={1} />
      </>
    ),
  },
];

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

function Thread({ t }: { t: number }) {
  const brk = io(clamp((t - T.break0) / (T.break1 - T.break0)));
  const heal = CX.map((_, k) => io(clamp((t - healAt(k)) / T.healDur)));
  const done = clamp((t - ALL_HEALED) / 0.8); // the whole thread turns coral at the end
  const calm = 1 - 0.55 * done;

  // Sample the thread; each sample knows whether it is visible and whether it is coral.
  const pts: { x: number; y: number; vis: boolean; coral: boolean }[] = [];
  for (let x = X0; x <= X1; x += 4) {
    let k = 0, d = Infinity;
    CX.forEach((c, i) => {
      if (Math.abs(x - c) < d) (d = Math.abs(x - c)), (k = i);
    });
    const open = brk * (1 - heal[k]); // 1 = fully broken here
    const near = clamp(1 - d / 110);
    const shake = open * near * (Math.sin(t * 31 + x * 0.9) * 3.2 + Math.sin(t * 17 - x * 0.37) * 2);
    const y = Y + 16 * calm * Math.sin(0.0105 * x - 1.15 * t) + 5 * Math.sin(0.031 * x + 0.8 * t) * calm + shake;
    const vis = d > GAP * open;
    const coral = done > 0 || d < ZONE * heal[k];
    pts.push({ x, y, vis, coral });
  }
  // Group consecutive visible samples into runs by colour.
  const runs: { d: string; coral: boolean }[] = [];
  let cur: { pts: string[]; coral: boolean } | null = null;
  for (const p of pts) {
    if (!p.vis) {
      if (cur && cur.pts.length > 1) runs.push({ d: 'M' + cur.pts.join(' L'), coral: cur.coral });
      cur = null;
      continue;
    }
    const s = `${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
    if (!cur || cur.coral !== p.coral) {
      if (cur && cur.pts.length > 1) runs.push({ d: 'M' + cur.pts.join(' L'), coral: cur.coral });
      cur = { pts: cur ? [cur.pts[cur.pts.length - 1], s] : [s], coral: p.coral };
    } else cur.pts.push(s);
  }
  if (cur && cur.pts.length > 1) runs.push({ d: 'M' + cur.pts.join(' L'), coral: cur.coral });

  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
      {runs.map((r, i) => (
        <path key={i} d={r.d} fill="none" stroke={r.coral ? CORAL : NAVY} strokeWidth={r.coral ? 4 : 3.5} strokeLinecap="round" strokeLinejoin="round" />
      ))}
      {/* Frayed ends at each open break, and the stitch flash when it closes. */}
      {CX.map((c, k) => {
        const open = brk * (1 - heal[k]);
        const g = GAP * open;
        const flash = heal[k] > 0 && heal[k] < 1 ? Math.sin(Math.PI * heal[k]) : 0;
        const yAt = (x: number) => Y + 16 * calm * Math.sin(0.0105 * x - 1.15 * t) + 5 * Math.sin(0.031 * x + 0.8 * t) * calm;
        return (
          <g key={k}>
            {open > 0.05 &&
              [-1, 1].map((side) => {
                const ex = c + side * g, ey = yAt(ex);
                return (
                  <g key={side} stroke={NAVY} strokeWidth={1.6} strokeLinecap="round" opacity={0.75 * open}>
                    <line x1={ex} y1={ey} x2={ex - side * 9} y2={ey - 7} />
                    <line x1={ex} y1={ey} x2={ex - side * 11} y2={ey + 1} />
                    <line x1={ex} y1={ey} x2={ex - side * 8} y2={ey + 8} />
                  </g>
                );
              })}
            {flash > 0.02 && (
              <g>
                <circle cx={c} cy={yAt(c)} r={10 + 30 * heal[k]} fill="none" stroke={CORAL} strokeWidth={2.5} opacity={flash * 0.8} />
                <circle cx={c} cy={yAt(c)} r={6} fill={CORAL} opacity={flash} />
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function Item({ k, t }: { k: number; t: number }) {
  const it = ITEMS[k];
  const c = CX[k];
  const h = healAt(k);
  const answered = t >= h + 0.2;
  return (
    <>
      {/* The objection, above the break */}
      <motion.div
        className="display"
        style={{ position: 'absolute', left: c - 140, top: 352, width: 280, height: 120, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', textAlign: 'center', fontSize: 28, fontWeight: 600, lineHeight: 1.2 }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0, color: answered ? 'rgba(9,38,52,0.38)' : 'rgba(9,38,52,0.75)' }}
        transition={{ duration: 0.7, ease, delay: T.break0 + 0.25 + k * 0.07, color: { duration: 0.5 } }}
      >
        {it.q}
      </motion.div>
      {/* The answer, below, once the thread is stitched */}
      {answered && (
        <>
          <svg
            className="draw-in"
            width={70}
            height={70}
            viewBox="0 0 48 48"
            style={{ position: 'absolute', left: c - 35, top: 616, overflow: 'visible', animationDelay: '0.05s' }}
            fill="none"
            stroke={CORAL}
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {it.icon}
          </svg>
          <motion.div
            className="display"
            style={{ position: 'absolute', left: c - 150, top: 704, width: 300, textAlign: 'center', fontSize: 27, fontWeight: 600, lineHeight: 1.25, color: NAVY, whiteSpace: 'pre-line' }}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease, delay: 0.15 }}
          >
            {it.a}
          </motion.div>
        </>
      )}
    </>
  );
}

function Content() {
  const t = useElapsed();
  const status = t < T.heal0 ? 'Stress test' : t < ALL_HEALED ? 'Answering' : 'Holding';
  return (
    <div className="content">
      <div className="mono" style={{ position: 'absolute', left: 120, top: 62, fontSize: 18, color: NAVY, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ width: 10, height: 10, borderRadius: 5, background: CORAL, display: 'inline-block' }} />
        Built to last
      </div>
      <motion.div key={status} className="mono" style={{ position: 'absolute', right: 120, top: 62, fontSize: 18, color: status === 'Holding' ? CORAL : TEAL }} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        {status}
      </motion.div>
      <h2 className="display" style={{ position: 'absolute', left: 120, top: 104, fontSize: 64, color: NAVY }}>
        <Words text="Every risk has an answer." delay={T.head} />
      </h2>

      <Thread t={t} />
      {ITEMS.map((_, k) => (
        <Item key={k} k={k} t={t} />
      ))}
      {/* Once every break is stitched. */}
      {t >= ALL_HEALED + 0.3 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 878, textAlign: 'center' }}>
          <h3 className="display" style={{ fontSize: 66, color: CORAL }}>
            <Words text="Built to last." delay={0} />
          </h3>
        </div>
      )}
    </div>
  );
}

export const S11B: SlideDef = {
  id: 'S11B',
  builds: 1,
  notes:
    'Every risk has an answer. More work for her doctor? One page, under two minutes. What if it’s wrong? It never diagnoses; her doctor decides. Who hears her voice? Only her doctor, and her data stays in the EU. Does it work for every voice? It compares her only with herself. What if she can’t use tech? One button, no phone, no internet. And the waste? Every device is refurbished and lent again.',
  theme: () => 'light',
  wave: () => ({ shape: wave({ y: 540, amp: 30 }), opacity: 0, duration: 1600, stagger: 0 }),
  bg: () => ({ pool: [0.5, 0.5], poolStrength: 1, warm: 0.6 }),
  Content,
};
