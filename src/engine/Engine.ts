import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { Background, type BackgroundState } from './Background';
import { Wave, type WaveState } from './Wave';
import { Particles, type ParticleState } from './Particles';
import { globeDots, SPAIN_DOTS } from './geo';
import { Device, type DeviceState } from './Device';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

/** Seconds since the engine started; read by slides to time things inside a build. */
export const clock = { t: 0 };

const FOV = 30;

/**
 * One WebGL canvas that lives for the whole pitch. Slides never own WebGL:
 * they only send target states, and the engine morphs towards them.
 */
/** Global tempo: every morph, flight and fade runs at this fraction of its written duration. */
export const PACE = 0.78;
function paceWave(s: WaveState): WaveState {
  return {
    ...s,
    duration: s.duration !== undefined ? s.duration * PACE : undefined,
    then: s.then ? { after: s.then.after * PACE, state: paceWave(s.then.state) } : undefined,
  };
}

export class Engine {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly camera: THREE.PerspectiveCamera;
  readonly background = new Background();
  readonly wave = new Wave();
  readonly particles: Particles;
  readonly device = new Device();

  private composer: EffectComposer;
  private bloom: UnrealBloomPass;
  private clock = new THREE.Clock();
  private raf = 0;
  private running = false;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: false,
      powerPreference: 'high-performance',
      stencil: false,
    });
    this.renderer.setPixelRatio(1);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.NoToneMapping;

    // Camera placed so that the z=0 plane maps exactly onto the 1920x1080 design space.
    this.camera = new THREE.PerspectiveCamera(FOV, 16 / 9, 10, 20000);
    this.camera.position.set(0, 0, 540 / Math.tan(THREE.MathUtils.degToRad(FOV / 2)));
    this.camera.lookAt(0, 0, 0);

    this.scene.add(this.wave.group);
    this.particles = new Particles(globeDots().length + SPAIN_DOTS);
    this.scene.add(this.particles.points);
    this.scene.add(this.device.group);
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environmentIntensity = 0.35;

    const rt = new THREE.WebGLRenderTarget(1920, 1080, {
      type: THREE.HalfFloatType,
      samples: 4,
    });
    this.composer = new EffectComposer(this.renderer, rt);
    const bgPass = new RenderPass(this.background.scene, this.background.camera);
    const mainPass = new RenderPass(this.scene, this.camera);
    mainPass.clear = false;
    this.bloom = new UnrealBloomPass(new THREE.Vector2(1920, 1080), 0.32, 0.35, 0.55);
    this.composer.addPass(bgPass);
    this.composer.addPass(mainPass);
    this.composer.addPass(this.bloom);
    this.composer.addPass(new OutputPass());
  }

  /** Size of the drawing buffer in device pixels (the canvas is CSS-scaled with the stage). */
  resize(pxW: number, pxH: number) {
    this.renderer.setSize(pxW, pxH, false);
    this.composer.setSize(pxW, pxH);
    this.bloom.resolution.set(pxW, pxH);
    this.wave.setResolution(pxW);
    this.particles.setResolution(pxW);
  }

  now() {
    return performance.now();
  }

  private waveTimer = 0;

  setWave(raw: WaveState, instant = false) {
    const s = paceWave(raw);
    clearTimeout(this.waveTimer);
    if (instant) this.wave.set(s, this.clock.getElapsedTime());
    else this.wave.to(s, this.now());
    if (s.then) {
      const nxt = s.then;
      this.waveTimer = window.setTimeout(() => this.setWave(nxt.state, instant), instant ? 0 : nxt.after);
    }
  }

  /**
   * Send the particles to a new formation. With seed 'wave', every particle is
   * first placed on the living thread so the voice appears to shatter.
   */
  setParticles(
    s: ParticleState | null,
    opts: { seed?: 'wave' | ((pos: Float32Array, col: Float32Array, n: number) => void); instant?: boolean } = {},
  ) {
    if (!s) {
      this.particles.to({ target: (p, c, z, n, t) => this.holdTarget(p, c, z, n, t), opacity: 0, duration: 1400, scatter: 0 }, this.now());
      return;
    }
    s = { ...s, duration: (s.duration ?? 2000) * PACE };
    if (opts.seed === 'wave') this.seedFromWave();
    else if (typeof opts.seed === 'function') this.particles.seed(opts.seed);
    this.particles.to(opts.instant ? { ...s, duration: 1 } : s, opts.instant ? -1e9 : this.now());
  }

  /** Keep particles where they are (used while fading them out). */
  private holdTarget: import('./Particles').ParticleTarget = () => {};

  private seedFromWave() {
    const pts = this.wave.points();
    const m = pts.length / 2;
    let s = 987654321;
    const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    this.particles.seed((pos, col, n) => {
      for (let i = 0; i < n; i++) {
        const u = rnd() * (m - 1);
        const k = Math.floor(u), f = u - k;
        const k2 = Math.min(m - 1, k + 1);
        pos[i * 3] = pts[k * 2] + (pts[k2 * 2] - pts[k * 2]) * f + (rnd() - 0.5) * 4;
        pos[i * 3 + 1] = pts[k * 2 + 1] + (pts[k2 * 2 + 1] - pts[k * 2 + 1]) * f + (rnd() - 0.5) * 4;
        pos[i * 3 + 2] = 0;
        col[i * 4] = 1;
        col[i * 4 + 1] = 0.16;
        col[i * 4 + 2] = 0.05;
        col[i * 4 + 3] = 1;
      }
    });
  }

  setDevice(s: DeviceState | null, instant = false) {
    const now = instant ? -1e9 : this.now();
    if (s) this.device.to(instant ? { ...s, duration: 1 } : s, now);
    else this.device.hide(now);
  }

  setBackground(s: BackgroundState) {
    this.background.to(s.duration ? { ...s, duration: s.duration * PACE } : s, this.now());
  }

  /**
   * Compile every shader up front (behind the boot screen), including the ones for
   * things that are hidden now — the device, the globe, the echoes — so the first
   * time they appear mid-pitch there is no stall.
   */
  async warm() {
    const hidden: THREE.Object3D[] = [];
    const show = (root: THREE.Object3D) =>
      root.traverse((o) => {
        if (!o.visible) {
          hidden.push(o);
          o.visible = true;
        }
      });
    show(this.scene);
    show(this.background.scene);
    try {
      await this.renderer.compileAsync(this.scene, this.camera);
      await this.renderer.compileAsync(this.background.scene, this.background.camera);
    } catch {
      /* fall back to compiling on first use */
    }
    show(this.scene); // the render loop may have hidden things again meanwhile
    this.composer.render(); // links the programs and the post-processing passes
    for (const o of hidden) o.visible = false;
  }

  /** True while a fullscreen video hides the canvas. */
  suspended = false;

  start() {
    if (this.running) return;
    this.running = true;
    const loop = () => {
      if (!this.running) return;
      this.raf = requestAnimationFrame(loop);
      // A fullscreen clip covers everything: give the GPU to the video decoder.
      if (this.suspended) return;
      const t = this.clock.getElapsedTime();
      clock.t = t;
      const now = this.now();
      this.background.update(t, now);
      this.wave.update(t, now);
      this.particles.update(t, now);
      this.device.update(t, now);
      this.composer.render();
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  dispose() {
    this.stop();
    this.renderer.dispose();
  }
}
