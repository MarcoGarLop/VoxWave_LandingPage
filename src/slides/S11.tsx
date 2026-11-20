import { motion } from 'motion/react';
import { C, EASE } from '../brand/tokens';
import type { SlideDef } from '../deck/types';
import { put } from '../engine/paint';
import { ring } from '../engine/shapes';
import { At, Fade, Words } from '../ui/motion';

const ease = EASE as unknown as [number, number, number, number];

const RING = { cx: 1330, cy: 560, r: 250 };

const DIMENSIONS = [
  { k: 'Economic', v: 'Clinics, insurers and public health pay. No grants. ≈80% margin.' },
  { k: 'Clinical', v: 'One alert and a one-page report. No extra work for staff.' },
  { k: 'Habit', v: 'Three minutes a day, a streak, clear on-screen steps.' },
  { k: 'Environmental', v: 'Devices are lent, recovered and refurbished. Local processing.' },
  { k: 'Social', v: 'Works offline and without a smartphone, in Spanish.' },
];

const RISKS = [
  ['False alarms & anxiety', 'Patients never get a diagnosis; alerts go to the doctor; ≤ 1 false alarm per patient-year'],
  ['Health-data privacy', 'On-device processing, explicit consent, GDPR art. 9, EU hosting'],
  ['Digital divide', 'A one-button device that works offline'],
  ['Over-reliance', 'Complements visits, never replaces them; quality flags on every report'],
  ['Model bias', 'Personal baseline; validation by subgroup and variety of Spanish'],
  ['E-waste', 'Loan, recovery and refurbishment of every device'],
];

function Dimension({ i }: { i: number }) {
  const a = (i / DIMENSIONS.length) * Math.PI * 2 - Math.PI / 2;
  const R = RING.r + 70;
  const x = RING.cx + Math.cos(a) * R;
  const y = RING.cy + Math.sin(a) * R;
  const right = Math.cos(a) > 0.2;
  const center = Math.abs(Math.cos(a)) <= 0.2;
  const d = DIMENSIONS[i];
  return (
    <motion.div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: 300,
        transform: `translate(${center ? '-50%' : right ? '0' : '-100%'}, ${Math.sin(a) < -0.5 ? '-100%' : '-50%'})`,
        textAlign: center ? 'center' : right ? 'left' : 'right',
      }}
      initial={{ opacity: 0, filter: 'blur(8px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.9, ease, delay: 1.2 + i * 0.3 }}
    >
      <div className="mono" style={{ fontSize: 15, color: 'var(--coral)' }}>
        {d.k}
      </div>
      <div className="body" style={{ fontSize: 21, lineHeight: 1.35, marginTop: 6, color: 'var(--ink-70)' }}>
        {d.v}
      </div>
    </motion.div>
  );
}

function Content({ build }: { build: number }) {
  return (
    <div className="content">
      <div className="text-col" style={{ top: 160, width: 640 }}>
        <h2 className="display d-88">
          <Words text="Built to last." delay={0.4} />
        </h2>
        <Fade delay={1} dim={build >= 1}>
          <p className="body" style={{ marginTop: 22 }}>
            For the impact to last, it has to pay for itself, and fit the work doctors already do.
          </p>
        </Fade>
      </div>

      <At build={build} at={0} until={1}>
        <div key="dims">
          {DIMENSIONS.map((_, i) => (
            <Dimension key={i} i={i} />
          ))}
        </div>
      </At>

      <At build={build} at={1}>
        <div key="risks" style={{ position: 'absolute', left: 120, top: 470, width: 980 }}>
          <Fade delay={0.2}>
            <div className="mono" style={{ fontSize: 15, marginBottom: 18 }}>
              What could go wrong · and what we do about it
            </div>
          </Fade>
          {RISKS.map(([r, m], i) => (
            <motion.div
              key={r}
              style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 24, padding: '13px 0', borderTop: '1px solid rgba(241,237,228,0.1)' }}
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease, delay: 0.5 + i * 0.16 }}
            >
              <div className="display" style={{ fontSize: 25 }}>
                {r}
              </div>
              <div className="body" style={{ fontSize: 21, lineHeight: 1.35 }}>
                {m}
              </div>
            </motion.div>
          ))}
        </div>
      </At>
    </div>
  );
}

export const S11: SlideDef = {
  id: 'S11',
  builds: 2,
  auto: [10],
  notes:
    'For the impact to last, it has to pay for itself. Clinics, insurers and public health pay, not grants, and the habit takes three minutes a day. We also know what could go wrong. False alarms: patients never get a diagnosis from us, and alerts are tuned to one false alarm per year at most. Privacy: voices are processed on the device, only with consent, under GDPR. The digital divide: a device that works offline. E-waste: devices are lent, recovered and refurbished. And it never replaces the doctor.',
  wave: (b) => ({
    // The thread closes on itself: a cycle that sustains itself.
    shape: b === 0 ? ring({ ...RING, ripple: 7 }) : ring({ cx: 1540, cy: 640, r: 190, ripple: 5 }),
    paint: (out, n) => {
      for (let i = 0; i < n; i++) put(out, i, C.coral, 1);
    },
    core: 1.6,
    glow: 1.1,
    echoes: 0.35,
    duration: 3400,
    stagger: 0.45,
    dir: 1,
  }),
  bg: (b) => ({ pool: b === 0 ? [0.69, 0.5] : [0.8, 0.6], poolStrength: 1.05, warm: 0.6 }),
  Content,
};
