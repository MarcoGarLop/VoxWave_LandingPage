import { C, WAVE_Y } from '../brand/tokens';
import type { SlideDef } from '../deck/types';
import { dot, wave } from '../engine/shapes';
import { At, Fade, Marker, Words } from '../ui/motion';

// x where María's last visit sits on the thread, and the matching u (0..1).
const LAST_VISIT_X = 1010;
const X0 = -40;
const X1 = 1960;
const U_VISIT = (LAST_VISIT_X - X0) / (X1 - X0);

function Content({ build }: { build: number }) {
  return (
    <div className="content">
      <At build={build} at={1}>
        <div key="title" className="text-col" style={{ top: 236 }}>
          <h1 className="display d-120">
            <Words text="Meet María." delay={0.9} />
          </h1>
          <Fade delay={1.5} dim={build >= 2}>
            <div className="mono" style={{ marginTop: 34 }}>
              68 · Madrid · Parkinson’s
            </div>
          </Fade>
        </div>
      </At>

      <At build={build} at={2}>
        <div key="visit" className="text-col" style={{ top: 486 }}>
          <Fade delay={0.2}>
            <p className="body" style={{ marginBottom: 10 }}>
              Last neurology visit
            </p>
          </Fade>
          <h2 className="display d-64 coral" style={{ margin: 0 }}>
            <Words text="6 months ago." delay={0.45} />
          </h2>
        </div>
      </At>

      <At build={build} at={2}>
        <Marker key="m-visit" x={LAST_VISIT_X} y={WAVE_Y} height={120} label="Last visit" delay={0.6} />
      </At>
      <At build={build} at={2}>
        <Marker key="m-today" x={1760} y={WAVE_Y} height={120} label="Today" delay={2.2} color="rgba(241,237,228,0.25)" />
      </At>
    </div>
  );
}

export const S01: SlideDef = {
  id: 'S01',
  builds: 3,
  auto: [4.5, 6],
  notes:
    "Meet María. She's sixty-eight, she lives in Madrid, and she has Parkinson's. Her last neurology visit was six months ago. Since then, nobody has measured how she's doing.",
  bg: (b) => (b === 0 ? { poolStrength: 0.35, warm: 0 } : { poolStrength: 1, warm: 1, pool: [0.64, 0.46] }),
  wave: (b) => {
    if (b === 0) {
      // Before the pitch starts: a single spark breathing in the dark.
      return { shape: dot(1180, WAVE_Y), spark: 1, opacity: 0, duration: 1800 };
    }
    if (b === 1) {
      // The voice is born: the spark stretches out into a living thread.
      return {
        shape: wave({ x0: X0, x1: X1, y: WAVE_Y, amp: 52 }),
        spark: 0,
        opacity: 1,
        duration: 3600,
        stagger: 0,
        dir: 0,
      };
    }
    // Since the last visit, the voice keeps going… but nobody is listening.
    return {
      shape: wave({ x0: X0, x1: X1, y: WAVE_Y, amp: 52, quietFrom: U_VISIT, quietSoftness: 0.16, quietLevel: 0.12 }),
      colors: [
        [0, C.coral],
        [U_VISIT - 0.02, C.coral],
        [U_VISIT + 0.16, C.muted, 0.32],
        [1, C.muted, 0.32],
      ],
      duration: 3600,
      stagger: 0.5,
      dir: 1,
    };
  },
  Content,
};
