import * as THREE from 'three';
import { C, WAVE_Y } from '../brand/tokens';
import type { SlideDef } from '../deck/types';
import { clock } from '../engine/Engine';
import { globeDots, spainDots } from '../engine/geo';
import { clamp } from '../engine/math';
import type { ParticleTarget } from '../engine/Particles';
import { wave } from '../engine/shapes';
import { At, Fade, Words } from '../ui/motion';

/**
 * Meet María — one of the dots on the calendar. The year collapses into a single
 * line: her voice. Build 1: lately it has changed — the recent stretch (right) goes
 * quieter, flatter and slower, while the left keeps how it used to sound.
 */

const X0 = -40;
const X1 = 1960;
const Y = WAVE_Y + 60;

// The calendar's dots (Spain's first 365 map dots) fly into the line and dissolve.
const MAP_BOX: [[number, number], [number, number]] = [[1010, 140], [1790, 930]];
let G = 0;
const coral = new THREE.Color(C.coral);

function intoLine(t0: number): ParticleTarget {
  return (pos, colr, size, n, t) => {
    const k = t - t0;
    for (let i = 0; i < n; i++) {
      const m = i - G;
      const day = m >= 0 && m < 365;
      if (day) {
        const u = m / 364;
        pos[i * 3] = X0 + (X1 - X0) * u;
        pos[i * 3 + 1] = Y + Math.sin(u * 9.7 + t * 1.2) * 18;
        pos[i * 3 + 2] = 0;
      }
      colr[i * 4] = coral.r;
      colr[i * 4 + 1] = coral.g;
      colr[i * 4 + 2] = coral.b;
      colr[i * 4 + 3] = day ? 0.8 * (1 - clamp((k - 0.9) / 1.1)) : 0;
      size[i] = 2.4;
    }
  };
}

function particles(b: number) {
  if (b > 0) return null;
  if (!G) {
    G = globeDots().length;
    spainDots(MAP_BOX); // cached; keeps the index layout shared with the globe
  }
  return { state: { target: intoLine(clock.t), duration: 1500, scatter: 0.3, size: 3.4 } };
}

function Content({ build }: { build: number }) {
  return (
    <div className="content">
      <div className="text-col" style={{ top: 130, width: 1500 }}>
        <Fade delay={0.3}>
          <div className="mono" style={{ fontSize: 18, color: 'var(--coral)' }}>
            One of them
          </div>
        </Fade>
        <h1 className="display d-120" style={{ marginTop: 14 }}>
          <Words text="Meet María." delay={0.6} />
        </h1>
        <Fade delay={1.3} dim={build >= 1}>
          <div className="display" style={{ fontSize: 52, marginTop: 22, color: 'var(--ink-70)', fontWeight: 600 }}>
            68 · Madrid · Parkinson’s
          </div>
        </Fade>
      </div>

      <At build={build} at={1}>
        <div key="voice" className="text-col" style={{ top: 470, width: 1500 }}>
          <Fade delay={0.2}>
            <div className="display" style={{ fontSize: 44, fontWeight: 600, color: 'var(--ink-70)' }}>
              Lately, her voice has changed:
            </div>
          </Fade>
          <h2 className="display d-88 coral" style={{ marginTop: 6 }}>
            <Words text="softer, flatter, slower." delay={0.7} />
          </h2>
        </div>
      </At>
    </div>
  );
}

export const S01: SlideDef = {
  id: 'S01',
  builds: 2,
  auto: [4],
  notes:
    "María is one of them. She's sixty-eight and lives in Madrid. Lately, her voice has changed: it's softer, flatter, slower. Her family hears it every day. Her neurologist won't hear it for months.",
  bg: () => ({ poolStrength: 1, warm: 1, pool: [0.64, 0.46] }),
  particles,
  wave: (b) => {
    if (b === 0) {
      // María's voice, out of the dots of the year.
      return { shape: wave({ x0: X0, x1: X1, y: Y, amp: 52 }), opacity: 1, duration: 2200, stagger: 0.2, dir: 0 };
    }
    // Lately: the recent stretch goes quiet, flat and slow.
    return {
      shape: wave({ x0: X0, x1: X1, y: Y, amp: 52, speed: 0.55, quietFrom: 0.42, quietSoftness: 0.3, quietLevel: 0.22 }),
      colors: [
        [0, C.coral],
        [0.4, C.coral],
        [0.8, C.coralSoft, 0.55],
        [1, C.coralSoft, 0.45],
      ],
      duration: 3000,
      stagger: 0.5,
      dir: 1,
    };
  },
  Content,
};
