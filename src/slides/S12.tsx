import { motion } from 'motion/react';
import { C, EASE } from '../brand/tokens';
import type { SlideDef } from '../deck/types';
import { paintRows } from '../engine/paint';
import { orbits } from '../engine/shapes';
import { Fade, Words } from '../ui/motion';
import { Pending } from '../ui/Pending';

const ease = EASE as unknown as [number, number, number, number];

const O = { cx: 1170, cy: 600, radii: [120, 230, 340] };
const CT = Math.cos(-0.18), ST = Math.sin(-0.18);
const edge = (r: number) => [O.cx + r * CT, O.cy + r * ST] as const;

const RINGS = [
  { k: 'Who uses it', v: 'People with Parkinson’s, and their caregivers', r: 120, at: [1570, 700] },
  { k: 'Who benefits', v: 'Neurologists see first who needs them · fewer emergencies', r: 230, at: [1570, 520] },
  { k: 'Who pays', v: 'Private clinics, hospital groups and insurers first · then public health (Comunidad de Madrid)', r: 340, at: [1570, 320] },
];

function Content() {
  return (
    <div className="content">
      <div className="text-col" style={{ top: 160, width: 640 }}>
        <div className="mono" style={{ fontSize: 15, color: 'var(--coral)' }}>
          Customers & demand
        </div>
        <h2 className="display d-88" style={{ marginTop: 18 }}>
          <Words text="Who pays, who uses, who benefits." delay={0.4} />
        </h2>
        <Fade delay={1.4}>
          <p className="body" style={{ marginTop: 24 }}>
            What they all lack: neurologist time, and knowing who to see first. In Spain the average wait for a first neurology visit is 111 days.
          </p>
          <p className="body" style={{ marginTop: 18, fontSize: 26 }}>
            Clinical partner: Gregorio Marañón, for validation and the pilot.
          </p>
          <div style={{ marginTop: 26 }}>
            <Pending>[PENDIENTE] Evidence of demand from this weekend: neurology, association, private clinics</Pending>
          </div>
        </Fade>
      </div>

      <motion.div
        style={{ position: 'absolute', left: O.cx, top: O.cy, transform: 'translate(-50%,-50%)', textAlign: 'center' }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease, delay: 1 }}
      >
        <div className="display" style={{ fontSize: 34 }}>
          VoxWave
        </div>
      </motion.div>

      <motion.svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 2.2 }}>
        {RINGS.map((r) => {
          const [ex, ey] = edge(r.r);
          return (
            <g key={r.k}>
              <circle cx={ex} cy={ey} r={5} fill={C.coral} />
              <path d={`M${ex},${ey} L${r.at[0] - 40},${r.at[1] + 10} L${r.at[0] - 12},${r.at[1] + 10}`} stroke="rgba(241,237,228,0.35)" fill="none" />
            </g>
          );
        })}
      </motion.svg>
      {RINGS.map((r, i) => (
        <motion.div
          key={r.k}
          style={{ position: 'absolute', left: r.at[0], top: r.at[1], width: 300 }}
          initial={{ opacity: 0, x: 12, filter: 'blur(6px)' }}
          animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.9, ease, delay: 1.6 + i * 0.45 }}
        >
          <div className="mono" style={{ fontSize: 15, color: 'var(--coral)' }}>
            {r.k}
          </div>
          <div className="body" style={{ fontSize: 21, lineHeight: 1.35, marginTop: 6, color: 'var(--ink-70)' }}>
            {r.v}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export const S12: SlideDef = {
  id: 'S12',
  builds: 1,
  notes:
    'Customers. In Spain we sell to private clinics, hospital groups and health insurers first, because they buy faster. Then to public health, starting with Madrid. Gregorio Marañón is our clinical partner, the one that validates it. What they all lack is neurologist time, and knowing who to see first.',
  wave: () => ({
    // The ring opens into three orbits.
    shape: orbits(O),
    paint: paintRows(3, (r) => [C.coral, [1, 0.75, 0.5][r]]),
    core: 1.3,
    glow: 0.7,
    echoes: 0.2,
    duration: 3400,
    stagger: 0.3,
    dir: 1,
  }),
  bg: () => ({ pool: [0.69, 0.52], poolStrength: 1.05, warm: 0.5 }),
  Content,
};
