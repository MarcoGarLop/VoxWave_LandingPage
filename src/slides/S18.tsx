import * as THREE from 'three';
import { C } from '../brand/tokens';
import type { SlideDef } from '../deck/types';
import { clock } from '../engine/Engine';
import { clamp } from '../engine/math';
import { put } from '../engine/paint';
import type { ParticleTarget } from '../engine/Particles';
import { wave } from '../engine/shapes';
import { At, Counter, Fade, Words } from '../ui/motion';

const ROWS = 44;
const Y0 = 150, Y1 = 930;
const MARIA_Y = 560;

const paper = new THREE.Color(C.paper);
const coral = new THREE.Color(C.coral);

// Shares of the world's 11.8M: Spain 200k, Spanish-speaking 2.3M, world.
const STEPS = [
  { at: 1.0, frac: 0.03 },
  { at: 3.6, frac: 0.2 },
  { at: 6.2, frac: 1 },
];

function crowd(t0: number | null): ParticleTarget {
  return (pos, col, size, n, t) => {
    const per = Math.ceil(n / ROWS);
    const k = t0 === null ? 0 : t - t0;
    let lit = 0;
    for (const s of STEPS) lit = Math.max(lit, s.frac * clamp((k - s.at) / 1.6));
    for (let i = 0; i < n; i++) {
      const r = Math.floor(i / per), j = i % per;
      const y0 = Y0 + (r / (ROWS - 1)) * (Y1 - Y0);
      const near = Math.abs(y0 - MARIA_Y) < 26; // leave María's voice alone
      const x = (j / per) * 2000 - 40 + ((r * 37) % 23);
      const h = Math.sin(i * 12.9898) * 43758.5453;
      const hash = h - Math.floor(h);
      const y = y0 + Math.sin(x * 0.006 + t * 0.55 + r * 0.9) * 10 + Math.sin(x * 0.017 - t * 0.9 + r) * 4;
      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = 0;
      const on = !near && hash < lit;
      const spain = hash < 0.03;
      const c = spain ? coral : paper;
      col[i * 4] = c.r;
      col[i * 4 + 1] = c.g;
      col[i * 4 + 2] = c.b;
      col[i * 4 + 3] = on ? (spain ? 1 : 0.72) : 0;
      size[i] = spain ? 1.5 : 1.05;
    }
  };
}

function Content({ build }: { build: number }) {
  return (
    <div className="content">
      <div className="text-col" style={{ top: 200, width: 1300 }}>
        <h2 className="display" style={{ fontSize: 120 }}>
          <Words text="María isn’t one person." delay={0.5} />
        </h2>
      </div>
      <At build={build} at={1}>
        <div key="nums" style={{ position: 'absolute', left: 120, top: 760, width: 1680, display: 'flex', gap: 90, alignItems: 'flex-end' }}>
          <Fade delay={1}>
            <div className="number coral" style={{ fontSize: 76 }}>
              <Counter to={200000} duration={1.8} delay={1} format={(v) => `${(Math.round(v / 1000) * 1000).toLocaleString('en-US')}+`} />
            </div>
            <div className="mono" style={{ fontSize: 14, marginTop: 8 }}>in Spain</div>
          </Fade>
          <Fade delay={3.6}>
            <div className="number" style={{ fontSize: 76 }}>
              <Counter to={2.3} duration={1.8} delay={3.6} format={(v) => `${v.toFixed(1)}M`} />
            </div>
            <div className="mono" style={{ fontSize: 14, marginTop: 8 }}>Spanish speakers, Madrid to Mexico City to Miami</div>
          </Fade>
          <Fade delay={6.2}>
            <div className="number" style={{ fontSize: 76 }}>
              <Counter to={11.8} duration={1.8} delay={6.2} format={(v) => `${v.toFixed(1)}M`} />
            </div>
            <div className="mono" style={{ fontSize: 14, marginTop: 8 }}>worldwide · an “aah” sounds the same in every language</div>
          </Fade>
        </div>
      </At>
    </div>
  );
}

export const S18: SlideDef = {
  id: 'S18',
  builds: 2,
  auto: [5],
  notes:
    "María isn't one person. She's more than two hundred thousand people in Spain, over two million Spanish speakers from Madrid to Mexico City to Miami, and twelve million people worldwide, because an “aah” sounds the same in every language.",
  // María's voice, alone at first; then thousands of voices appear around it.
  wave: () => ({
    shape: wave({ y: MARIA_Y, amp: 40 }),
    paint: (out, n) => {
      for (let i = 0; i < n; i++) put(out, i, C.coral, 1);
    },
    opacity: 1,
    core: 1.8,
    glow: 1.2,
    echoes: 0.3,
    duration: 3000,
    stagger: 0.3,
    dir: 0,
  }),
  particles: (b) => ({ state: { target: crowd(b === 1 ? clock.t : null), duration: 1200, scatter: 0, size: 2.6, opacity: b === 1 ? 1 : 0 } }),
  bg: () => ({ pool: [0.5, 0.52], poolStrength: 1, warm: 0.9 }),
  Content,
};
