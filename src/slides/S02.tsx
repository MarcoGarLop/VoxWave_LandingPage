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
const europe = new Set(ISO.europe);
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

type Phase = 'spain' | 'world' | 'future' | 'europe';

function target(phase: Phase, t0: number): ParticleTarget {
  const v = [0, 0, 0];
  return (pos, colr, size, n, t) => {
    const k = (t - t0); // seconds since this phase began
    const ignite = clamp((k - 0.6) / 2.6); // 2050: the rest of the world lights up
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
        else {
          const today = hash[i] < LIT_TODAY;
          const future = phase !== 'world' && hash[i] < LIT_TODAY + (1 - LIT_TODAY) * (phase === 'future' ? ignite : 1);
          // Europe takes the light; the rest of the world steps back.
          const back = phase === 'europe' ? 1 - 0.55 * clamp((k - 0.2) / 1.4) : 1;
          if (phase === 'europe' && europe.has(d.iso)) {
            const on = clamp((k - 0.2 - (d.lon + 10) * 0.012) / 0.8);
            const pulse = 0.88 + 0.12 * Math.sin(t * 2.4 - d.lon * 0.08);
            (c = col.coral), (a = Math.max(0.55, lit) * pulse * (0.4 + 0.6 * on) + lit * (1 - on) * 0.4), (s = 1.15 + 0.35 * on);
          } else if (today) (c = col.paper), (a = lit * back), (s = 1.15);
          else if (future) (c = col.hot), (a = lit * back), (s = 1.15);
          else (c = col.paper), (a = 0.13 * lit), (s = 0.95);
        }
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

const PHASES: Phase[] = ['spain', 'world', 'future', 'europe'];

function particles(b: number) {
  data();
  const phase = PHASES[b];
  const now = clock.t;
  if (b === 1) spinFrom = now; // the turn starts as the globe forms
  if (b === 0) spinFrom = now + 1e6; // still while Spain is on screen
  return {
    seed: b === 0 ? ('wave' as const) : undefined,
    state: {
      target: target(phase, now),
      duration: b === 0 ? 4200 : b === 1 ? 3800 : 1600,
      scatter: b === 0 ? 0.55 : b === 1 ? 0.6 : 0.2,
      order: b === 1 ? order : undefined,
      size: 3.1,
    },
  };
}

// ---------- The numbers: they arrive one by one and none ever leaves ----------
const FACTS = [
  { label: 'Spain', to: 200000, fmt: (v: number) => `${(Math.round(v / 1000) * 1000).toLocaleString('en-US')}+`, body: 'people living with Parkinson’s', src: 'SEN 2026' },
  { label: 'World, today', to: 11.8, fmt: (v: number) => `${v.toFixed(1)}M`, body: 'people with Parkinson’s', src: 'GBD 2021' },
  { label: 'World, 2050', to: 25.2, fmt: (v: number) => `${v.toFixed(1)}M`, body: 'the fastest-growing neurological disease', src: 'BMJ 2025' },
  { label: 'Europe', to: 28.8, fmt: (v: number) => `€${v.toFixed(1)}B`, body: 'a year, the cost of Parkinson’s', src: 'EAN · Movement Disorders 2026' },
];

function Fact({ i, latest }: { i: number; latest: boolean }) {
  const f = FACTS[i];
  return (
    <motion.div
      style={{ position: 'absolute', left: 120, top: 92 + i * 232, width: 760 }}
      initial={{ opacity: 0, x: -24, filter: 'blur(12px)' }}
      animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, transition: { duration: 0.4 } }}
      transition={{ duration: 1.1, ease }}
    >
      <div className="mono" style={{ fontSize: 15, color: latest ? 'var(--coral)' : undefined, transition: 'color 1.2s' }}>
        {f.label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 22, marginTop: 6 }}>
        <span className="number" style={{ fontSize: 112, lineHeight: 1, color: latest ? 'var(--coral)' : 'var(--paper)', transition: 'color 1.4s' }}>
          <Counter to={f.to} duration={1.9} delay={0.25} format={f.fmt} />
        </span>
      </div>
      <div className="body" style={{ fontSize: 24, marginTop: 10 }}>
        {f.body}
        <span className="mono" style={{ fontSize: 11, marginLeft: 14, opacity: 0.6 }}>
          {f.src}
        </span>
      </div>
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
  builds: 4,
  auto: [4.6, 4.4, 4.4],
  notes:
    'María is one of more than two hundred thousand people with Parkinson’s in Spain. Worldwide, almost twelve million. By 2050, twenty-five million: it is the fastest-growing neurological disease. And in Europe alone it already costs almost twenty-nine billion euros a year.',
  // The voice breaks into the points of light that draw Spain.
  wave: () => ({ shape: wave({ y: 702, amp: 52 }), opacity: 0, duration: 1600, stagger: 0 }),
  particles,
  bg: (b) => ({ pool: [0.71, 0.5], poolStrength: b === 0 ? 0.95 : 1.15, warm: b === 0 ? 0.7 : 0.4 }),
  Content,
};
