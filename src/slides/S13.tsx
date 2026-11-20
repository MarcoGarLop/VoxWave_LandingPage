import { motion } from 'motion/react';
import { C, EASE } from '../brand/tokens';
import type { SlideDef } from '../deck/types';
import { put } from '../engine/paint';
import { path } from '../engine/shapes';
import { At, Counter, Fade, Words } from '../ui/motion';
import { Pending } from '../ui/Pending';

const ease = EASE as unknown as [number, number, number, number];

const PIV = { x: 1340, y: 400 };
const ARM = 290, DROP = 170, PAN = 110;

function balance(tilt: number): [number, number][] {
  const L = { x: PIV.x - ARM, y: PIV.y + tilt };
  const R = { x: PIV.x + ARM, y: PIV.y - tilt };
  const pan = (cx: number, cy: number, rev = false) => {
    const pts: [number, number][] = [];
    for (let i = 0; i <= 16; i++) {
      const a = Math.PI * (rev ? 1 - i / 16 : i / 16);
      pts.push([cx - Math.cos(a) * PAN, cy + Math.sin(a) * 34]);
    }
    return pts;
  };
  const lp = { x: L.x, y: L.y + DROP }, rp = { x: R.x, y: R.y + DROP };
  return [
    ...pan(lp.x, lp.y),
    [lp.x + PAN, lp.y],
    [L.x, L.y],
    [lp.x - PAN, lp.y],
    [L.x, L.y],
    [PIV.x, PIV.y],
    [PIV.x, PIV.y + 420],
    [PIV.x - 90, PIV.y + 420],
    [PIV.x + 90, PIV.y + 420],
    [PIV.x, PIV.y + 420],
    [PIV.x, PIV.y],
    [R.x, R.y],
    [rp.x - PAN, rp.y],
    [R.x, R.y],
    [rp.x + PAN, rp.y],
    ...pan(rp.x, rp.y, true),
  ];
}

function PanLabel({ side, tilt, children }: { side: -1 | 1; tilt: number; children: React.ReactNode }) {
  const x = PIV.x + side * ARM;
  const y = PIV.y - side * tilt + DROP + 60;
  return (
    <motion.div
      style={{ position: 'absolute', left: x - 160, width: 320, textAlign: 'center' }}
      initial={{ opacity: 0, top: y }}
      animate={{ opacity: 1, top: y }}
      exit={{ opacity: 0 }}
      transition={{ duration: 3.2, ease: [0.65, 0, 0.35, 1], opacity: { duration: 0.8, delay: 0.8 } }}
    >
      {children}
    </motion.div>
  );
}

const TILT = [-62, 0];

function Content({ build }: { build: number }) {
  const tilt = TILT[build];
  return (
    <div className="content">
      <div className="text-col" style={{ top: 150, width: 700 }}>
        <div className="mono" style={{ fontSize: 15, color: 'var(--coral)' }}>
          Revenue & willingness to pay
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 18, marginTop: 18 }}>
          <span className="number" style={{ fontSize: 150 }}>
            €<Counter to={40} duration={1.6} delay={0.5} format={(v) => String(Math.round(v))} />
          </span>
          <span className="display d-64" style={{ color: 'var(--ink-60)' }}>
            / month
          </span>
        </div>
        <Fade delay={1.2} dim={build >= 1}>
          <p className="body" style={{ marginTop: 12 }}>
            per patient, paid by the institution (€480 a year).
          </p>
          <p className="display" style={{ fontSize: 40, marginTop: 22 }}>
            €0 for the patient.
          </p>
          <p className="body" style={{ fontSize: 24, marginTop: 6 }}>
            Device included if needed.
          </p>
        </Fade>
        <At build={build} at={1}>
          <div key="why" style={{ marginTop: 40 }}>
            <h3 className="display" style={{ fontSize: 46, lineHeight: 1.08 }}>
              <Words text="One avoided admission pays for 9 patients for a year." delay={0.6} wordClass={(w) => (w === '9' ? 'coral' : undefined)} />
            </h3>
            <Fade delay={1.8}>
              <p className="body" style={{ fontSize: 22, marginTop: 18 }}>
                Validated with free 3-month pilots that convert to paid contracts.
              </p>
              <div style={{ marginTop: 16 }}>
                <Pending>[PENDIENTE] Private clinics’ answer to ≈ €40 / month</Pending>
              </div>
            </Fade>
          </div>
        </At>
      </div>

      <PanLabel side={-1} tilt={tilt}>
        {build === 0 ? (
          <>
            <div className="mono" style={{ fontSize: 14 }}>VoxWave</div>
            <div className="number" style={{ fontSize: 44, marginTop: 6 }}>€480</div>
            <div className="body" style={{ fontSize: 19 }}>per patient-year</div>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 10 }}>
              {Array.from({ length: 9 }).map((_, i) => (
                <motion.span
                  key={i}
                  style={{ width: 16, height: 16, borderRadius: 8, background: 'var(--paper)' }}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.12, duration: 0.6, ease }}
                />
              ))}
            </div>
            <div className="number" style={{ fontSize: 44 }}>9 patients</div>
            <div className="body" style={{ fontSize: 19 }}>for a year · €4,320</div>
          </>
        )}
      </PanLabel>
      <PanLabel side={1} tilt={tilt}>
        <div className="mono" style={{ fontSize: 14, color: 'var(--coral)' }}>1 emergency admission</div>
        <div className="number coral" style={{ fontSize: 44, marginTop: 6 }}>≈ €4,400</div>
        <div className="body" style={{ fontSize: 19 }}>Spain, public health system</div>
      </PanLabel>
      <Fade delay={2} style={{ position: 'absolute', left: PIV.x - 300, top: PIV.y + 470, width: 600, textAlign: 'center' }}>
        <div className="mono" style={{ fontSize: 12 }}>
          Admission cost: PLOS ONE 2016 (€4,378) · Ministerio de Sanidad
        </div>
      </Fade>
    </div>
  );
}

const coral = (out: Float32Array, n: number) => {
  for (let i = 0; i < n; i++) put(out, i, C.coral, 1);
};

export const S13: SlideDef = {
  id: 'S13',
  builds: 2,
  auto: [8],
  notes:
    'Revenue. Forty euros per patient per month; free for the patient. Why would they pay? One avoided emergency stay costs about four thousand four hundred euros, enough to pay for nine patients for a whole year.',
  wave: (b) => ({
    shape: path(balance(TILT[b]), 1),
    paint: coral,
    core: 1.5,
    glow: 0.8,
    echoes: 0.15,
    duration: 3200,
    stagger: b === 0 ? 0.4 : 0,
    dir: 1,
  }),
  bg: () => ({ pool: [0.7, 0.5], poolStrength: 1, warm: 0.6 }),
  Content,
};
