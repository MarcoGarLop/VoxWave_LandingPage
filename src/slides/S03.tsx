import * as THREE from 'three';
import { C } from '../brand/tokens';
import type { SlideDef } from '../deck/types';
import { clock } from '../engine/Engine';
import { clamp } from '../engine/math';
import type { ParticleTarget } from '../engine/Particles';
import { wave } from '../engine/shapes';
import { Fade, Words } from '../ui/motion';

// ---------- Ten people, drawn by the globe's points ----------
const ICON = { w: 112, h: 240 };
const GRID = { x0: 1010, y0: 175, dx: 156, dy: 380, cols: 5 };
const CLEAN = 9; // the one who keeps a clear voice (the last)
const SPACING = 6.4; // dot-matrix pitch, design px

/** Dots of one person pictogram (head, body with arms, two legs), in icon-local px. */
let iconDots: [number, number][] | null = null;
function pictogram() {
  if (iconDots) return iconDots;
  const cv = document.createElement('canvas');
  cv.width = ICON.w;
  cv.height = ICON.h;
  const g = cv.getContext('2d', { willReadFrequently: true })!;
  g.fillStyle = '#fff';
  const rr = (x: number, y: number, w: number, h: number, r: number) => {
    g.beginPath();
    g.roundRect(x, y, w, h, r);
    g.fill();
  };
  g.beginPath();
  g.arc(56, 30, 26, 0, Math.PI * 2);
  g.fill();
  rr(14, 66, 84, 92, 22);
  rr(25, 142, 28, 96, 11);
  rr(59, 142, 28, 96, 11);
  const px = g.getImageData(0, 0, ICON.w, ICON.h).data;
  const pts: [number, number][] = [];
  const rowH = SPACING * 0.866;
  for (let r = 0, y = 2; y < ICON.h; r++, y += rowH)
    for (let x = 2 + (r % 2 ? SPACING / 2 : 0); x < ICON.w; x += SPACING) {
      const o = (Math.round(y) * ICON.w + Math.round(x)) * 4;
      if (px[o] > 127) pts.push([x, y]);
    }
  iconDots = pts;
  return pts;
}

const iconOrigin = (k: number): [number, number] => [GRID.x0 + (k % GRID.cols) * GRID.dx, GRID.y0 + Math.floor(k / GRID.cols) * GRID.dy];

const col = { paper: new THREE.Color(C.paper), coral: new THREE.Color(C.coral), hot: new THREE.Color(C.coralHot) };

/** All ten appear in white; then nine, one after another, take the coral of an affected voice. */
function people(t0: number): ParticleTarget {
  const dots = pictogram();
  const per = dots.length;
  return (pos, colr, size, n, t) => {
    const k = t - t0;
    for (let i = 0; i < n; i++) {
      const slot = i % (per * 10);
      const icon = Math.floor(slot / per);
      const [dx, dy] = dots[slot % per];
      const [ox, oy] = iconOrigin(icon);
      const extra = i >= per * 10; // more particles than dots: they rest hidden in place
      // When does this person change? (left to right, top to bottom)
      const on = icon === CLEAN ? 0 : clamp((k - 2.3 - icon * 0.24) / 0.5);
      // Affected voices tremble, very slightly.
      const tremor = on * 1.2;
      const h = Math.sin(i * 12.9898) * 43758.5453;
      const r = h - Math.floor(h);
      pos[i * 3] = ox + dx + Math.sin(t * 17 + r * 40) * tremor;
      pos[i * 3 + 1] = oy + dy + Math.cos(t * 13 + r * 30) * tremor;
      pos[i * 3 + 2] = 0;
      const c = on > 0.5 ? (r < 0.07 ? col.hot : col.coral) : col.paper;
      const base = icon === CLEAN ? 0.92 : 0.8;
      colr[i * 4] = c.r;
      colr[i * 4 + 1] = c.g;
      colr[i * 4 + 2] = c.b;
      colr[i * 4 + 3] = extra ? 0 : base + 0.2 * on;
      size[i] = 1.25 + 0.15 * on;
    }
  };
}

function Content() {
  return (
    <div className="content">
      <div className="text-col" style={{ top: 230, width: 900 }}>
        <Fade delay={1.2}>
          <div className="display" style={{ fontSize: 48, fontWeight: 600, color: 'var(--ink-70)', marginBottom: 26 }}>
            She’s not alone.
          </div>
        </Fade>
        <Fade delay={2.2}>
          <p className="body" style={{ fontSize: 40, marginBottom: 6 }}>
            Nearly
          </p>
        </Fade>
        <div className="number coral" style={{ fontSize: 190 }}>
          <Words text="9 in 10" delay={2.4} stagger={0.12} />
        </div>
        <h2 className="display" style={{ marginTop: 18, fontSize: 56, lineHeight: 1.1, width: 740 }}>
          <Words text="people with Parkinson’s develop voice changes." delay={4.4} />
        </h2>
        <Fade delay={5.4}>
          <div className="mono" style={{ fontSize: 14, marginTop: 26 }}>
            Logemann et al. · 1978
          </div>
        </Fade>
      </div>
    </div>
  );
}

export const S03: SlideDef = {
  id: 'S03',
  builds: 1,
  notes:
    "And she's not alone: nearly nine in ten people with Parkinson's develop voice changes.",
  // María's voice breaks into points of light that become ten people.
  wave: () => ({ shape: wave({ y: 702, amp: 40 }), opacity: 0, duration: 1600, stagger: 0 }),
  particles: () => ({
    seed: 'wave' as const,
    state: { target: people(clock.t), duration: 2400, scatter: 0.5, size: 3.1 },
  }),
  bg: () => ({ pool: [0.7, 0.5], poolStrength: 1, warm: 0.8 }),
  Content,
};
