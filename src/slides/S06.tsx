import { motion } from 'motion/react';
import { C, EASE } from '../brand/tokens';
import type { SlideDef } from '../deck/types';
import { put } from '../engine/paint';
import { wave } from '../engine/shapes';
import { HospitalArt, PapersArt } from '../ui/LineArt';

const ease = EASE as unknown as [number, number, number, number];

// Left column: the science. Right column: the people. Same rhythm on both sides.
const PAPERS = [
  {
    title: 'Nonlinear speech analysis algorithms mapped to a standard metric achieve clinically useful quantification of average Parkinson’s disease symptom severity',
    who: 'Tsanas et al. · 2011',
    fact: 'A sustained “aah” recorded at home estimates the clinical UPDRS score within ≈ 2 points of the neurologist.',
  },
  {
    title: 'Speech biomarkers in rapid eye movement sleep behavior disorder and Parkinson disease',
    who: 'Rusz et al. · 2021',
    fact: '448 people, 5 languages: speech analysis detects Parkinson’s, even before diagnosis, and tracks it for 12 months.',
  },
  {
    title: 'Smartphone voice calls provide early biomarkers of parkinsonism in rapid eye movement sleep behavior disorder',
    who: 'Illner et al. · 2024',
    fact: 'Ordinary phone calls detect early parkinsonism (AUC 0.85), as well as a lab microphone.',
  },
  {
    title: 'Reliability and validity of the Roche PD Mobile Application for remote monitoring of early Parkinson’s disease',
    who: 'Lipsmeier et al. · 2022',
    fact: '316 early-stage patients completed 96% of their daily smartphone tests.',
  },
];

const PARTNERS = [
  {
    logo: '/media/partners/maranon.png',
    logoStyle: { width: 470 },
    name: 'Gregorio Marañón University Hospital · Madrid',
    people: 'Dr. Gustavo Arrieta · Dr. Andrés Pastor',
  },
  {
    logo: '/media/partners/fep.png',
    logoStyle: { height: 150 },
    name: 'Spanish Parkinson’s Federation',
    people: 'Cristina Ibarrola',
  },
];

const L = { x: 120, w: 800 };
// Long titles take three lines, short ones two.
const TOPS = [292, 472, 616, 796];
const R = { x: 1080, w: 720 };
const DIVIDER = 980;

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 18, filter: 'blur(8px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, transition: { duration: 0.45 } },
  transition: { duration: 1, ease, delay },
});

function Heading({ x, art, text, delay }: { x: number; art: React.ReactNode; text: string; delay: number }) {
  return (
    <div style={{ position: 'absolute', left: x, top: 92 }}>
      {art}
      <motion.h2 className="display" style={{ fontSize: 46, marginTop: 18, lineHeight: 1.05 }} {...rise(delay)}>
        {text}
      </motion.h2>
    </div>
  );
}

function Content() {
  return (
    <div className="content">
      <Heading x={L.x} art={<PapersArt size={104} delay={0.2} />} text="Scientific evidence behind us" delay={0.5} />
      <Heading x={R.x} art={<HospitalArt size={104} delay={0.5} />} text="Our collaborators" delay={0.8} />

      {/* The thin rule between both columns draws downward. */}
      <motion.div
        style={{ position: 'absolute', left: DIVIDER, top: 110, width: 1, height: 860, background: 'rgba(241,237,228,0.14)', transformOrigin: '50% 0%' }}
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.6, ease, delay: 0.3 }}
      />

      {PAPERS.map((p, i) => (
        <motion.div key={p.who} style={{ position: 'absolute', left: L.x, top: TOPS[i], width: L.w, paddingLeft: 26, borderLeft: '2px solid rgba(255,110,66,0.75)' }} {...rise(1.0 + i * 0.25)}>
          <div className="display" style={{ fontSize: 27, lineHeight: 1.22, fontWeight: 600 }}>
            {p.title}
          </div>
          <div className="mono" style={{ fontSize: 14, marginTop: 12, color: 'var(--coral)' }}>
            {p.who}
          </div>
        </motion.div>
      ))}

      {PARTNERS.map((p, i) => (
        <motion.div key={p.name} style={{ position: 'absolute', left: R.x, top: 318 + i * 330, width: R.w }} {...rise(1.4 + i * 0.35)}>
          <div style={{ height: 160, display: 'flex', alignItems: 'center' }}>
            <img src={p.logo} alt="" style={{ ...p.logoStyle, display: 'block', opacity: 0.94 }} />
          </div>
          <div className="display" style={{ fontSize: 26, marginTop: 22 }}>
            {p.name}
          </div>
          <div className="body" style={{ fontSize: 21, marginTop: 8 }}>
            {p.people}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export const S06: SlideDef = {
  id: 'S06',
  builds: 1,
  notes:
    'Why the voice? Because science can already read it. A sustained “aah” recorded at home estimates the clinical score within two points of the neurologist. A study in five languages showed speech analysis tracks the disease, even before diagnosis. Ordinary phone calls work as well as a lab microphone. And patients do daily tests: ninety-six percent adherence. And we’re not doing this alone: Dr. Gustavo Arrieta and Dr. Andrés Pastor at Gregorio Marañón, one of Spain’s largest hospitals, and Cristina Ibarrola at the Spanish Parkinson’s Federation.',
  // The voice keeps flowing, quietly, along the bottom of the page.
  wave: () => ({
    shape: wave({ y: 1030, amp: 18, speed: 0.8 }),
    paint: (out, n) => {
      for (let i = 0; i < n; i++) put(out, i, C.coral, 1);
    },
    opacity: 0.55,
    core: 1.3,
    glow: 0.8,
    echoes: 0.2,
    duration: 3000,
    stagger: 0.3,
    dir: 1,
  }),
  bg: () => ({ pool: [0.5, 0.45], poolStrength: 0.95, warm: 0.5 }),
  Content,
};
