import { C, WAVE_Y } from '../brand/tokens';
import type { SlideDef } from '../deck/types';
import { wave } from '../engine/shapes';
import { At, Fade, Marker, Words } from '../ui/motion';

// x where María's last visit sits on the thread, and the matching u (0..1).
const LAST_VISIT_X = 1010;
const X0 = -40;
const X1 = 1960;
const U_VISIT = (LAST_VISIT_X - X0) / (X1 - X0);

function Content({ build }: { build: number }) {
  return (
    <div className="content">
      <div className="text-col" style={{ top: 150, width: 1500 }}>
        <h1 className="display d-120">
          <Words text="Meet María." delay={0.5} />
        </h1>
        <Fade delay={1.2} dim={build >= 1}>
          <div className="display" style={{ fontSize: 52, marginTop: 22, color: 'var(--ink-70)', fontWeight: 600 }}>
            68 · Madrid · Parkinson’s
          </div>
        </Fade>
      </div>

      <At build={build} at={1}>
        <div key="visit" className="text-col" style={{ top: 420, width: 1300 }}>
          <Fade delay={0.2}>
            <div className="display" style={{ fontSize: 44, fontWeight: 600, color: 'var(--ink-70)' }}>
              Her last neurology visit:
            </div>
          </Fade>
          <h2 className="display d-88 coral" style={{ marginTop: 6 }}>
            <Words text="6 months ago." delay={0.5} />
          </h2>
        </div>
      </At>

      <At build={build} at={1}>
        <Marker key="m-visit" x={LAST_VISIT_X} y={WAVE_Y + 60} height={120} label="Last visit" size={24} delay={0.6} />
      </At>
      <At build={build} at={1}>
        <Marker key="m-today" x={1760} y={WAVE_Y + 60} height={120} label="Today" size={24} delay={1.6} color="rgba(241,237,228,0.3)" />
      </At>
    </div>
  );
}

export const S01: SlideDef = {
  id: 'S01',
  builds: 2,
  auto: [4],
  notes:
    "Meet María. She's sixty-eight, she lives in Madrid, and she has Parkinson's. Her last neurology visit was six months ago. Since then, nobody has measured how she is doing.",
  bg: () => ({ poolStrength: 1, warm: 1, pool: [0.64, 0.46] }),
  wave: (b) => {
    if (b === 0) {
      // María's voice: alive, from the very first frame.
      return { shape: wave({ x0: X0, x1: X1, y: WAVE_Y + 60, amp: 52 }), opacity: 1, duration: 2400, stagger: 0, dir: 0 };
    }
    // Since the last visit, the voice keeps going… but nobody is listening.
    return {
      shape: wave({ x0: X0, x1: X1, y: WAVE_Y + 60, amp: 52, quietFrom: U_VISIT, quietSoftness: 0.16, quietLevel: 0.12 }),
      colors: [
        [0, C.coral],
        [U_VISIT - 0.02, C.coral],
        [U_VISIT + 0.16, C.muted, 0.32],
        [1, C.muted, 0.32],
      ],
      duration: 3000,
      stagger: 0.5,
      dir: 1,
    };
  },
  Content,
};
