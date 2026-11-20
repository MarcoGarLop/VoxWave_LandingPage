import { motion } from 'motion/react';
import { C, EASE } from '../brand/tokens';
import { Logo } from '../brand/Logo';
import type { SlideDef } from '../deck/types';
import { put } from '../engine/paint';
import { wave } from '../engine/shapes';
import { At, Counter, Words } from '../ui/motion';

const ease = EASE as unknown as [number, number, number, number];

/**
 * The close, in one slide.
 * Build 0 (dark): the thread comes back — "María isn't one person." and the three
 * numbers she stands for. Build 1: the page dawns one last time — the logo, the
 * slogan and the team.
 */

const TEAM = [
  ['Javier', 'Hardware'],
  ['Martín', 'Voice AI & ML'],
  ['Marco', 'Product & finance'],
  ['Victor', 'Marketing & go-to-market'],
];

const NUMBERS: { to: number; fmt: (v: number) => string; label: string }[] = [
  { to: 200000, fmt: (v) => `${(Math.round(v / 1000) * 1000).toLocaleString('en-US')}+`, label: 'in Spain' },
  { to: 2.3, fmt: (v) => `${v.toFixed(1)}M`, label: 'Spanish speakers' },
  { to: 11.8, fmt: (v) => `${v.toFixed(1)}M`, label: 'in the world' },
];

function Content({ build }: { build: number }) {
  return (
    <div className="content">
      <At build={build} at={0} until={1}>
        <motion.div key="maria" style={{ position: 'absolute', inset: 0 }} exit={{ opacity: 0, transition: { duration: 0.6 } }}>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 250, textAlign: 'center' }}>
            <h2 className="display" style={{ fontSize: 112 }}>
              <Words text="María isn’t one person." delay={0.3} />
            </h2>
          </div>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 470, display: 'flex', justifyContent: 'center', gap: 110 }}>
            {NUMBERS.map((n, i) => (
              <motion.div key={n.label} style={{ textAlign: 'center' }} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease, delay: 1.2 + i * 0.45 }}>
                <div className="number" style={{ fontSize: 76, lineHeight: 1, color: i === NUMBERS.length - 1 ? 'var(--coral)' : 'var(--paper)' }}>
                  <Counter to={n.to} duration={1.2} delay={1.2 + i * 0.45} format={n.fmt} />
                </div>
                <div className="display" style={{ fontSize: 26, fontWeight: 600, marginTop: 10, color: 'var(--ink-70)' }}>
                  {n.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </At>

      <At build={build} at={1}>
        <motion.div
          key="end"
          style={{ position: 'absolute', left: 0, right: 0, top: 170, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Logo width={520} delay={0.6} tone="light" />
          <h2 className="display" style={{ fontSize: 62, marginTop: 54, color: 'var(--ink-100)' }}>
            <Words text="VoxWave makes sure you are heard." delay={2.0} wordClass={(w) => (w === 'heard.' ? 'coral' : undefined)} />
          </h2>
          <div style={{ display: 'flex', gap: 84, marginTop: 70 }}>
            {TEAM.map(([n, r], i) => (
              <motion.div key={n} style={{ textAlign: 'center' }} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease, delay: 3.0 + i * 0.15 }}>
                <div className="display" style={{ fontSize: 32, fontWeight: 700, color: C.navy }}>
                  {n}
                </div>
                <div className="mono" style={{ fontSize: 14, marginTop: 8, color: C.teal }}>
                  {r}
                </div>
              </motion.div>
            ))}
          </div>
          <motion.div className="mono" style={{ fontSize: 16, marginTop: 50, letterSpacing: '0.4em', color: C.coral }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 3.8 }}>
            FdiProtocol · Creative Shock 2026
          </motion.div>
        </motion.div>
      </At>
    </div>
  );
}

const coral = (out: Float32Array, n: number) => {
  for (let i = 0; i < n; i++) put(out, i, C.coral, 1);
};

export const S20: SlideDef = {
  id: 'S20',
  builds: 2,
  auto: [6],
  notes:
    "María isn't one person. She is two hundred thousand people in Spain, and twelve million in the world. VoxWave makes sure you are heard. We are FdiProtocol. Thank you.",
  theme: (b) => (b === 1 ? 'light' : 'dark'),
  // María's voice, calm and whole, under the numbers; the page dawns over it at the end.
  wave: () => ({ shape: wave({ y: 790, amp: 40, speed: 0.9 }), paint: coral, opacity: 1, core: 1.6, glow: 1.1, echoes: 0.3, duration: 2600, stagger: 0.3, dir: 1 }),
  bg: () => ({ pool: [0.5, 0.55], poolStrength: 1, warm: 0.8 }),
  Content,
};
