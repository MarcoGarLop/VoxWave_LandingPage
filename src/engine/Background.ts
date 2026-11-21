import * as THREE from 'three';
import { C } from '../brand/tokens';
import { clamp, easeInOut } from './math';

const vert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

// Abyss base, a soft pool of navy light, slow volumetric haze and
// (optionally) a Kling atmosphere video screened on top.
const frag = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec3 uAbyss;
  uniform vec3 uNavy;
  uniform vec3 uCoral;
  uniform vec2 uPool;
  uniform float uPoolStrength;
  uniform float uWarm;
  uniform sampler2D uVideo;
  uniform sampler2D uVideo2;
  uniform float uVideoBlend;
  uniform float uVideoMix;
  uniform float uVideoRaw; // 1 = texture holds raw sRGB values (video), decode here

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x),
               mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    vec2 asp = vec2(16.0 / 9.0, 1.0);
    vec2 d = (uv - uPool) * asp;
    float pool = exp(-dot(d, d) * 1.6) * uPoolStrength;

    // Slow haze, drifting sideways like smoke in a dark studio.
    vec2 q = uv * asp * 1.6;
    float t = uTime * 0.018;
    float h = fbm(q + vec2(t, -t * 0.4) + fbm(q * 0.7 - vec2(t * 0.6, 0.0)));

    vec3 col = uAbyss;
    col = mix(col, uNavy * 1.35, pool);
    col += uNavy * (h - 0.45) * 0.55 * (0.35 + pool);
    // A breath of warmth near the horizon line where the voice lives.
    float hy = (uv.y - 0.35) * 5.5;
    float horizon = exp(-hy * hy) * pool;
    col += uCoral * 0.035 * horizon * uWarm;

    // Kling atmosphere (screen blend keeps the darks, lifts the haze).
    vec3 vid = mix(texture2D(uVideo, uv).rgb, texture2D(uVideo2, uv).rgb, uVideoBlend);
    vid = mix(vid, pow(max(vid, vec3(0.0)), vec3(2.2)), uVideoRaw);
    vec3 screened = 1.0 - (1.0 - col) * (1.0 - vid);
    col = mix(col, screened, uVideoMix);

    // Dither to kill banding in the deep gradients.
    col += (hash(gl_FragCoord.xy + fract(uTime)) - 0.5) / 255.0;
    gl_FragColor = vec4(col, 1.0);
  }
