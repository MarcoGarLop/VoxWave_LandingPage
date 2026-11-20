import * as THREE from 'three';
import { motion } from 'motion/react';
import { C, EASE } from '../brand/tokens';
import type { SlideDef } from '../deck/types';
import { clock } from '../engine/Engine';
import { ISO, MADRID, globeDots, latLonToVec } from '../engine/geo';
import { globeTarget, type DotLook } from '../engine/globe';
import { clamp, easeInOut } from '../engine/math';
import { put } from '../engine/paint';
import { wave } from '../engine/shapes';
import { At, Counter, Fade } from '../ui/motion';

const ease = EASE as unknown as [number, number, number, number];

const GLOBE = { cx: 1340, cy: 500, r: 340 };
const cam = { lon: MADRID.lon, lat: 32 };
function aim(toLon: number, toLat: number, dur = 3.6, drift = 0) {
  const fromLon = cam.lon, fromLat = cam.lat, t0 = clock.t;
  return {
    lon: (t: number) => (cam.lon = fromLon + (toLon - fromLon) * easeInOut(clamp((t - t0) / dur)) + drift * Math.max(0, t - t0 - dur * 0.5)),
    lat: (t: number) => (cam.lat = fromLat + (toLat - fromLat) * easeInOut(clamp((t - t0) / dur))),
  };
}

let fromMadrid: Float32Array | null = null;
function order() {
  if (fromMadrid) return fromMadrid;
  const dots = globeDots();
  const m = latLonToVec(MADRID.lat, MADRID.lon);
  fromMadrid = new Float32Array(dots.length);
  dots.forEach((d, i) => (fromMadrid![i] = Math.acos(Math.max(-1, Math.min(1, d.x * m[0] + d.y * m[1] + d.z * m[2]))) / Math.PI));
  return fromMadrid;
}

const paper = new THREE.Color(C.paper);
const coral = new THREE.Color(C.coral);
const look: DotLook = { color: paper, alpha: 1, size: 1 };
const set = (c: THREE.Color, a: number, s: number) => ((look.color = c), (look.alpha = a), (look.size = s), look);
const spain = new Set(ISO.spain);
const spanish = new Set([...ISO.spain, ...ISO.latam]);
const usa = new Set(ISO.usa);

function particles(b: number) {
  const dots = globeDots();
  const base = { cx: GLOBE.cx, cy: GLOBE.cy, r: GLOBE.r };
  if (b === 0) {
    cam.lon = MADRID.lon - 25;
    cam.lat = 22;
    return {
      seed: 'wave' as const,
      state: {
        duration: 4200,
        scatter: 0.6,
        size: 3,
        target: globeTarget(dots, { ...base, ...aim(MADRID.lon, 34, 5, 0.4), look: (d) => (spain.has(d.iso) ? set(coral, 1, 2) : set(paper, 0.32, 1)) }),
      },
    };
  }
  if (b === 1) {
    return {
      state: {
        duration: 3400,
        scatter: 0.8,
        order: order(),
        size: 3,
        target: globeTarget(dots, {
          ...base,
          ...aim(-48, 16, 4.2, 0.6),
          // the Spanish-speaking world; the US Hispanic community glows softer
          look: (d) => (spanish.has(d.iso) ? set(coral, 1, 1.6) : usa.has(d.iso) ? set(coral, 0.55, 1.2) : set(paper, 0.28, 1)),
        }),
      },
    };
  }
  return {
    state: {
      duration: 3400,
      scatter: 0.85,
      order: order(),
      size: 3,
      target: globeTarget(dots, { ...base, ...aim(-20, 18, 4, 1.6), look: (d) => (spanish.has(d.iso) ? set(coral, 1, 1.5) : set(paper, 0.9, 1.05)) }),
    },
  };
}

function Row({ top, label, dim, value, body }: { top: number; label: string; dim: boolean; value: React.ReactNode; body: string }) {
  return (
    <div className="text-col" style={{ top }}>
      <Fade dim={dim} delay={0.2}>
        <div className="mono" style={{ fontSize: 15 }}>
          {label}
        </div>
      </Fade>
      <Fade dim={dim} delay={0.35} y={20}>
        <div className="number" style={{ fontSize: 100, marginTop: 6 }}>
          {value}
        </div>
      </Fade>
      <Fade dim={dim} delay={0.7}>
        <p className="body" style={{ fontSize: 24, marginTop: 6 }}>
          {body}
        </p>
      </Fade>
    </div>
  );
}

function Content({ build }: { build: number }) {
  return (
    <div className="content">
      <Fade delay={0.2} style={{ position: 'absolute', left: 120, top: 100 }}>
        <div className="mono" style={{ fontSize: 15, color: 'var(--coral)' }}>
          Growth & barriers
        </div>
      </Fade>
      <At build={build} at={0}>
        <Row key="som" top={160} label="SOM · Spain, year 3" dim={build >= 1} value={<Counter to={1000} duration={2} delay={0.8} format={(v) => Math.round(v).toLocaleString('en-US')} />} body="patients · ≈ €480k revenue a year · starting in Madrid" />
      </At>
      <At build={build} at={1}>
        <Row key="sam" top={410} label="SAM · the Spanish-speaking world" dim={build >= 2} value={<><Counter to={2.3} duration={2} delay={0.8} format={(v) => v.toFixed(1)} />M</>} body="patients · ≈ €1.1B a year · one Spanish model reaches 20+ countries" />
      </At>
      <At build={build} at={2}>
        <Row key="tam" top={660} label="TAM · the world" dim={false} value={<><Counter to={11.8} duration={2} delay={0.8} format={(v) => v.toFixed(1)} />M</>} body="patients today, 25.2M by 2050 · ≈ €5.7B a year · an “aah” sounds the same in every language" />
      </At>

      <At build={build} at={1}>
        <motion.div
          key="us"
          className="glass glass-lite"
          style={{ position: 'absolute', left: 1330, top: 870, width: 470, padding: '18px 24px' }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease, delay: 2.2 }}
        >
          <div className="mono" style={{ fontSize: 12, color: 'var(--coral)' }}>
            The US Hispanic community
          </div>
          <div className="body" style={{ fontSize: 17, lineHeight: 1.45, marginTop: 8, color: 'var(--ink-70)' }}>
            Highest Parkinson’s incidence (16.6 vs 13.6 per 100k) · ≈ 5% reach a movement-disorder specialist (≈ 10% of white patients) · 40% of Medicare patients saw no neurologist in 2019
          </div>
        </motion.div>
      </At>
    </div>
  );
}

export const S16: SlideDef = {
  id: 'S16',
  builds: 3,
  auto: [7, 7],
  notes:
    "Growth. Our first market is Spain. Our serviceable market is the Spanish-speaking world: over two million patients, a billion-euro market a year, including the US Hispanic community, which has the highest incidence of Parkinson's in the US and half the access to specialists. And our horizon is the whole world: twelve million patients.",
  wave: () => ({
    shape: wave({ y: 702, amp: 40 }),
    paint: (out, n) => {
      for (let i = 0; i < n; i++) put(out, i, C.coral, 1);
    },
    opacity: 0,
    duration: 1600,
    stagger: 0,
  }),
  particles,
  bg: (b) => ({ pool: [0.7, 0.47], poolStrength: b === 2 ? 1.15 : 1.05, warm: 0.4 }),
  Content,
};
