import * as THREE from 'three';
import { clamp, easeInOut, toWorldX, toWorldY } from './math';

const vert = /* glsl */ `
  attribute vec4 tint;   // rgb + alpha
  attribute float psize; // design px
  uniform float uScale;  // screen px per design px
  uniform float uSize;
  varying vec4 vTint;
  void main() {
    vTint = tint;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    // Perspective size relative to the z=0 plane (camera distance ~2015).
    float persp = 2015.5 / -mv.z;
    gl_PointSize = max(1.0, psize * uSize * uScale * persp);
    gl_Position = projectionMatrix * mv;
  }
`;

const frag = /* glsl */ `
  precision highp float;
  uniform float uOpacity;
  varying vec4 vTint;
  void main() {
    vec2 p = gl_PointCoord * 2.0 - 1.0;
    float r2 = dot(p, p);
    if (r2 > 1.0) discard;
    float core = exp(-r2 * 5.0);
    float halo = exp(-r2 * 1.6) * 0.35;
    float a = (core + halo) * vTint.a * uOpacity;
    gl_FragColor = vec4(vTint.rgb * a, 1.0);
  }
`;

/**
 * A target writes, for every particle i, its position (design px x, y and
 * depth z towards the viewer), colour+alpha and size. Evaluated every frame
 * so targets can rotate, breathe or pulse.
 */
export type ParticleTarget = (
  pos: Float32Array, // xyz * n
  col: Float32Array, // rgba * n
  size: Float32Array, // n
  n: number,
  t: number,
) => void;

export interface ParticleState {
  target: ParticleTarget;
  duration?: number;
  /** Random per-particle delay range as a fraction of duration (0..1). */
  scatter?: number;
  opacity?: number;
  /** Global size multiplier. */
  size?: number;
  /** Per-particle start order 0..1 (e.g. distance from Madrid). Defaults to random. */
  order?: Float32Array;
}

/**
 * Thousands of points of light that fly between formations
 * (a broken voice line, a globe of dots, rain, a crowd…).
 */
export class Particles {
  readonly points: THREE.Points;
  readonly material: THREE.ShaderMaterial;
  private geo = new THREE.BufferGeometry();
  private n: number;

  private from: Float32Array;
  private cur: Float32Array;
  private tgt: Float32Array;
  private colFrom: Float32Array;
  private colCur: Float32Array;
  private colTgt: Float32Array;
  private sizeFrom: Float32Array;
  private sizeCur: Float32Array;
  private sizeTgt: Float32Array;
  private delay: Float32Array;

  private world: Float32Array;
  private target: ParticleTarget = (p, c) => {
    p.fill(0);
    c.fill(0);
  };
  private start = -1e9;
  private duration = 1;
  private scatter = 0;
  private order: Float32Array | null = null;
  private op = { from: 0, cur: 0, tgt: 0 };
  private sz = { from: 1, cur: 1, tgt: 1 };

  constructor(n: number) {
    this.n = n;
    this.from = new Float32Array(n * 3);
    this.cur = new Float32Array(n * 3);
    this.tgt = new Float32Array(n * 3);
    this.colFrom = new Float32Array(n * 4);
    this.colCur = new Float32Array(n * 4);
    this.colTgt = new Float32Array(n * 4);
    this.sizeFrom = new Float32Array(n).fill(1);
    this.sizeCur = new Float32Array(n).fill(1);
    this.sizeTgt = new Float32Array(n).fill(1);
    this.world = new Float32Array(n * 3);
    // Deterministic pseudo-random delays so every rehearsal looks the same.
    this.delay = new Float32Array(n);
    let s = 1234567;
    for (let i = 0; i < n; i++) {
      s = (s * 16807) % 2147483647;
      this.delay[i] = s / 2147483647;
    }

    this.geo.setAttribute('position', new THREE.BufferAttribute(this.world, 3).setUsage(THREE.DynamicDrawUsage));
    this.geo.setAttribute('tint', new THREE.BufferAttribute(this.colCur, 4).setUsage(THREE.DynamicDrawUsage));
    this.geo.setAttribute('psize', new THREE.BufferAttribute(this.sizeCur, 1).setUsage(THREE.DynamicDrawUsage));
    this.material = new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uScale: { value: 1 }, uSize: { value: 1 }, uOpacity: { value: 0 } },
    });
    this.points = new THREE.Points(this.geo, this.material);
    this.points.frustumCulled = false;
    this.points.renderOrder = 5;
  }

  get count() {
    return this.n;
  }

  setResolution(pxW: number) {
    this.material.uniforms.uScale.value = pxW / 1920;
  }

  /** Place every particle somewhere before a morph starts (e.g. on the wave). */
  seed(fn: (pos: Float32Array, col: Float32Array, n: number) => void) {
    fn(this.cur, this.colCur, this.n);
  }

  to(s: ParticleState, now: number) {
    this.from.set(this.cur);
    this.colFrom.set(this.colCur);
    this.sizeFrom.set(this.sizeCur);
    this.target = s.target;
    this.duration = Math.max(1, s.duration ?? 2600);
    this.scatter = s.scatter ?? 0.35;
    this.order = s.order ?? null;
    this.start = now;
    this.op = { from: this.op.cur, cur: this.op.cur, tgt: s.opacity ?? 1 };
    this.sz = { from: this.sz.cur, cur: this.sz.cur, tgt: s.size ?? 1 };
  }

  update(t: number, now: number) {
    const n = this.n;
    const op = this.op;
    const pAll = clamp((now - this.start) / this.duration);
    const eAll = easeInOut(pAll);
    op.cur = op.from + (op.tgt - op.from) * eAll;
    this.sz.cur = this.sz.from + (this.sz.tgt - this.sz.from) * eAll;
    this.material.uniforms.uOpacity.value = op.cur;
    this.material.uniforms.uSize.value = this.sz.cur;
    this.points.visible = op.cur > 0.003;
    if (!this.points.visible) return;

    this.target(this.tgt, this.colTgt, this.sizeTgt, n, t);
    const span = 1 - this.scatter;
    for (let i = 0; i < n; i++) {
      const d = (this.order ? this.order[i] : this.delay[i]) * this.scatter;
      const w = easeInOut(clamp((pAll - d) / span));
      for (let k = 0; k < 3; k++) {
        const j = i * 3 + k;
        this.cur[j] = this.from[j] + (this.tgt[j] - this.from[j]) * w;
      }
      for (let k = 0; k < 4; k++) {
        const j = i * 4 + k;
        this.colCur[j] = this.colFrom[j] + (this.colTgt[j] - this.colFrom[j]) * w;
      }
      this.sizeCur[i] = this.sizeFrom[i] + (this.sizeTgt[i] - this.sizeFrom[i]) * w;
      this.world[i * 3] = toWorldX(this.cur[i * 3]);
      this.world[i * 3 + 1] = toWorldY(this.cur[i * 3 + 1]);
      this.world[i * 3 + 2] = this.cur[i * 3 + 2];
    }
    this.geo.attributes.position.needsUpdate = true;
    this.geo.attributes.tint.needsUpdate = true;
    this.geo.attributes.psize.needsUpdate = true;
  }
}
