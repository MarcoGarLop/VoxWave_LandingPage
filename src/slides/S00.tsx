import { motion } from 'motion/react';
import type { SlideDef } from '../deck/types';
import { wave } from '../engine/shapes';

/**
 * The cover: black, just our name. Javi waits here until the room is listening,
 * then the first click opens the story.
 */

function Content() {
  return (
    <div className="content">
      <div style={{ position: 'absolute', left: 0, right: 0, top: 440, textAlign: 'center' }}>
        <motion.div
          className="display"
          style={{ fontSize: 104, fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--paper)' }}
          initial={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
        >
          FdiProtocol
        </motion.div>
        <motion.div className="mono" style={{ fontSize: 16, marginTop: 26, color: 'var(--coral)', letterSpacing: '0.4em' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2, delay: 1.6 }}>
          Creative Shock 2026
        </motion.div>
      </div>
    </div>
  );
}

export const S00: SlideDef = {
  id: 'S00',
  builds: 1,
  notes:
    "(Say nothing. Wait until the room is quiet and looking at you, then click.)",
  theme: () => 'black',
  wave: () => ({ shape: wave({ y: 540, amp: 30 }), opacity: 0, duration: 1200, stagger: 0 }),
  bg: () => ({ pool: [0.5, 0.5], poolStrength: 0.4, warm: 0.3 }),
  Content,
};
