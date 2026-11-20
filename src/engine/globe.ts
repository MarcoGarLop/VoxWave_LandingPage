import * as THREE from 'three';
import type { GlobeDot } from './geo';
import type { ParticleTarget } from './Particles';

export interface DotLook {
  color: THREE.Color;
  alpha: number;
  size: number;
}

export interface GlobeOptions {
  /** Centre and radius in design px. */
  cx: number;
  cy: number;
  r: number;
  /** Longitude/latitude (deg) that faces the viewer; can drift with time. */
  lon: (t: number) => number;
  lat: (t: number) => number;
  /** Appearance of each dot (called every frame; keep it cheap). */
  look: (d: GlobeDot, i: number, t: number) => DotLook;
}

const D2R = Math.PI / 180;

/** A rotating globe made of land dots. Back-facing dots fade away. */
export function globeTarget(dots: GlobeDot[], o: GlobeOptions): ParticleTarget {
  return (pos, col, size, n, t) => {
    const yaw = -o.lon(t) * D2R;
    const pitch = o.lat(t) * D2R;
    const cy = Math.cos(yaw), sy = Math.sin(yaw);
    const cp = Math.cos(pitch), sp = Math.sin(pitch);
    for (let i = 0; i < n; i++) {
      const d = dots[i % dots.length];
      // yaw around Y, then pitch around X (positive pitch brings the north towards the viewer).
      const x1 = d.x * cy + d.z * sy;
      const z1 = -d.x * sy + d.z * cy;
      const y2 = d.y * cp - z1 * sp;
      const z2 = d.y * sp + z1 * cp;
      pos[i * 3] = o.cx + x1 * o.r;
      pos[i * 3 + 1] = o.cy - y2 * o.r;
      pos[i * 3 + 2] = z2 * o.r * 0.6;
      const L = o.look(d, i, t);
      // Limb darkening: the far side almost disappears, the rim is soft.
      const facing = Math.min(1, Math.max(0, (z2 + 0.15) / 0.55));
      const vis = 0.06 + 0.94 * facing * facing;
      col[i * 4] = L.color.r;
      col[i * 4 + 1] = L.color.g;
      col[i * 4 + 2] = L.color.b;
      // Particles beyond the dot list (reserved for the Spain map) stay dark here.
      col[i * 4 + 3] = i < dots.length ? L.alpha * vis : 0;
      size[i] = L.size;
    }
  };
}
