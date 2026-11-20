import { motion } from 'motion/react';
import { C, EASE } from '../brand/tokens';
import type { SlideDef } from '../deck/types';
import { put } from '../engine/paint';
import { path, wave } from '../engine/shapes';
import { At, Words } from '../ui/motion';
import { Pending } from '../ui/Pending';

const ease = EASE as unknown as [number, number, number, number];

const DIVIDER_X = 900;

const BEFORE_AFTER: [string, string, string | null][] = [
  ['Market', 'Lithuania & the Baltics (≈ 16,000 patients)', 'Spain → Spanish-speaking world (≈ 2.3M) → the world'],
  ['Story', 'Numbers', 'Numbers with a face: María'],
  ['Product', 'Video, case design, MVP document', null],
  ['Device', 'Loose parts', null],
  ['Analysis', 'Concept only', null],
  ['Impact', 'Not measured', 'Indicators and pilot design'],
];

const TESTS = [
  ['Mentor session', 'Business model review', 'Market → Spain & Spanish speakers; story with María'],
  ['Head of Neurology · Gregorio Marañón', 'Is the gap real? Would they run a pilot?', null],
  ['Parkinson’s association', 'Support, members, help recruiting', null],
  ['Private clinics', '“Would you pay ≈ €40 a month per patient?”', null],
  ['Usability test', '≥ 10 attendees, one session unaided (SUS)', null],
  ['Recording quality', '10 recordings in a noisy room (SNR)', null],
  ['Sync', '10 USB connections in a row', null],
];

const LEARNED = [
  ['Our partners, data and language are in Madrid; Spanish reaches 20+ countries', 'From Lithuania to Spain and the Spanish-speaking world'],
  ['People remember people, not numbers', 'María, in four moments of the pitch'],
  ['A weekly session is too sparse to see sustained change', 'Daily 3-minute sessions'],
  ['Many older patients have no smartphone or internet', 'A one-button offline device'],
  ['A 90% margin was not credible next to real companies', '≈ 80%, benchmarked on Hinge and Omada'],
  ['Neurologists have no time for complex dashboards', 'A one-page report and a single alert'],
];

