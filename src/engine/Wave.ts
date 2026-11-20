import * as THREE from 'three';
import { C } from '../brand/tokens';
import { clamp, easeInOut, toWorldX, toWorldY } from './math';
import { Ribbon } from './Ribbon';
import type { ShapeFn } from './shapes';
import { dot } from './shapes';

/** Colour stops along the thread: [position 0..1, hex, intensity 0..1 (default 1)]. */
export type ColorStops = Array<[number, string] | [number, string, number]>;

export interface WaveState {
  shape: ShapeFn;
  colors?: ColorStops;
  /** Exact per-point paint (overrides `colors`): write linear rgb + intensity for each point. */
  paint?: (out: Float32Array, n: number) => void;
  /** Global opacity of the thread. */
  opacity?: number;
  /** Half width of the bright core, design px. */
  core?: number;
  /** Strength of the glow around the core (0..2). */
  glow?: number;
  /** Opacity of the two echo threads (0..1). */
  echoes?: number;
  /** Optional colours for the two echo threads (default: same paint as the main thread). */
  echoTint?: [string, string];
  /** Opacity of the spark sprite (0..1) and its position. */
  spark?: number;
  sparkAt?: [number, number];
  /** Morph duration, ms. */
  duration?: number;
  /** 0 = all points move together; >0 = the morph sweeps along the thread. */
  stagger?: number;
  /** Sweep direction: 1 left→right, -1 right→left, 0 from the centre out. */
  dir?: 1 | -1 | 0;
  /** Chain another state automatically after `after` ms (inside the same build). */
  then?: { after: number; state: WaveState };
}

export const N = 1040;
const LAYERS = 3; // 0 = main thread, 1..2 = echoes

interface Scalars {
  opacity: number;
  core: number;
  glow: number;
  echoes: number;
  spark: number;
  sparkX: number;
  sparkY: number;
}

const DEFAULTS: Scalars = {
  opacity: 1,
  core: 1.5,
  glow: 1,
  echoes: 0.35,
  spark: 0,
  sparkX: 1180,
  sparkY: 702,
};

function stopsToLinear(stops: ColorStops, out: Float32Array) {
  const cols = stops.map((s) => ({ u: s[0], c: new THREE.Color(s[1]), k: s[2] ?? 1 }));
  for (let i = 0; i < N; i++) {
    const u = i / (N - 1);
    let k = 0;
    while (k < cols.length - 1 && cols[k + 1].u < u) k++;
    const a = cols[k];
    const b = cols[Math.min(k + 1, cols.length - 1)];
    const f = b.u === a.u ? 0 : clamp((u - a.u) / (b.u - a.u));
    const s = f * f * (3 - 2 * f);
    out[i * 4] = a.c.r + (b.c.r - a.c.r) * s;
    out[i * 4 + 1] = a.c.g + (b.c.g - a.c.g) * s;
    out[i * 4 + 2] = a.c.b + (b.c.b - a.c.b) * s;
    out[i * 4 + 3] = a.k + (b.k - a.k) * s;
  }
}

