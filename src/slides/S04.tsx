import { motion } from 'motion/react';
import { C, EASE, WAVE_Y } from '../brand/tokens';
import type { SlideDef } from '../deck/types';
import { clock } from '../engine/Engine';
import { put } from '../engine/paint';
import { timeline } from '../engine/shapes';
import { At, Counter, Fade, Words } from '../ui/motion';

const ease = EASE as unknown as [number, number, number, number];

// Thread spans x = -40 … 1960 (wave default), so u = (x + 40) / 2000.
const X_A = 330;
const X_B = 1650;
const U_A = (X_A + 40) / 2000;
const U_B = (X_B + 40) / 2000;
const X_SPIKE = 1330;
const U_SPIKE = (X_SPIKE + 40) / 2000;

/** Alive before and after the visits; a dashed, faded line in between. */
function paintGap(withSpike: boolean) {
  return (out: Float32Array, n: number) => {
    for (let i = 0; i < n; i++) {
      const u = i / (n - 1);
      if (u < U_A || u > U_B) {
        put(out, i, C.coral, 1);
        continue;
      }
      if (withSpike && Math.abs(u - U_SPIKE) < 0.022) {
        put(out, i, C.coral, 1);
        continue;
      }
      const x = -40 + u * 2000;
      const dash = Math.floor((x - X_A) / 9) % 2 === 0;
      put(out, i, C.muted, dash ? 0.55 : 0);
    }
  };
}

let spikeT0 = 0;

function VisitDot({ x, label, delay }: { x: number; label: string; delay: number }) {
  return (
    <motion.div
      style={{ position: 'absolute', left: x, top: WAVE_Y, width: 0, height: 0 }}
      initial={{ opacity: 0, scale: 0.4 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.4 } }}
      transition={{ duration: 0.9, ease, delay }}
    >
      <div
        style={{
          position: 'absolute',
          left: -9,
          top: -9,
          width: 18,
          height: 18,
          borderRadius: 9,
          background: 'var(--paper)',
          boxShadow: '0 0 0 6px rgba(241,237,228,0.08), 0 0 24px rgba(255,110,66,0.55)',
        }}
      />
      <div className="mono" style={{ position: 'absolute', top: 34, left: 0, transform: 'translateX(-50%)', whiteSpace: 'nowrap', fontSize: 17, color: 'var(--ink-60)' }}>
        {label}
      </div>
    </motion.div>
  );
}

function GapLabel() {
  const w = X_B - X_A - 120;
  return (
    <motion.div
      style={{ position: 'absolute', left: X_A + 60, top: WAVE_Y - 150, width: w, height: 60 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.4 } }}
      transition={{ duration: 0.8 }}
    >
      <motion.div
        style={{ position: 'absolute', left: 0, right: 0, top: 44, height: 14, borderTop: '1px solid rgba(241,237,228,0.3)', borderLeft: '1px solid rgba(241,237,228,0.3)', borderRight: '1px solid rgba(241,237,228,0.3)', transformOrigin: '50% 0' }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.6, ease, delay: 0.2 }}
      />
      <motion.div
        className="mono"
        style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', fontSize: 22, letterSpacing: '0.42em', color: 'var(--paper)' }}
        initial={{ opacity: 0, y: 8, filter: 'blur(6px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 1, ease, delay: 0.8 }}
      >
        The monitoring gap
      </motion.div>
    </motion.div>
  );
}