function Content({ build }: { build: number }) {
  return (
    <div className="content">
      <div className="text-col" style={{ top: 110, width: 1600 }}>
        <div className="mono" style={{ fontSize: 15, color: 'var(--coral)' }}>
          What we improved · what we learned
        </div>
      </div>

      <At build={build} at={0} until={1}>
        <div key="ba">
          <div style={{ position: 'absolute', left: 120, top: 170, width: 740 }}>
            <div className="display d-64" style={{ color: 'var(--ink-60)' }}>
              <Words text="Friday" delay={0.3} />
            </div>
          </div>
          <div style={{ position: 'absolute', left: DIVIDER_X + 60, top: 170, width: 840 }}>
            <div className="display d-64">
              <Words text="Sunday" delay={0.6} />
            </div>
          </div>
          {BEFORE_AFTER.map(([k, before, after], i) => (
            <motion.div key={k} style={{ position: 'absolute', left: 120, top: 290 + i * 98, width: 1420, display: 'grid', gridTemplateColumns: `${DIVIDER_X - 120 - 40}px 1fr`, gap: 100, alignItems: 'baseline' }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease, delay: 0.9 + i * 0.18 }}>
              <div>
                <div className="mono" style={{ fontSize: 12 }}>{k}</div>
                <div className="body" style={{ fontSize: 24, marginTop: 4, color: 'var(--ink-40)' }}>{before}</div>
              </div>
              <div>
                <div className="mono" style={{ fontSize: 12, color: 'var(--coral)' }}>{k}</div>
                <div style={{ marginTop: 4 }}>
                  {after ? <span className="body" style={{ fontSize: 24, color: 'var(--paper)' }}>{after}</span> : <Pending>[PENDIENTE] Sunday status (working device + live platform)</Pending>}
                </div>
              </div>
            </motion.div>
          ))}
          <motion.img
            src="/media/photos/prototype.jpg"
            style={{ position: 'absolute', left: 1590, top: 300, width: 210, borderRadius: 14, boxShadow: '0 20px 60px rgba(0,0,0,0.5)', rotate: 4 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease, delay: 1.8 }}
          />
        </div>
      </At>

      <At build={build} at={1} until={2}>
        <div key="tests" style={{ position: 'absolute', left: 120, top: 170, width: 1680 }}>
          <h2 className="display d-64">
            <Words text="Tested this weekend." delay={0.3} />
          </h2>
          <div style={{ marginTop: 34 }}>
            {TESTS.map(([t, how, res], i) => (
              <motion.div key={t} style={{ display: 'grid', gridTemplateColumns: '520px 560px 1fr', gap: 30, padding: '15px 0', borderTop: '1px solid rgba(241,237,228,0.1)', alignItems: 'baseline' }} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, ease, delay: 0.6 + i * 0.13 }}>
                <div className="display" style={{ fontSize: 26 }}>{t}</div>
                <div className="body" style={{ fontSize: 20 }}>{how}</div>
                <div>{res ? <span className="body" style={{ fontSize: 20, color: 'var(--coral)' }}>{res}</span> : <Pending>[PENDIENTE] result</Pending>}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </At>

      <At build={build} at={2}>
        <div key="learned" style={{ position: 'absolute', left: 120, top: 170, width: 1680 }}>
          <h2 className="display d-64">
            <Words text="We discovered → so we changed." delay={0.3} />
          </h2>
          <div style={{ marginTop: 34 }}>
            {LEARNED.map(([d, c], i) => (
              <motion.div key={d} style={{ display: 'grid', gridTemplateColumns: '880px 60px 1fr', gap: 10, padding: '14px 0', borderTop: '1px solid rgba(241,237,228,0.1)', alignItems: 'baseline' }} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, ease, delay: 0.6 + i * 0.13 }}>
                <div className="body" style={{ fontSize: 23 }}>{d}</div>
                <div className="coral" style={{ fontSize: 24 }}>→</div>
                <div className="display" style={{ fontSize: 26 }}>{c}</div>
              </motion.div>
            ))}
            <div style={{ paddingTop: 16, borderTop: '1px solid rgba(241,237,228,0.1)' }}>
              <Pending>[PENDIENTE] What came out of the contacts and tests → what we changed</Pending>
            </div>
          </div>
        </div>
      </At>
    </div>
  );
}

const coral = (out: Float32Array, n: number) => {
  for (let i = 0; i < n; i++) put(out, i, C.coral, 1);
};

export const S17: SlideDef = {
  id: 'S17',
  builds: 3,
  auto: [10, 10],
  notes:
    "We arrived on Friday with a video, a box of parts and a market in the Baltics. Our mentors challenged it: we're Spanish, our clinical partners are in Madrid, our model speaks Spanish. So we moved to Spain and the Spanish-speaking world. Today you've seen a working device and a live platform. [N] people here completed a session on their own, in [X] seconds on average. And [the head of neurology / a private clinic] told us [insight], so we [change].",
  wave: (b) =>
    b === 0
      ? {
          // The thread stands up and splits the screen in two: Friday | Sunday.
          shape: path(
            Array.from({ length: 60 }, (_, i) => [DIVIDER_X + Math.sin(i * 0.5) * 6, 150 + (i / 59) * 800] as [number, number]),
            1.2,
          ),
          paint: coral,
          core: 1.3,
          glow: 0.6,
          echoes: 0.15,
          duration: 3200,
          stagger: 0.3,
          dir: 1,
        }
      : { shape: wave({ y: 1000, amp: 16, speed: 0.7 }), paint: coral, opacity: 0.4, core: 1.2, glow: 0.5, duration: 2600, stagger: 0.3 },
  bg: () => ({ pool: [0.5, 0.5], poolStrength: 0.95, warm: 0.5 }),
  Content,
};
