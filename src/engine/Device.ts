import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { clamp, easeInOut } from './math';

/**
 * The VoxWave home device, modelled from the team's prototype:
 * 7 x 12 x 4 cm, orange 3D-printed case (lid + base), Raspberry Pi 4,
 * 1.2" screen, one white button, lavalier microphone with a fur windscreen.
 * Units: design px (1 mm ≈ 3.8 px). Local axes: x right, y up, z out of the face.
 */

const MM = 3.8;
const W = 70 * MM, H = 120 * MM, D = 40 * MM;
const LID = 8 * MM;
const FACE = D / 2; // z of the front face

export interface DeviceState {
  /** 0 = assembled, 1 = exploded. */
  explode?: number;
  visible?: number;
  /** Screen shows the prompt. */
  screenOn?: number;
  /** Pose (degrees) and centre (design px). */
  yaw?: number;
  pitch?: number;
  x?: number;
  y?: number;
  scale?: number;
  duration?: number;
}

interface Part {
  obj: THREE.Object3D;
  /** Displacement along local z when exploded (and a little x/y). */
  dz: number;
  dx?: number;
  dy?: number;
  label?: string;
  /** Anchor for the label in part-local coordinates. */
  anchor?: THREE.Vector3;
}

function canvasTex(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, srgb = true) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d')!);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/** Fine print-layer lines (FDM), as a bump map. */
function layerLines(angle: number) {
  const t = canvasTex(
    512,
    512,
    (g) => {
      g.fillStyle = '#808080';
      g.fillRect(0, 0, 512, 512);
      g.translate(256, 256);
      g.rotate(angle);
      for (let i = -400; i < 400; i += 4) {
        g.fillStyle = i % 8 === 0 ? '#9a9a9a' : '#6a6a6a';
        g.fillRect(-400, i, 800, 1.6);
      }
    },
    false,
  );
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

function screenTexture() {
  return canvasTex(512, 312, (g) => {
    g.fillStyle = '#000';
    g.fillRect(0, 0, 512, 312);
    g.fillStyle = '#e8f4ff';
    g.textAlign = 'center';
    g.font = '600 30px "JetBrains Mono", monospace';
    g.fillText('1/3', 256, 78);
    g.font = '700 46px "Sora", sans-serif';
    g.fillText('Hold an “aah”', 256, 168);
    // a little level bar
    g.fillStyle = '#ff6e42';
    g.fillRect(126, 226, 260, 10);
    g.fillStyle = 'rgba(232,244,255,0.25)';
    g.fillRect(126, 246, 260, 2);
  });
}

export class Device {
  readonly group = new THREE.Group();
  private pivot = new THREE.Group();
  private parts: Part[] = [];
  private mats: THREE.Material[] = [];
  private screenMat!: THREE.MeshStandardMaterial;

  private from: Required<Omit<DeviceState, 'duration'>>;
  private cur: Required<Omit<DeviceState, 'duration'>>;
  private tgt: Required<Omit<DeviceState, 'duration'>>;
  private start = -1e9;
  private duration = 1;

  constructor() {
    const base: Required<Omit<DeviceState, 'duration'>> = {
      explode: 0, visible: 0, screenOn: 0, yaw: -30, pitch: 24, x: 1290, y: 520, scale: 1,
    };
    this.from = { ...base };
    this.cur = { ...base };
    this.tgt = { ...base };
    this.group.add(this.pivot);
    this.build();
    this.lights();
    this.group.visible = false;
  }

  private mat<T extends THREE.Material>(m: T): T {
    m.transparent = true;
    this.mats.push(m);
    return m;
  }

  private build() {
    const orange = this.mat(
      new THREE.MeshPhysicalMaterial({
        color: '#ff6b1e',
        roughness: 0.52,
        metalness: 0,
        clearcoat: 0.12,
        clearcoatRoughness: 0.6,
        bumpMap: layerLines(0),
        bumpScale: 0.6,
      }),
    );
    const orangeFace = this.mat(orange.clone() as THREE.MeshPhysicalMaterial);
    (orangeFace as THREE.MeshPhysicalMaterial).bumpMap = layerLines(Math.PI / 4);
    this.mats.push(orangeFace);
    const hole = this.mat(new THREE.MeshStandardMaterial({ color: '#07090b', roughness: 0.9 }));
    const pcb = this.mat(new THREE.MeshStandardMaterial({ color: '#0d4a3a', roughness: 0.55, metalness: 0.1 }));
    const pcbBlue = this.mat(new THREE.MeshStandardMaterial({ color: '#123d73', roughness: 0.5 }));
    const chip = this.mat(new THREE.MeshStandardMaterial({ color: '#111417', roughness: 0.4, metalness: 0.2 }));
    const metal = this.mat(new THREE.MeshStandardMaterial({ color: '#c9ced3', roughness: 0.28, metalness: 0.9 }));
    const gold = this.mat(new THREE.MeshStandardMaterial({ color: '#c8a24a', roughness: 0.35, metalness: 0.8 }));
    const white = this.mat(new THREE.MeshStandardMaterial({ color: '#f2efe9', roughness: 0.35 }));
    const fur = this.mat(new THREE.MeshStandardMaterial({ color: '#2c3136', roughness: 1 }));
    this.screenMat = this.mat(
      new THREE.MeshStandardMaterial({ color: '#020304', roughness: 0.15, metalness: 0.3, emissive: '#ffffff', emissiveMap: screenTexture(), emissiveIntensity: 0 }),
    );

    // ---- Base shell (open box look: rounded block) ----
    const baseD = D - LID;
    const baseMesh = new THREE.Mesh(new RoundedBoxGeometry(W, H, baseD, 6, 22), orange);
    baseMesh.position.z = -D / 2 + baseD / 2;
    const baseG = new THREE.Group();
    baseG.add(baseMesh);
    this.add(baseG, -200, 0, 0, 'Case · 3D-printed', new THREE.Vector3(W / 2, -H * 0.3, -D / 2 + baseD / 2));

    // ---- Raspberry Pi 4 (vertical, 56 x 85 mm) ----
    const pi = new THREE.Group();
    const pw = 56 * MM, ph = 85 * MM;
    const board = new THREE.Mesh(new RoundedBoxGeometry(pw, ph, 1.6 * MM, 2, 3 * MM), pcb);
    pi.add(board);
    const box = (w: number, h: number, d: number, m: THREE.Material, x: number, y: number) => {
      const b = new THREE.Mesh(new THREE.BoxGeometry(w * MM, h * MM, d * MM), m);
      b.position.set(x * MM, y * MM, (0.8 + d / 2) * MM);
      pi.add(b);
      return b;
    };
    box(15, 15, 2.2, metal, -4, 8); // SoC heat spreader
    box(10, 14, 1.2, chip, 12, 8); // RAM
    box(6, 6, 1, chip, 14, -14);
    box(52, 5, 8.5, chip, 0, 39.5).scale.set(1, 1, 1); // GPIO header
    box(50, 2.5, 1.2, gold, 0, 39.5).position.z = 9.6 * MM; // pins
    box(13, 17, 15.5, metal, -18.5, -34); // USB stack
    box(13, 17, 15.5, metal, 0, -34);
    box(16, 21, 13.5, metal, 18.5, -33); // Ethernet
    box(3, 9, 3.2, metal, -26.5, 15); // USB-C / micro-HDMI on the side
    box(3, 7, 3, metal, -26.5, 0);
    box(3, 7, 3, metal, -26.5, -12);
    pi.position.z = -6 * MM;
    this.add(pi, -50, 0, 0, 'Raspberry Pi 4', new THREE.Vector3(pw / 2, ph * 0.1, 8));

    // ---- Lavalier microphone with fur windscreen ----
    const micG = new THREE.Group();
    const ball = new THREE.Mesh(new THREE.IcosahedronGeometry(9 * MM, 3), fur);
    micG.add(ball);
    const hairs: number[] = [];
    let s = 7;
    const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 900; i++) {
      const v = new THREE.Vector3(rnd() * 2 - 1, rnd() * 2 - 1, rnd() * 2 - 1).normalize();
      const r0 = 8.5 * MM, r1 = (11 + rnd() * 4) * MM;
      hairs.push(v.x * r0, v.y * r0, v.z * r0, v.x * r1 + (rnd() - 0.5) * 6, v.y * r1 + (rnd() - 0.5) * 6, v.z * r1);
    }
    const hairGeo = new THREE.BufferGeometry();
    hairGeo.setAttribute('position', new THREE.Float32BufferAttribute(hairs, 3));
    const hairMat = this.mat(new THREE.LineBasicMaterial({ color: '#3d444a' }));
    micG.add(new THREE.LineSegments(hairGeo, hairMat));
    const capsule = new THREE.Mesh(new THREE.CylinderGeometry(2.6 * MM, 2.6 * MM, 12 * MM, 20), chip);
    capsule.position.y = -12 * MM;
    micG.add(capsule);
    const cable = new THREE.Mesh(
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3([
          new THREE.Vector3(0, -18 * MM, 0),
          new THREE.Vector3(6 * MM, -32 * MM, -4 * MM),
          new THREE.Vector3(-8 * MM, -46 * MM, -8 * MM),
          new THREE.Vector3(-4 * MM, -60 * MM, -10 * MM),
        ]),
        40,
        1 * MM,
        8,
      ),
      chip,
    );
    micG.add(cable);
    micG.position.set(0, -5 * MM, 6 * MM);
    this.add(micG, 110, 30, 0, 'Lavalier microphone', new THREE.Vector3(14 * MM, 6 * MM, 0));

    // ---- 1.2" screen module ----
    const oled = new THREE.Group();
    const mod = new THREE.Mesh(new RoundedBoxGeometry(38 * MM, 36 * MM, 1.6 * MM, 2, 2 * MM), pcbBlue);
    oled.add(mod);
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(30 * MM, 18.3 * MM), this.screenMat);
    glass.position.set(0, 2 * MM, 1.4 * MM);
    oled.add(glass);
    const pins = new THREE.Mesh(new THREE.BoxGeometry(14 * MM, 2.5 * MM, 2 * MM), gold);
    pins.position.set(0, 15 * MM, 1.5 * MM);
    oled.add(pins);
    oled.position.set(0, 25 * MM, FACE - LID - 2 * MM);
    this.add(oled, 250, 0, 0, '1.2″ screen', new THREE.Vector3(-19 * MM, 6 * MM, 0));

    // ---- Lid with all its features ----
    const lid = new THREE.Group();
    const lidMesh = new THREE.Mesh(new RoundedBoxGeometry(W, H, LID, 6, 20), orangeFace);
    lid.add(lidMesh);
    const zf = LID / 2 + 0.6;
    const disc = (r: number, x: number, y: number) => {
      const m = new THREE.Mesh(new THREE.CircleGeometry(r, 28), hole);
      m.position.set(x, y, zf);
      lid.add(m);
    };
    const rr = (w: number, h: number, r: number, x: number, y: number, m: THREE.Material = hole) => {
      const shp = new THREE.Shape();
      const x0 = -w / 2, y0 = -h / 2;
      shp.moveTo(x0 + r, y0);
      shp.lineTo(x0 + w - r, y0);
      shp.quadraticCurveTo(x0 + w, y0, x0 + w, y0 + r);
      shp.lineTo(x0 + w, y0 + h - r);
      shp.quadraticCurveTo(x0 + w, y0 + h, x0 + w - r, y0 + h);
      shp.lineTo(x0 + r, y0 + h);
      shp.quadraticCurveTo(x0, y0 + h, x0, y0 + h - r);
      shp.lineTo(x0, y0 + r);
      shp.quadraticCurveTo(x0, y0, x0 + r, y0);
      const mm = new THREE.Mesh(new THREE.ShapeGeometry(shp), m);
      mm.position.set(x, y, zf);
      lid.add(mm);
    };
    // screws
    for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) disc(2.6 * MM, sx * 28.5 * MM, sy * 53.5 * MM);
    // vents
    for (let i = 0; i < 6; i++) rr(2.8 * MM, 10 * MM, 1.2 * MM, (i - 2.5) * 5.6 * MM, 45 * MM);
    // screen window (see-through dark glass frame)
    rr(31 * MM, 19.5 * MM, 1 * MM, 0, 27 * MM);
    const winGlass = new THREE.Mesh(new THREE.PlaneGeometry(29.5 * MM, 18 * MM), this.screenMat);
    winGlass.position.set(0, 27 * MM, zf + 0.3);
    lid.add(winGlass);
    // LED / sensor hole
    disc(2.2 * MM, 24 * MM, 23 * MM);
    // microphone grille (hex dots)
    const gr = 1.2 * MM;
    for (let q = -2; q <= 2; q++) {
      for (let r = -2; r <= 2; r++) {
        if (Math.abs(q + r) > 2) continue;
        const x = (q + r / 2) * 3.6 * MM;
        const y = r * 3.1 * MM;
        disc(gr, x, y - 5 * MM);
      }
    }
    // button hole
    rr(12.5 * MM, 12.5 * MM, 1 * MM, 0, -37 * MM);
    lid.position.z = FACE - LID / 2;
    this.add(lid, 390, 0, 0, 'Case · lid', new THREE.Vector3(-W / 2, H * 0.35, LID / 2));

    // ---- The button (white cap + switch) ----
    const btn = new THREE.Group();
    const sw = new THREE.Mesh(new THREE.BoxGeometry(12 * MM, 12 * MM, 7 * MM), chip);
    btn.add(sw);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(5 * MM, 5.2 * MM, 6 * MM, 40), white);
    cap.rotation.x = Math.PI / 2;
    cap.position.z = 6 * MM;
    btn.add(cap);
    btn.position.set(0, -37 * MM, FACE - 4 * MM);
    this.add(btn, 540, 0, 0, 'One button', new THREE.Vector3(6 * MM, 0, 8 * MM));
  }

  private add(obj: THREE.Object3D, dz: number, dx: number, dy: number, label?: string, anchor?: THREE.Vector3) {
    obj.userData.base = obj.position.clone();
    this.pivot.add(obj);
    this.parts.push({ obj, dz, dx, dy, label, anchor });
  }

  private lights() {
    const hemi = new THREE.HemisphereLight('#b9d4e6', '#0a1820', 0.9);
    const key = new THREE.DirectionalLight('#fff6ec', 2.4);
    key.position.set(-500, 900, 900);
    const rim = new THREE.DirectionalLight('#ff6e42', 3.2);
    rim.position.set(700, 300, -600);
    const fill = new THREE.DirectionalLight('#7fb7d9', 0.7);
    fill.position.set(600, -400, 700);
    this.group.add(hemi, key, rim, fill);
  }

  to(s: DeviceState, now: number) {
    this.from = { ...this.cur };
    this.tgt = {
      explode: s.explode ?? this.cur.explode,
      visible: s.visible ?? 1,
      screenOn: s.screenOn ?? this.cur.screenOn,
      yaw: s.yaw ?? this.cur.yaw,
      pitch: s.pitch ?? this.cur.pitch,
      x: s.x ?? this.cur.x,
      y: s.y ?? this.cur.y,
      scale: s.scale ?? this.cur.scale,
    };
    this.duration = Math.max(1, s.duration ?? 2800);
    this.start = now;
  }

  hide(now: number) {
    this.to({ visible: 0, duration: 900 }, now);
  }

  update(t: number, now: number) {
    const e = easeInOut(clamp((now - this.start) / this.duration));
    const c = this.cur, a = this.from, b = this.tgt;
    (Object.keys(c) as (keyof typeof c)[]).forEach((k) => (c[k] = a[k] + (b[k] - a[k]) * e));
    this.group.visible = c.visible > 0.003;
    if (!this.group.visible) return;
    for (const m of this.mats) m.opacity = c.visible;
    this.screenMat.emissiveIntensity = c.screenOn * (0.9 + 0.1 * Math.sin(t * 3));

    // Slow, living camera-like drift.
    const yaw = THREE.MathUtils.degToRad(c.yaw + Math.sin(t * 0.21) * 4);
    const pitch = THREE.MathUtils.degToRad(c.pitch + Math.sin(t * 0.17 + 1) * 2);
    this.pivot.rotation.set(pitch, yaw, 0, 'YXZ');
    this.pivot.updateMatrix();
    this.group.position.set(c.x - 960, 540 - c.y, 0);
    this.group.scale.setScalar(c.scale);

    // Exploded view: each part slides out along the device's own z axis, in sequence.
    const n = this.parts.length;
    this.parts.forEach((p, i) => {
      const order = i / (n - 1);
      const k = easeInOut(clamp(c.explode * 1.35 - order * 0.35));
      const base = p.obj.userData.base as THREE.Vector3;
      p.obj.position.set(base.x + (p.dx ?? 0) * k, base.y + (p.dy ?? 0) * k, base.z + p.dz * k);
    });
  }

  /** Label anchors projected to design px (for the DOM layer). */
  anchors(camera: THREE.Camera): { label: string; x: number; y: number; k: number }[] {
    const out: { label: string; x: number; y: number; k: number }[] = [];
    if (!this.group.visible) return out;
    this.group.updateMatrixWorld(true);
    const v = new THREE.Vector3();
    for (const p of this.parts) {
      if (!p.label || !p.anchor) continue;
      v.copy(p.anchor).applyMatrix4(p.obj.matrixWorld).project(camera);
      out.push({ label: p.label, x: (v.x * 0.5 + 0.5) * 1920, y: (1 - (v.y * 0.5 + 0.5)) * 1080, k: this.cur.explode * this.cur.visible });
    }
    return out;
  }
}
