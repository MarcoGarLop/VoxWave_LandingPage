import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import * as THREE from 'three';
import { C, EASE } from '../brand/tokens';
import type { SlideDef } from '../deck/types';
import { clock } from '../engine/Engine';
import { globeDots, spainDots } from '../engine/geo';
import { clamp } from '../engine/math';
import type { ParticleTarget } from '../engine/Particles';
import { wave } from '../engine/shapes';
import { At, Words } from '../ui/motion';

const ease = EASE as unknown as [number, number, number, number];

/**
 * The gap. Spain's dots condense into one year: 365 days. Only two of them light up —
 * the neurology visits. Build 1: in the dark days in between, things happen that
 * nobody sees. These people need a way to monitor how they are doing.
 */

// ---------- One year, as a calendar of dots ----------
const DAYS = 365;
const CELL = 29;
const COLS = Math.ceil(DAYS / 7); // 53 weeks
const CAL = { x: (1920 - (COLS - 1) * CELL) / 2, y: 500 };
const dayXY = (d: number): [number, number] => [CAL.x + Math.floor(d / 7) * CELL, CAL.y + (d % 7) * CELL];
const VISITS = [38, 221]; // about six months apart
/** Days in between where something goes wrong, unseen (with when they flare, in s). */
const EVENTS: [number, number][] = [
  [92, 0.5],
  [129, 0.95],
  [163, 1.4],
  [190, 1.85],
];

const MAP_BOX: [[number, number], [number, number]] = [[1010, 140], [1790, 930]]; // same as the globe slide
let G = 0;
let M = 0;
function data() {
  if (G) return;
  G = globeDots().length;
  M = spainDots(MAP_BOX).length;
}

const col = {
  paper: new THREE.Color(C.paper),
  coral: new THREE.Color(C.coral),
  hot: new THREE.Color(C.coralHot),
};

function target(between: boolean, t0: number): ParticleTarget {
  return (pos, colr, size, n, t) => {
    const k = t - t0;
    for (let i = 0; i < n; i++) {
      let c = col.paper, a = 0, s = 1;
      const m = i - G;
      if (m >= 0 && m < M) {
        // Spain's dots: the first 365 become the days; the rest melt into them.
        const d = m < DAYS ? m : m % DAYS;
        const [x, y] = dayXY(d);
        pos[i * 3] = x;
        pos[i * 3 + 1] = y;
        pos[i * 3 + 2] = 0;
        if (m < DAYS) {
          const visit = VISITS.includes(d);
          const inGap = d > VISITS[0] && d < VISITS[1];
          const ev = EVENTS.find(([e]) => e === d);
          if (visit) {
            const pulse = 0.85 + 0.15 * Math.sin(t * 2.4);
            (c = col.coral), (a = pulse), (s = 8.5);
          } else if (between && ev) {
            // A flare, then a restless glow that never quite goes away.
            const on = clamp((k - ev[1]) / 0.25);
            const flick = 0.7 + 0.3 * Math.sin(t * 9 + d);
            (c = on > 0.5 ? col.coral : col.paper), (a = 0.3 + on * 0.7 * flick), (s = 2.6 + on * 2.2);
          } else {
            (c = col.paper), (a = between && inGap ? 0.22 : 0.42), (s = 2.6);
          }
        }
      }
      colr[i * 4] = c.r;
      colr[i * 4 + 1] = c.g;
      colr[i * 4 + 2] = c.b;
      colr[i * 4 + 3] = a;
      size[i] = s;
    }
  };
}

function particles(b: number) {
  data();
  return {
    state: {
      target: target(b === 1, clock.t),
      duration: b === 0 ? 2600 : 900,
      scatter: b === 0 ? 0.5 : 0,
      size: 3.4,
    },
  };
}

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