function makeSparkTexture() {
  const s = 256;
  const cv = document.createElement('canvas');
  cv.width = cv.height = s;
  const g = cv.getContext('2d')!;
  const grd = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  grd.addColorStop(0, 'rgba(255,244,236,1)');
  grd.addColorStop(0.05, 'rgba(255,214,196,0.95)');
  grd.addColorStop(0.16, 'rgba(255,120,78,0.5)');
  grd.addColorStop(0.42, 'rgba(255,110,66,0.1)');
  grd.addColorStop(1, 'rgba(255,110,66,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, s, s);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * The protagonist: one luminous thread (core + glow + a wide breath of light)
 * and two faint echoes. It morphs point by point between any two shapes.
 */
export class Wave {
  readonly group = new THREE.Group();

  private main: Ribbon;
  private aura: Ribbon;
  private echoes: Ribbon[];
  private echoTint: THREE.Color[] | null = null;

  private from: Float32Array[] = [];
  private cur: Float32Array[] = [];
  private tgt: Float32Array[] = [];
  private world: Float32Array[] = [];
  private colFrom = new Float32Array(N * 4);
  private colCur = new Float32Array(N * 4);
  private colTgt = new Float32Array(N * 4);
  private colEcho = new Float32Array(N * 4);

  private shape: ShapeFn = dot();
  private scalFrom: Scalars = { ...DEFAULTS };
  private scalCur: Scalars = { ...DEFAULTS };
  private scalTgt: Scalars = { ...DEFAULTS };
  private start = 0;
  private duration = 1;
  private stagger = 0;
  private dir: 1 | -1 | 0 = 1;

  private spark: THREE.Sprite;

  constructor() {
    for (let l = 0; l < LAYERS; l++) {
      this.from.push(new Float32Array(N * 2));
      this.cur.push(new Float32Array(N * 2));
      this.tgt.push(new Float32Array(N * 2));
      this.world.push(new Float32Array(N * 2));
    }

    // Wide, faint breath of light around the thread.
    this.aura = new Ribbon(N, { core: 0, glow: 34, glowAmp: 0.11, hot: 0, half: 110, smooth: 18, glowSmooth: 24 });
    // The thread itself: crisp core, white-hot centre, tight glow.
    this.main = new Ribbon(N, { core: 1.5, glow: 7, glowAmp: 0.42, hot: 0.75, half: 30, smooth: 3, glowSmooth: 8 });
    // Two hairline echoes slightly out of phase.
    this.echoes = [1, 2].map(() => new Ribbon(N, { core: 0.5, glow: 2.5, glowAmp: 0.25, hot: 0, half: 8, smooth: 3, glowSmooth: 3 }));

    this.aura.mesh.renderOrder = 1;
    this.echoes.forEach((e) => (e.mesh.renderOrder = 2));
    this.main.mesh.renderOrder = 3;
    this.group.add(this.aura.mesh, ...this.echoes.map((e) => e.mesh), this.main.mesh);

    this.spark = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: makeSparkTexture(),
        transparent: true,
        depthTest: false,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        opacity: 0,
      }),
    );
    this.spark.renderOrder = 4;
    this.group.add(this.spark);

    stopsToLinear([[0, C.coral], [1, C.coral]], this.colCur);
    this.colFrom.set(this.colCur);
    this.colTgt.set(this.colCur);
  }

  setResolution(pxW: number) {
    const k = pxW / 1920;
    for (const r of [this.main, this.aura, ...this.echoes]) r.material.uniforms.uPxPerUnit.value = k;
  }

  /** Begin a morph from wherever the thread is now to `s`. */
  to(s: WaveState, now: number) {
    for (let l = 0; l < LAYERS; l++) this.from[l].set(this.cur[l]);
    this.colFrom.set(this.colCur);
    this.scalFrom = { ...this.scalCur };

    this.shape = s.shape;
    this.echoTint = s.echoTint ? s.echoTint.map((h) => new THREE.Color(h)) : null;
    if (s.paint) s.paint(this.colTgt, N);
    else stopsToLinear(s.colors ?? [[0, C.coral], [1, C.coral]], this.colTgt);
    this.scalTgt = {
      opacity: s.opacity ?? DEFAULTS.opacity,
      core: s.core ?? DEFAULTS.core,
      glow: s.glow ?? DEFAULTS.glow,
      echoes: s.echoes ?? DEFAULTS.echoes,
      spark: s.spark ?? 0,
      sparkX: s.sparkAt?.[0] ?? this.scalCur.sparkX,
      sparkY: s.sparkAt?.[1] ?? this.scalCur.sparkY,
    };
    this.duration = Math.max(1, s.duration ?? 2200);
    this.stagger = s.stagger ?? 0.35;
    this.dir = s.dir ?? 1;
    this.start = now;
  }

  /** Jump instantly (first mount, deep links). */
  set(s: WaveState, t: number) {
    this.to({ ...s, duration: 1 }, -1e9);
    this.update(t, 0);
  }

  /** Current point positions of the main thread (design px), for other systems. */
  points() {
    return this.cur[0];
  }

  update(t: number, now: number) {
    const p = clamp((now - this.start) / this.duration);
    const s = this.stagger;

    for (let l = 0; l < LAYERS; l++) this.shape(this.tgt[l], N, t, l);

    for (let i = 0; i < N; i++) {
      const u = i / (N - 1);
      const uu = this.dir === 1 ? u : this.dir === -1 ? 1 - u : Math.abs(u - 0.5) * 2;
      const w = easeInOut(clamp(p * (1 + s) - s * uu));
      for (let l = 0; l < LAYERS; l++) {
        const f = this.from[l], c = this.cur[l], g = this.tgt[l], wd = this.world[l];
        c[i * 2] = f[i * 2] + (g[i * 2] - f[i * 2]) * w;
        c[i * 2 + 1] = f[i * 2 + 1] + (g[i * 2 + 1] - f[i * 2 + 1]) * w;
        wd[i * 2] = toWorldX(c[i * 2]);
        wd[i * 2 + 1] = toWorldY(c[i * 2 + 1]);
      }
      for (let k = 0; k < 4; k++) {
        const j = i * 4 + k;
        this.colCur[j] = this.colFrom[j] + (this.colTgt[j] - this.colFrom[j]) * w;
      }
    }

    const e = easeInOut(p);
    const a = this.scalFrom, b = this.scalTgt, c = this.scalCur;
    (Object.keys(c) as (keyof Scalars)[]).forEach((k) => (c[k] = a[k] + (b[k] - a[k]) * e));

    // Main + aura share layer 0.
    this.main.write(this.world[0], this.colCur);
    this.aura.write(this.world[0], this.colCur);
    const mu = this.main.material.uniforms;
    mu.uOpacity.value = c.opacity;
    mu.uCore.value = c.core;
    mu.uGlowAmp.value = 0.42 * c.glow;
    this.aura.material.uniforms.uOpacity.value = c.opacity * c.glow;

    this.echoes.forEach((r, k) => {
      const tint = this.echoTint?.[k];
      for (let i = 0; i < N * 4; i += 4) {
        this.colEcho[i] = tint ? tint.r : this.colCur[i];
        this.colEcho[i + 1] = tint ? tint.g : this.colCur[i + 1];
        this.colEcho[i + 2] = tint ? tint.b : this.colCur[i + 2];
        this.colEcho[i + 3] = this.colCur[i + 3];
      }
      r.write(this.world[k + 1], this.colEcho);
      r.material.uniforms.uOpacity.value = c.opacity * c.echoes;
      r.mesh.visible = c.opacity * c.echoes > 0.003;
    });
    this.main.mesh.visible = c.opacity > 0.003;
    this.aura.mesh.visible = c.opacity * c.glow > 0.003;

    // Spark: a slow breathing glow.
    const sm = this.spark.material as THREE.SpriteMaterial;
    sm.opacity = c.spark * (0.86 + 0.14 * Math.sin(t * 1.6));
    const size = 150 * (0.94 + 0.06 * Math.sin(t * 1.6));
    this.spark.scale.set(size, size, 1);
    this.spark.position.set(toWorldX(c.sparkX), toWorldY(c.sparkY), 1);
    this.spark.visible = sm.opacity > 0.002;
  }
}
