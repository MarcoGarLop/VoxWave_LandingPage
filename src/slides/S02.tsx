import { motion } from 'motion/react';
import * as THREE from 'three';
import { C, EASE } from '../brand/tokens';
import type { SlideDef } from '../deck/types';
import { clock } from '../engine/Engine';
import { ISO, MADRID, globeDots, latLonToVec, spainDots, type GlobeDot, type MapDot } from '../engine/geo';
import { clamp } from '../engine/math';
import type { ParticleTarget } from '../engine/Particles';
import { wave } from '../engine/shapes';
import { At, Counter } from '../ui/motion';

const ease = EASE as unknown as [number, number, number, number];

// ---------- Stage ----------
const GLOBE = { cx: 1360, cy: 540, r: 390 };
const MAP_BOX: [[number, number], [number, number]] = [[1010, 140], [1790, 930]];
const TILT = 32; // latitude facing the viewer
const SPIN = 3.4; // degrees per second, never stops
const LIT_TODAY = 11.8 / 25.2; // share of dots lit today vs 2050

// Light comes from the upper left, slightly in front: the visible face glows.
const LIGHT = new THREE.Vector3(-0.5, 0.42, 0.76).normalize();

// ---------- Data, computed once ----------
let G = 0;
let dots: GlobeDot[] = [];
let map: MapDot[] = [];
let hash: Float32Array;
let order: Float32Array;
const spain = new Set(ISO.spain);
function data() {
  if (map.length) return;
  dots = globeDots();
  G = dots.length;
  map = spainDots(MAP_BOX);
  const n = G + map.length;
  hash = new Float32Array(n);
  order = new Float32Array(n);
  const m = latLonToVec(MADRID.lat, MADRID.lon);
  for (let i = 0; i < n; i++) {
    const h = Math.sin(i * 12.9898) * 43758.5453;
    hash[i] = h - Math.floor(h);
    if (i < G) {
      const d = dots[i];
      const ang = Math.acos(clamp(d.x * m[0] + d.y * m[1] + d.z * m[2], -1, 1)) / Math.PI;
      order[i] = 0.25 + 0.75 * ang; // the light spreads out from Spain
    } else order[i] = hash[i] * 0.2; // the map lands first
  }
}

// The globe keeps turning across builds: one clock for the whole slide.
let spinFrom = 0;
// Starts over the Atlantic (Spain on the right, the Americas on the left) and turns east,
// so Europe is facing us when its number lands.
const lonAt = (t: number) => -40 + SPIN * Math.max(0, t - spinFrom);

const col = {
  paper: new THREE.Color(C.paper),
  coral: new THREE.Color(C.coral),
  soft: new THREE.Color(C.coralSoft),
  hot: new THREE.Color(C.coralHot),
};

/** Rotate a unit vector to the view; returns [x, y, z] (z towards the viewer). */
function view(x: number, y: number, z: number, t: number, out: number[]) {
  const yaw = (-lonAt(t) * Math.PI) / 180, pitch = (TILT * Math.PI) / 180;
  const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
  const x1 = x * cy + z * sy;
  const z1 = -x * sy + z * cy;
  out[0] = x1;
  out[1] = y * cp - z1 * sp;
  out[2] = y * sp + z1 * cp;
}

type Phase = 'world' | 'spain';

function target(phase: Phase): ParticleTarget {
  const v = [0, 0, 0];
  return (pos, colr, size, n, t) => {
    for (let i = 0; i < n; i++) {
      let c = col.paper, a = 0, s = 1;
      if (i < G) {
        const d = dots[i];
        view(d.x, d.y, d.z, t, v);
        pos[i * 3] = GLOBE.cx + v[0] * GLOBE.r;
        pos[i * 3 + 1] = GLOBE.cy - v[1] * GLOBE.r;
        pos[i * 3 + 2] = v[2] * GLOBE.r * 0.6;
        // Lit face: Lambert against the light, plus a soft rim; the far side fades out.
        const lam = Math.max(0, v[0] * LIGHT.x + v[1] * LIGHT.y + v[2] * LIGHT.z);
        const facing = clamp((v[2] + 0.12) / 0.5);
        const lit = (0.42 + 0.58 * Math.pow(lam, 0.8)) * facing;
        if (phase === 'spain') a = 0;
        else if (spain.has(d.iso)) (c = col.coral), (a = lit), (s = 1.3);
        else if (hash[i] < LIT_TODAY) {
          // One lit dot ≈ people living with Parkinson's; they twinkle softly.
          const tw = 0.85 + 0.15 * Math.sin(t * 1.6 + hash[i] * 40);
          (c = hash[i] < LIT_TODAY * 0.35 ? col.soft : col.paper), (a = lit * tw), (s = 1.2);
        } else (c = col.paper), (a = 0.13 * lit), (s = 0.95);
      } else {
        const m = map[i - G];
        if (!m) {
          a = 0;
        } else if (phase === 'spain') {
          // The flat map: a dot matrix that breathes, lit from the top left.
          pos[i * 3] = m.x;
          pos[i * 3 + 1] = m.y + Math.sin(t * 1.2 + m.x * 0.012) * 1.5;
          pos[i * 3 + 2] = 0;
          const glow = 0.78 + 0.22 * Math.sin(t * 0.9 - (m.x + m.y) * 0.006);
          (c = hash[i] < 0.06 ? col.hot : col.coral), (a = glow), (s = 1.6);
        } else {
          // Spain shrinks into its place on the turning globe.
          view(m.vx, m.vy, m.vz, t, v);
          pos[i * 3] = GLOBE.cx + v[0] * GLOBE.r;
          pos[i * 3 + 1] = GLOBE.cy - v[1] * GLOBE.r;
          pos[i * 3 + 2] = v[2] * GLOBE.r * 0.6;
          const facing = clamp((v[2] + 0.12) / 0.5);
          (c = col.coral), (a = 0.22 * facing * facing), (s = 0.75);
        }
        if (i - G >= map.length) a = 0;
      }
      colr[i * 4] = c.r;
      colr[i * 4 + 1] = c.g;
      colr[i * 4 + 2] = c.b;
      colr[i * 4 + 3] = a;
      size[i] = s;
    }
  };
}

