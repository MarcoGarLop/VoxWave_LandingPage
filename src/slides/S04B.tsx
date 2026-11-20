import { motion } from 'motion/react';
import { C, EASE } from '../brand/tokens';
import { Logo } from '../brand/Logo';
import type { SlideDef } from '../deck/types';
import { put } from '../engine/paint';
import { dot, wave } from '../engine/shapes';
import { At, Words } from '../ui/motion';

const ease = EASE as unknown as [number, number, number, number];

// Where the voice gathers into a point of light, and where the dawn opens from.
const CORE: [number, number] = [960, 605];

function Content({ build }: { build: number }) {
  return (
    <div className="content">
      <div style={{ position: 'absolute', left: 0, right: 0, top: build < 2 ? 340 : 250, textAlign: 'center', transition: 'top 1.6s cubic-bezier(.22,1,.36,1)' }}>
        <h2 className="display" style={{ fontSize: 76 }}>
          <Words text="This is why we created" delay={0.3} />
        </h2>
      </div>

      <At build={build} at={2}>
        <motion.div
          key="logo"
          style={{ position: 'absolute', left: 0, right: 0, top: 400, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease, delay: 0.7 }}
        >
          <Logo width={620} delay={0.9} tone="light" />
          <motion.div
            className="mono"
            style={{ fontSize: 16, marginTop: 46, letterSpacing: '0.32em', color: 'var(--ink-60)' }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease, delay: 3.2 }}
          >
            Every day · three minutes · someone is listening
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
  builds: 3,
  // The voice charges up, gathers into one point, then the page dawns.
  auto: [3.0, 1.5],
  notes: 'This is why we created VoxWave.',
  theme: (b) => (b === 2 ? 'light' : 'dark'),
  wave: (b) => {
    if (b === 0)
      return {
        // Three voices braided together, the energy building at the centre.
        shape: wave({ y: CORE[1], amp: 96, speed: 1.7 }),
        paint: coral,
        echoTint: [C.paper, C.tealBright],
        core: 1.7,
        glow: 1.25,
        echoes: 0.95,
        opacity: 1,
        duration: 2600,
        stagger: 0.25,
        dir: 0,
      };
    return {
      // Everything gathers into one point of light; the dawn opens from it.
      shape: dot(CORE[0], CORE[1]),
      paint: coral,
      echoTint: [C.paper, C.tealBright],
      core: 1.8,
      glow: 1.4,
      echoes: 0.6,
      spark: 1,
      sparkAt: CORE,
      opacity: 1,
      duration: 1300,
      stagger: 0.12,
      dir: 0,
    };
  },
  bg: (b) => ({ pool: [0.5, 0.56], poolStrength: b === 0 ? 0.9 : 1.3, warm: 1 }),
  Content,
};