function Content({ build }: { build: number }) {
  return (
    <div className="content">
      {/* The 111 days */}
      <At build={build} at={0} until={2}>
        <div key="days" className="text-col" style={{ top: 150 }}>
          <Fade dim={build >= 1} delay={0.9} y={24}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 22 }}>
              <Counter className="number" style={{ fontSize: 200, color: 'var(--paper)' }} to={111} duration={2.6} delay={1.1} format={(v) => String(Math.round(v))} />
              <span className="display d-64" style={{ color: 'var(--ink-60)' }}>
                days
              </span>
            </div>
          </Fade>
          <Fade dim={build >= 1} delay={1.6}>
            <p className="body" style={{ marginTop: 12, maxWidth: 640 }}>
              average wait for a <span style={{ color: 'var(--paper)' }}>first</span> neurology visit in Spain
            </p>
            <div className="mono" style={{ fontSize: 13, marginTop: 14 }}>
              Ministerio de Sanidad · SISLE · June 2025
            </div>
          </Fade>
        </div>
      </At>

      {/* Emergencies */}
      <At build={build} at={1} until={2}>
        <div key="emerg" style={{ position: 'absolute', left: 1100, top: 150, width: 680 }}>
          <Fade delay={2.6} y={20}>
            <div className="number coral" style={{ fontSize: 150 }}>
              <Counter to={72} duration={1.8} delay={2.8} format={(v) => `${Math.round(v)}%`} />
            </div>
          </Fade>
          <Fade delay={3.2}>
            <p className="body" style={{ marginTop: 10 }}>
              of Parkinson’s hospital admissions are emergencies, not planned
            </p>
            <div className="mono" style={{ fontSize: 13, marginTop: 14 }}>
              Low et al. · BMC Health Serv Res 2019
            </div>
          </Fade>
        </div>
      </At>

      {/* The line */}
      <At build={build} at={0}>
        <VisitDot key="a" x={X_A} label="Visit" delay={2.2} />
      </At>
      <At build={build} at={0}>
        <VisitDot key="b" x={X_B} label="Next visit" delay={2.8} />
      </At>
      <At build={build} at={1}>
        <GapLabel key="gap" />
      </At>
      <At build={build} at={1}>
        <Fade key="em" delay={2.4} style={{ position: 'absolute', left: X_SPIKE, top: WAVE_Y + 130 }}>
          <div className="mono coral" style={{ transform: 'translateX(-50%)', fontSize: 16, color: 'var(--coral)' }}>
            Emergency
          </div>
        </Fade>
      </At>

      {/* The insight */}
      <At build={build} at={2}>
        <div key="insight" className="text-col" style={{ top: 170, width: 1500 }}>
          <Fade delay={0.4}>
            <p className="body" style={{ fontSize: 40 }}>
              The problem is not a lack of treatment.
            </p>
          </Fade>
          <h2 className="display d-88" style={{ marginTop: 22, maxWidth: 1400 }}>
            <Words
              text="It’s a lack of information between visits."
              delay={1.1}
              wordClass={(w) => (w === 'between' || w === 'visits.' ? 'shimmer' : undefined)}
            />
          </h2>
        </div>
      </At>
    </div>
  );
}

export const S04: SlideDef = {
  id: 'S04',
  builds: 3,
  auto: [7, 7],
  notes:
    "Neurology is saturated: in Spain, the average wait just for a first appointment is a hundred and eleven days. Between visits, small changes go unnoticed until they become a fall, an infection, an emergency. Seven in ten Parkinson's admissions are emergencies, and each one costs thousands of euros. The problem is not a lack of treatment. It's a lack of information between visits.",
  wave: (b) => {
    if (b === 0) {
      // The ten voices merge into one life on a timeline; between the visits it goes silent.
      return {
        shape: timeline({ y: WAVE_Y, a: U_A, b: U_B }),
        paint: paintGap(false),
        core: 1.5,
        glow: 1,
        echoes: 0.3,
        duration: 3400,
        stagger: 0.4,
        dir: 1,
      };
    }
    if (b === 1) spikeT0 = clock.t;
    // Something happens in the dark: an emergency nobody saw coming.
    return {
      shape: timeline({ y: WAVE_Y, a: U_A, b: U_B, spike: { at: U_SPIKE, t0: spikeT0, after: b === 1 ? 2.2 : 0 } }),
      paint: paintGap(true),
      duration: 1600,
      stagger: 0,
    };
  },
  bg: (b) => ({ pool: [0.5, 0.58], poolStrength: b === 2 ? 1.1 : 0.9, warm: 0.7 }),
  Content,
};