const PHASES: Phase[] = ['world', 'spain'];

/** A faint cloud of dots around where the globe will be. */
function starfield(pos: Float32Array, colr: Float32Array, n: number) {
  for (let i = 0; i < n; i++) {
    const h1 = Math.sin(i * 78.233) * 43758.5453, h2 = Math.sin(i * 39.425) * 24634.6345;
    const a = (h1 - Math.floor(h1)) * Math.PI * 2;
    const r = 260 + Math.sqrt(h2 - Math.floor(h2)) * 900;
    pos[i * 3] = GLOBE.cx + Math.cos(a) * r;
    pos[i * 3 + 1] = GLOBE.cy + Math.sin(a) * r * 0.62;
    pos[i * 3 + 2] = 0;
    colr[i * 4] = colr[i * 4 + 1] = colr[i * 4 + 2] = 1;
    colr[i * 4 + 3] = 0;
  }
}

function particles(b: number) {
  data();
  const phase = PHASES[b];
  const now = clock.t;
  if (b === 0) spinFrom = now; // the globe turns as it forms, and never stops
  return {
    // The deck opens on a dark sky: the dots gather out of it into the planet.
    seed: b === 0 ? starfield : undefined,
    state: {
      target: target(phase),
      duration: b === 0 ? 4000 : 2800,
      scatter: b === 0 ? 0.6 : 0.45,
      order: b === 0 ? order : undefined,
      size: 3.1,
    },
  };
}

// ---------- The numbers: they arrive one by one and none ever leaves ----------
const FACTS = [
  { label: 'The world', to: 11.8, fmt: (v: number) => `${v.toFixed(1)}M`, body: 'people live with Parkinson’s', sub: 'The fastest-growing neurological disease', src: 'GBD 2021' },
  { label: 'Spain', to: 200000, fmt: (v: number) => `${(Math.round(v / 1000) * 1000).toLocaleString('en-US')}+`, body: 'of them live in Spain', sub: '', src: 'SEN 2026' },
];

function Fact({ i, latest }: { i: number; latest: boolean }) {
  const f = FACTS[i];
  return (
    <motion.div
      style={{ position: 'absolute', left: 120, top: 150 + i * 360, width: 820 }}
      initial={{ opacity: 0, x: -24, filter: 'blur(12px)' }}
      animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, transition: { duration: 0.4 } }}
      transition={{ duration: 1.1, ease }}
    >
      <div className="display" style={{ fontSize: 44, fontWeight: 700, letterSpacing: '0.02em', color: latest ? 'var(--coral)' : 'var(--ink-70)', transition: 'color 1.2s' }}>
        {f.label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 22, marginTop: 6 }}>
        <span className="number" style={{ fontSize: 136, lineHeight: 1, color: latest ? 'var(--coral)' : 'var(--paper)', transition: 'color 1.4s' }}>
          <Counter to={f.to} duration={1.9} delay={0.25} format={f.fmt} />
        </span>
      </div>
      <div className="display" style={{ fontSize: 34, fontWeight: 600, marginTop: 12 }}>
        {f.body}
        <span className="mono" style={{ fontSize: 11, marginLeft: 14, opacity: 0.6 }}>
          {f.src}
        </span>
      </div>
      {f.sub && (
        <div className="body" style={{ fontSize: 24, marginTop: 12, color: 'var(--ink-70)' }}>
          {f.sub}
        </div>
      )}
    </motion.div>
  );
}

function Content({ build }: { build: number }) {
  return (
    <div className="content">
      {FACTS.map((_, i) => (
        <At key={i} build={build} at={i}>
          <Fact key={`f${i}`} i={i} latest={i === build} />
        </At>
      ))}
    </div>
  );
}

export const S02: SlideDef = {
  id: 'S02',
  builds: 2,
  auto: [5.2],
  notes:
    "Twelve million. That's how many people in the world live with Parkinson's today. It is the fastest-growing neurological disease on the planet. More than two hundred thousand of them live here, in Spain.",
  // The deck opens in the dark: the planet, then Spain.
  wave: () => ({ shape: wave({ y: 702, amp: 52 }), opacity: 0, duration: 1600, stagger: 0 }),
  particles,
  bg: (b) => ({ pool: [0.71, 0.5], poolStrength: b === 0 ? 0.95 : 1.15, warm: b === 0 ? 0.7 : 0.4 }),
  Content,
};
