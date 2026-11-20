import * as THREE from 'three';

const vert = /* glsl */ `
  attribute vec2 normal2;
  attribute float side;
  attribute vec4 tint;      // core colour + intensity
  attribute vec4 tintGlow;  // glow colour + intensity (smoothed along the line)
  attribute float wscale;   // 0..1: geometry narrows on tight bends
  uniform float uHalf;      // half width of the geometry (px)
  varying float vD;         // signed distance from the centre line (px)
  varying vec4 vTint;
  varying vec4 vGlow;
  void main() {
    float h = uHalf * wscale;
    vec3 p = position + vec3(normal2 * side * h, 0.0);
    vD = side * h;
    vTint = tint;
    vGlow = tintGlow;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

// A filament of light: crisp anti-aliased core, white-hot centre, gaussian glow.
const frag = /* glsl */ `
  precision highp float;
  uniform float uCore;      // core half width (px)
  uniform float uGlow;      // glow sigma (px)
  uniform float uGlowAmp;
  uniform float uHot;       // how white the centre burns
  uniform float uOpacity;
  uniform float uPxPerUnit; // screen px per design px (for anti-aliasing)
  varying float vD;
  varying vec4 vTint;
  varying vec4 vGlow;
  void main() {
    float d = abs(vD);
    float aa = 0.9 / uPxPerUnit;
    float core = 1.0 - smoothstep(uCore - aa, uCore + aa, d);
    float dc = d / max(uCore * 0.55, 0.3);
    float centre = exp(-dc * dc);
    float dg = d / uGlow;
    float glow = exp(-dg * dg) * uGlowAmp;
    float a = clamp(vTint.a, 0.0, 1.0) * uOpacity;
    float ag = clamp(vGlow.a, 0.0, 1.0) * uOpacity;
    vec3 col = vTint.rgb * core * a
             + vGlow.rgb * glow * ag
             + vec3(1.0) * centre * uHot * core * a * a;
    gl_FragColor = vec4(min(col, vec3(4.0)), 1.0);
  }