`;

export interface BackgroundState {
  pool?: [number, number];
  /** Strength of the Kling atmosphere layer (0..1, default 1). */
  atmo?: number;
  poolStrength?: number;
  warm?: number;
  duration?: number;
}

export class Background {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private mat: THREE.ShaderMaterial;
  /** Two copies of the loop, cross-faded at the seam so the loop never pops. */
  private vids: { el: HTMLVideoElement; tex: THREE.VideoTexture }[] = [];
  private active = 0;
  private hasVideo = false;
  private videoTarget = 0;
  private atmo = { from: 1, cur: 1, tgt: 1 };
  static readonly SEAM = 1.4;
  private fade = 0;

  private from = { px: 0.62, py: 0.48, s: 1, w: 1 };
  private cur = { ...this.from };
  private tgt = { ...this.from };
  private start = 0;
  private duration = 1;

  constructor() {
    const blank = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1);
    blank.needsUpdate = true;
    this.mat = new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uAbyss: { value: new THREE.Color(C.abyss) },
        uNavy: { value: new THREE.Color(C.navy) },
        uCoral: { value: new THREE.Color(C.coral) },
        uPool: { value: new THREE.Vector2(0.62, 0.48) },
        uPoolStrength: { value: 1 },
        uWarm: { value: 1 },
        uVideo: { value: blank },
        uVideo2: { value: blank },
        uVideoBlend: { value: 0 },
        uVideoMix: { value: 0 },
        uVideoRaw: { value: 0 },
      },
    });
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.mat);
    quad.frustumCulled = false;
    this.scene.add(quad);
  }

  /**
   * Atmosphere layer: a looping Kling video if present, otherwise its still
   * plate, otherwise the procedural haze alone. Never breaks if files are missing.
   */
  loadAtmosphere(videoUrl: string, stillUrl: string, mix = 0.6) {
    const make = () => {
      const el = document.createElement('video');
      el.src = videoUrl;
      el.muted = true;
      el.loop = false;
      el.playsInline = true;
      el.preload = 'auto';
      // Uploaded as-is (no GPU sRGB decode for video); the shader decodes it.
      const tex = new THREE.VideoTexture(el);
      tex.colorSpace = THREE.NoColorSpace;
      return { el, tex };
    };
    const a = make();
    a.el.addEventListener(
      'canplay',
      () => {
        if (this.hasVideo) return;
        this.hasVideo = true;
        this.vids = [a, make()];
        this.mat.uniforms.uVideo.value = a.tex;
        this.mat.uniforms.uVideo2.value = this.vids[1].tex;
        this.mat.uniforms.uVideoRaw.value = 1;
        this.videoTarget = mix;
        a.el.play().catch(() => {});
      },
      { once: true },
    );
    a.el.addEventListener('error', () => {
      new THREE.TextureLoader().load(
        stillUrl,
        (tex) => {
          if (this.hasVideo) return;
          tex.colorSpace = THREE.SRGBColorSpace;
          this.mat.uniforms.uVideo.value = tex;
          this.videoTarget = mix;
        },
        undefined,
        () => {},
      );
    });
  }

  /**
   * While a fullscreen clip plays, the atmosphere clips stop decoding (one decoder less in
   * use). On resume the active copy restarts if it ran out, so the haze never freezes.
   */
  setPaused(paused: boolean) {
    if (!this.hasVideo) return;
    if (paused) {
      for (const v of this.vids) v.el.pause();
      return;
    }
    const cur = this.vids[this.active];
    if (cur.el.ended || (cur.el.duration && cur.el.currentTime >= cur.el.duration - 0.05)) cur.el.currentTime = 0;
    cur.el.play().catch(() => {});
  }

  /** Cross-fade the two loop copies around the seam. */
  private tickVideo() {
    if (!this.hasVideo) return;
    const u = this.mat.uniforms;
    const cur = this.vids[this.active];
    const nxt = this.vids[1 - this.active];
    const dur = cur.el.duration;
    if (!dur || !isFinite(dur)) return;
    const left = dur - cur.el.currentTime;
    if (left < Background.SEAM && nxt.el.paused) {
      nxt.el.currentTime = 0;
      nxt.el.play().catch(() => {});
    }
    const k = clamp(1 - left / Background.SEAM);
    const blend = k * k * (3 - 2 * k);
    // uVideo always shows vids[0], uVideo2 vids[1].
    u.uVideoBlend.value = this.active === 0 ? blend : 1 - blend;
    if (cur.el.ended || left <= 0.02) {
      cur.el.pause();
      this.active = 1 - this.active;
      u.uVideoBlend.value = this.active === 0 ? 0 : 1;
    }
  }

  to(s: BackgroundState, now: number) {
    this.from = { ...this.cur };
    this.tgt = {
      px: s.pool?.[0] ?? this.cur.px,
      py: s.pool?.[1] ?? this.cur.py,
      s: s.poolStrength ?? this.cur.s,
      w: s.warm ?? this.cur.w,
    };
    this.atmo.from = this.atmo.cur;
    this.atmo.tgt = s.atmo ?? this.atmo.tgt;
    this.start = now;
    this.duration = Math.max(1, s.duration ?? 2600);
  }

  update(t: number, now: number) {
    const e = easeInOut(clamp((now - this.start) / this.duration));
    const a = this.from, b = this.tgt, c = this.cur;
    c.px = a.px + (b.px - a.px) * e;
    c.py = a.py + (b.py - a.py) * e;
    c.s = a.s + (b.s - a.s) * e;
    c.w = a.w + (b.w - a.w) * e;
    this.atmo.cur = this.atmo.from + (this.atmo.tgt - this.atmo.from) * e;
    this.tickVideo();
    const u = this.mat.uniforms;
    u.uTime.value = t;
    u.uPool.value.set(c.px, c.py);
    u.uPoolStrength.value = c.s;
    u.uWarm.value = c.w;
    // Fade the video in gently once it is ready.
    this.fade += (this.videoTarget - this.fade) * 0.02;
    u.uVideoMix.value = this.fade * this.atmo.cur;
  }
}
