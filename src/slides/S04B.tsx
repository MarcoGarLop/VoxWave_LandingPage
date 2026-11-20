import { motion } from 'motion/react';
import { C, EASE } from '../brand/tokens';
import { Logo } from '../brand/Logo';
import type { SlideDef } from '../deck/types';
import { put } from '../engine/paint';
import { wave } from '../engine/shapes';
import { At } from '../ui/motion';

const ease = EASE as unknown as [number, number, number, number];

// The braided voice runs through here; the dawn opens from the centre.
const CORE: [number, number] = [960, 605];

function Content({ build }: { build: number }) {
  return (
    <div className="content">
      <At build={build} at={1}>
        <motion.div
          key="logo"
          style={{ position: 'absolute', left: 0, right: 0, top: 300, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, ease, delay: 0.5 }}
        >
          <Logo width={620} delay={0.7} tone="light" />
          <motion.div
            className="display"
            style={{ fontSize: 34, marginTop: 50, fontWeight: 500, color: 'var(--ink-70)' }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease, delay: 2.6 }}
          >
            VoxWave makes sure you are heard.
          </motion.div>
        </motion.div>
      </At>
    </div>
  );
}

const coral = (out: Float32Array, n: number) => {
  for (let i = 0; i < n; i++) put(out, i, C.coral, 1);
};

export const S04B: SlideDef = {
  id: 'S04B',
  builds: 2,
  // The voice charges up across the whole width; then the page dawns over it.
  auto: [3.0],
  notes:
    "This is VoxWave.",
  theme: (b) => (b === 1 ? 'light' : 'dark'),
  wave: (b) => ({
    // Three voices braided together, the energy building — never squeezed into a point.
    shape: wave({ y: CORE[1], amp: b === 0 ? 96 : 120, speed: b === 0 ? 1.7 : 2.2 }),
    paint: coral,
    echoTint: [C.paper, C.tealBright],
    core: b === 0 ? 1.7 : 2,
    glow: b === 0 ? 1.25 : 1.6,
    echoes: 0.95,
    opacity: 1,
    duration: 2400,
    stagger: 0.25,
    dir: 0,
  }),
  bg: (b) => ({ pool: [0.5, 0.56], poolStrength: b === 0 ? 0.9 : 1.3, warm: 1 }),
  Content,
};
