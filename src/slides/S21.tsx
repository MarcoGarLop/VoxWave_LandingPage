import { motion } from 'motion/react';
import { C, EASE } from '../brand/tokens';
import type { SlideDef } from '../deck/types';
import { wave } from '../engine/shapes';
import { Words } from '../ui/motion';

const ease = EASE as unknown as [number, number, number, number];

/**
 * Try it yourself: a QR to the live demo, left on screen for the questions.
 * Enter opens the same link on the presenter's machine.
 */

const URL = 'https://vox-wave-demo.vercel.app/';
const NAVY = C.navy, CORAL = C.coral;

function Content() {
  return (
    <div className="content">
      <div style={{ position: 'absolute', left: 140, top: 300, width: 900 }}>
        <motion.div className="mono" style={{ fontSize: 18, color: CORAL, display: 'flex', alignItems: 'center', gap: 12 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.2 }}>
          <span style={{ width: 10, height: 10, borderRadius: 5, background: CORAL, display: 'inline-block' }} />
          Your turn
        </motion.div>
        <h2 className="display" style={{ fontSize: 120, lineHeight: 1.02, marginTop: 18, color: NAVY }}>
          <Words text="Try it yourself." delay={0.35} wordClass={(w) => (w === 'yourself.' ? 'coral' : undefined)} />
        </h2>
        <motion.div className="display" style={{ fontSize: 34, fontWeight: 600, marginTop: 30, color: 'rgba(9,38,52,0.72)', lineHeight: 1.3 }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease, delay: 1.1 }}>
          Scan the code and see what María’s doctor sees.
        </motion.div>
        <motion.div className="mono" style={{ fontSize: 24, marginTop: 34, color: NAVY, textTransform: 'none', letterSpacing: '0.04em' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 1.5 }}>
          vox-wave-demo.vercel.app
        </motion.div>
      </div>

      <motion.div
        style={{ position: 'absolute', left: 1180, top: 230, width: 600, height: 600, borderRadius: 36, background: '#fffefb', boxShadow: '0 40px 90px rgba(9,38,52,0.16), 0 4px 12px rgba(9,38,52,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.9, ease, delay: 0.6 }}
      >
        <img src="/media/qr_demo.svg" alt="QR code to the VoxWave demo" style={{ width: 480, height: 480, display: 'block', imageRendering: 'pixelated' }} />
      </motion.div>
    </div>
  );
}

export const S21: SlideDef = {
  id: 'S21',
  builds: 1,
  notes:
    "Try it yourself: scan the code and see what María's doctor sees. Thank you.",
  theme: () => 'light',
  link: () => URL,
  wave: () => ({ shape: wave({ y: 540, amp: 30 }), opacity: 0, duration: 1200, stagger: 0 }),
  bg: () => ({ pool: [0.5, 0.5], poolStrength: 1, warm: 0.6 }),
  Content,
};