`;

export interface RibbonOptions {
  core: number;
  glow: number;
  glowAmp: number;
  hot: number;
  half: number;
  /** Tangents are averaged over ±smooth points so the glow never fans out on jagged lines. */
  smooth?: number;
  /** Glow colour/intensity averaged over ±glowSmooth points (dashes don't stripe the halo). */
  glowSmooth?: number;
}

/**
 * Screen-facing ribbon along a polyline, shaded as light.
 * Positions are updated in place every frame (no allocations).
 */
export class Ribbon {
  readonly mesh: THREE.Mesh;
  readonly material: THREE.ShaderMaterial;
  private geo = new THREE.BufferGeometry();
  private pos: Float32Array;
  private nrm: Float32Array;
  private tint: Float32Array;
  private tintG: Float32Array;
  // scratch
  private ut: Float32Array;
  private cut: Float32Array;
  private cg: Float32Array;
  private dens: Float32Array;
  private ws: Float32Array;
  private half: number;
  private sm: Float32Array;
  private smooth: number;
  private glowSmooth: number;

  constructor(private n: number, opts: RibbonOptions) {
    this.smooth = opts.smooth ?? 2;
    this.glowSmooth = opts.glowSmooth ?? 6;
    this.pos = new Float32Array(n * 2 * 3);
    this.nrm = new Float32Array(n * 2 * 2);
    this.tint = new Float32Array(n * 2 * 4);
    this.tintG = new Float32Array(n * 2 * 4);
    this.ut = new Float32Array(n * 2);
    this.cut = new Float32Array((n + 1) * 2);
    this.cg = new Float32Array((n + 1) * 4);
    this.dens = new Float32Array(n);
    this.ws = new Float32Array(n * 2).fill(1);
    this.sm = new Float32Array(n * 2);
    this.half = opts.half;
    const side = new Float32Array(n * 2);
    for (let i = 0; i < n; i++) {
      side[i * 2] = -1;
      side[i * 2 + 1] = 1;
    }
    const idx: number[] = [];
    for (let i = 0; i < n - 1; i++) {
      const a = i * 2, b = a + 1, c = a + 2, d = a + 3;
      idx.push(a, b, c, b, d, c);
    }
    this.geo.setIndex(idx);
    this.geo.setAttribute('position', new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage));
    this.geo.setAttribute('normal2', new THREE.BufferAttribute(this.nrm, 2).setUsage(THREE.DynamicDrawUsage));
    this.geo.setAttribute('tint', new THREE.BufferAttribute(this.tint, 4).setUsage(THREE.DynamicDrawUsage));
    this.geo.setAttribute('tintGlow', new THREE.BufferAttribute(this.tintG, 4).setUsage(THREE.DynamicDrawUsage));
    this.geo.setAttribute('side', new THREE.BufferAttribute(side, 1));
    this.geo.setAttribute('wscale', new THREE.BufferAttribute(this.ws, 1).setUsage(THREE.DynamicDrawUsage));

    this.material = new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      uniforms: {
        uHalf: { value: opts.half },
        uCore: { value: opts.core },
        uGlow: { value: opts.glow },
        uGlowAmp: { value: opts.glowAmp },
        uHot: { value: opts.hot },
        uOpacity: { value: 1 },
        uPxPerUnit: { value: 1 },
      },
    });
    this.mesh = new THREE.Mesh(this.geo, this.material);
    this.mesh.frustumCulled = false;
  }

  /**
   * @param xy   world-space points (x, y) * n
   * @param rgbi linear colour + intensity per point * n
   */
  write(xy: Float32Array, rgbi: Float32Array) {
    const n = this.n;
    const { ut, cut, cg, dens } = this;

    // Mean spacing: where points bunch up (mid-morph) overlapping additive quads
    // would blow out, so their light is scaled down by local density.
    let total = 0;
    for (let i = 0; i < n - 1; i++) total += Math.hypot(xy[i * 2 + 2] - xy[i * 2], xy[i * 2 + 3] - xy[i * 2 + 1]);
    const ref = Math.max((total / (n - 1)) * 0.3, 1.2);

    // Unit tangents + density, then prefix sums for O(n) smoothing.
    cut[0] = cut[1] = 0;
    for (let i = 0; i < n; i++) {
      const ip = Math.max(0, i - 1), inx = Math.min(n - 1, i + 1);
      let tx = xy[inx * 2] - xy[ip * 2];
      let ty = xy[inx * 2 + 1] - xy[ip * 2 + 1];
      const len = Math.hypot(tx, ty);
      dens[i] = Math.min(1, len / (inx - ip) / ref);
      if (len < 1e-4) {
        tx = 1;
        ty = 0;
      } else {
        tx /= len;
        ty /= len;
      }
      ut[i * 2] = tx;
      ut[i * 2 + 1] = ty;
      cut[(i + 1) * 2] = cut[i * 2] + tx;
      cut[(i + 1) * 2 + 1] = cut[i * 2 + 1] + ty;
    }
    cg.fill(0, 0, 4);
    for (let i = 0; i < n; i++) {
      const k = rgbi[i * 4 + 3] * dens[i];
      cg[(i + 1) * 4] = cg[i * 4] + rgbi[i * 4] * k;
      cg[(i + 1) * 4 + 1] = cg[i * 4 + 1] + rgbi[i * 4 + 1] * k;
      cg[(i + 1) * 4 + 2] = cg[i * 4 + 2] + rgbi[i * 4 + 2] * k;
      cg[(i + 1) * 4 + 3] = cg[i * 4 + 3] + k;
    }

    const sN = this.smooth, sG = this.glowSmooth;
    for (let i = 0; i < n; i++) {
      const a = Math.max(0, i - sN), b = Math.min(n, i + sN + 1);
      let tx = cut[b * 2] - cut[a * 2];
      let ty = cut[b * 2 + 1] - cut[a * 2 + 1];
      const len = Math.hypot(tx, ty);
      if (len < 1e-4) {
        tx = ut[i * 2];
        ty = ut[i * 2 + 1];
      } else {
        tx /= len;
        ty /= len;
      }
      const ga = Math.max(0, i - sG), gb = Math.min(n, i + sG + 1);
      const gw = cg[gb * 4 + 3] - cg[ga * 4 + 3];
      const cnt = gb - ga;
      const gi = gw / cnt;
      const inv = gw > 1e-6 ? 1 / gw : 0;
      const gr = (cg[gb * 4] - cg[ga * 4]) * inv;
      const gg = (cg[gb * 4 + 1] - cg[ga * 4 + 1]) * inv;
      const gbl = (cg[gb * 4 + 2] - cg[ga * 4 + 2]) * inv;

      this.sm[i * 2] = tx;
      this.sm[i * 2 + 1] = ty;
      const x = xy[i * 2], y = xy[i * 2 + 1];
      for (let s = 0; s < 2; s++) {
        const v = i * 2 + s;
        this.pos[v * 3] = x;
        this.pos[v * 3 + 1] = y;
        this.pos[v * 3 + 2] = 0;
        this.nrm[v * 2] = -ty;
        this.nrm[v * 2 + 1] = tx;
        this.tint[v * 4] = rgbi[i * 4];
        this.tint[v * 4 + 1] = rgbi[i * 4 + 1];
        this.tint[v * 4 + 2] = rgbi[i * 4 + 2];
        this.tint[v * 4 + 3] = rgbi[i * 4 + 3] * dens[i];
        this.tintG[v * 4] = gr;
        this.tintG[v * 4 + 1] = gg;
        this.tintG[v * 4 + 2] = gbl;
        this.tintG[v * 4 + 3] = gi;
      }
    }
    // Radius of curvature from the smoothed tangents → quads never wider than the bend.
    for (let i = 0; i < n; i++) {
      const a = Math.max(0, i - 1), b = Math.min(n - 1, i + 1);
      const dot = this.sm[a * 2] * this.sm[b * 2] + this.sm[a * 2 + 1] * this.sm[b * 2 + 1];
      const ang = Math.acos(Math.max(-1, Math.min(1, dot)));
      const ds = Math.hypot(xy[b * 2] - xy[a * 2], xy[b * 2 + 1] - xy[a * 2 + 1]);
      const R = ang > 1e-4 ? ds / ang : 1e9;
      const w = Math.min(1, Math.max(0.12, (R * 1.3) / this.half));
      this.ws[i * 2] = this.ws[i * 2 + 1] = w;
    }
    // Jumps (e.g. between stacked rows) are breaks in the line: no light across them.
    const jump = Math.max(40, (total / (n - 1)) * 8);
    for (let i = 0; i < n - 1; i++) {
      const L = Math.hypot(xy[i * 2 + 2] - xy[i * 2], xy[i * 2 + 3] - xy[i * 2 + 1]);
      if (L <= jump) continue;
      for (const j of [i, i + 1]) {
        for (let sd = 0; sd < 2; sd++) {
          const v = j * 2 + sd;
          this.tint[v * 4 + 3] = 0;
          this.tintG[v * 4 + 3] = 0;
        }
      }
    }
    const at = this.geo.attributes;
    at.position.needsUpdate = true;
    at.normal2.needsUpdate = true;
    at.tint.needsUpdate = true;
    at.tintGlow.needsUpdate = true;
    at.wscale.needsUpdate = true;
  }
}