/** A visit: a tick above its day, and the word, big enough to read from the back. */
function VisitTag({ d, delay }: { d: number; delay: number }) {
  const [x] = dayXY(d);
  return (
    <motion.div
      style={{ position: 'absolute', left: x - 100, top: CAL.y - 92, width: 200, textAlign: 'center' }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7, ease, delay }}
    >
      <div className="mono" style={{ fontSize: 18, color: 'var(--coral)' }}>
        Visit
      </div>
      <div style={{ width: 2, height: 34, background: 'var(--coral)', margin: '10px auto 0', opacity: 0.7 }} />
    </motion.div>
  );
}

/** The days nobody sees: a bracket under the gap. */
function GapBracket() {
  const [xa] = dayXY(VISITS[0] + 7);
  const [xb] = dayXY(VISITS[1] - 7);
  const y = CAL.y + 7 * CELL + 6;
  return (
    <motion.div style={{ position: 'absolute', left: xa, top: y, width: xb - xa }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.2 }}>
      <div style={{ height: 14, borderLeft: '2px solid var(--ink-40)', borderRight: '2px solid var(--ink-40)', borderBottom: '2px solid var(--ink-40)' }} />
      <div className="display" style={{ fontSize: 30, fontWeight: 600, textAlign: 'center', marginTop: 16, color: 'var(--ink-70)' }}>
        Months nobody is watching.
      </div>
    </motion.div>
  );
}

function Between() {
  const t = useElapsed();
  return (
    <motion.div style={{ position: 'absolute', inset: 0 }} exit={{ opacity: 0 }}>
      <GapBracket />
      {/* The link to everything that follows: what these people need. */}
      {t > 2.0 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 850, textAlign: 'center' }}>
          <h3 className="display" style={{ fontSize: 66, lineHeight: 1.1 }}>
            <Words text="These people need a way to monitor how they’re doing." delay={0} wordClass={(w) => (w === 'need' ? 'coral' : undefined)} />
          </h3>
        </div>
      )}
    </motion.div>
  );
}

function Content({ build }: { build: number }) {
  return (
    <div className="content">
      {/* The headline changes with the build; the calendar stays. */}
      <div style={{ position: 'absolute', left: 120, top: 120, width: 1680 }}>
        <AnimatePresence mode="wait">
          {build === 0 ? (
            <motion.div key="visits" exit={{ opacity: 0, y: -10, transition: { duration: 0.35 } }}>
              <h2 className="display" style={{ fontSize: 58, fontWeight: 600 }}>
                <Words text="A neurologist sees them" delay={0.4} />
              </h2>
              <h2 className="display coral" style={{ fontSize: 104, marginTop: 6 }}>
                <Words text="once or twice a year." delay={1.0} />
              </h2>
            </motion.div>
          ) : (
            <motion.div key="between">
              <h2 className="display" style={{ fontSize: 58, fontWeight: 600 }}>
                <Words text="In between, things can get" delay={0.1} />
              </h2>
              <h2 className="display coral" style={{ fontSize: 104, marginTop: 6 }}>
                <Words text="much worse." delay={0.5} />
              </h2>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <At build={build} at={0}>
        <motion.div key="tags" style={{ position: 'absolute', inset: 0 }} exit={{ opacity: 1 }}>
          {VISITS.map((d, i) => (
            <VisitTag key={d} d={d} delay={1.8 + i * 0.35} />
          ))}
        </motion.div>
      </At>
      <At build={build} at={1}>
        <Between key="between" />
      </At>
    </div>
  );
}

export const S02B: SlideDef = {
  id: 'S02B',
  builds: 2,
  auto: [4.4],
  notes:
    "And yet a neurologist sees them once or twice a year. Two days out of three hundred and sixty-five. In between, things can get much worse: a fall, a bad week, a voice that fades. And nobody is watching. These people need a way to monitor how they're doing.",
  wave: () => ({ shape: wave({ y: 540, amp: 30 }), opacity: 0, duration: 1200, stagger: 0 }),
  particles,
  bg: (b) => ({ pool: [0.5, 0.58], poolStrength: b === 0 ? 0.9 : 0.7, warm: b === 0 ? 0.5 : 0.85 }),
  Content,
};
