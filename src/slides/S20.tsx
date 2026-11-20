import { motion } from 'motion/react';
import { C, EASE } from '../brand/tokens';
import { Logo } from '../brand/Logo';
import type { SlideDef } from '../deck/types';
import { put } from '../engine/paint';
import { heartbeat } from '../engine/shapes';
import { At, Fade, Words } from '../ui/motion';

const ease = EASE as unknown as [number, number, number, number];

const TEAM = [
  ['Martin', 'Voice AI & ML'],
  ['Marco', 'Product & finance'],
  ['Victor', 'Marketing & go-to-market'],
  ['Javier', 'Hardware'],
];

function Content({ build }: { build: number }) {
  return (
    <div className="content">
      <At build={build} at={0} until={1}>
        <div key="q" style={{ position: 'absolute', left: 0, right: 0, top: 330, textAlign: 'center' }}>
          <Fade delay={0.4}>
            <p className="body" style={{ fontSize: 36 }}>
              VoxWave makes sure someone is listening.
            </p>
          </Fade>
          <h2 className="display" style={{ fontSize: 90, marginTop: 26, padding: '0 120px' }}>
            <Words text="What if the answer was there all along?" delay={1.4} wordClass={(w) => (w === 'along?' ? 'shimmer' : undefined)} />
          </h2>
        </div>
      </At>

      <At build={build} at={1}>
        <motion.div key="end" style={{ position: 'absolute', left: 0, right: 0, top: 210, display: 'flex', flexDirection: 'column', alignItems: 'center' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
          <Logo width={560} delay={0.3} />
          <Fade delay={2.4}>
            <div className="mono" style={{ fontSize: 18, marginTop: 36, color: 'var(--paper)', letterSpacing: '0.4em' }}>
              FdiProtocol
            </div>
          </Fade>
          <div style={{ display: 'flex', gap: 80, marginTop: 40 }}>
            {TEAM.map(([n, r], i) => (
              <motion.div key={n} style={{ textAlign: 'center' }} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease, delay: 2.8 + i * 0.18 }}>
                <div className="display" style={{ fontSize: 34 }}>
                  {n}
                </div>
                <div className="mono" style={{ fontSize: 13, marginTop: 8 }}>
                  {r}
                </div>
              </motion.div>
            ))}
          </div>
          <Fade delay={4}>
            <div className="mono" style={{ fontSize: 14, marginTop: 54, color: 'var(--coral)' }}>
              We measure. Doctors decide.
            </div>
          </Fade>
        </motion.div>
      </At>
    </div>
  );
}

export const S20: SlideDef = {
  id: 'S20',
  builds: 2,
  auto: [6],
  notes: 'VoxWave makes sure someone is listening. What if the answer was there all along? We’re FdiProtocol. Thank you.',
  // The two voices converge into one flat line with a heartbeat.
  wave: (b) => ({
    shape: heartbeat({ y: b === 0 ? 760 : 960, amp: b === 0 ? 80 : 40, period: 4.6 }),
    paint: (out, n) => {
      for (let i = 0; i < n; i++) put(out, i, C.coral, 1);
    },
    opacity: b === 0 ? 1 : 0.6,
    core: 1.6,
    glow: 1,
    echoes: 0.2,
    duration: 3200,
    stagger: 0.35,
    dir: 1,
  }),
  bg: (b) => ({ pool: [0.5, b === 0 ? 0.55 : 0.42], poolStrength: b === 0 ? 0.9 : 1.1, warm: 0.8 }),
  Content,
};
