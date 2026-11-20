import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { C, EASE } from '../brand/tokens';
import type { SlideDef } from '../deck/types';
import { put } from '../engine/paint';
import { wave } from '../engine/shapes';
import { media } from '../media/preload';
import { Words } from '../ui/motion';

const ease = EASE as unknown as [number, number, number, number];

// The real patient app (vox-wave-demo), recorded on a phone and played at 1.7x.
const CLIP = '/media/app/session.mp4';
// When each activity starts in the clip (s) — and when the session is complete.
const AT = { aah: 1.4, read: 9.0, chat: 15.6, done: 19.8 };

const STEPS = [
  { n: '01', title: 'Hold an “aah”', note: 'Five steady seconds' },
  { n: '02', title: 'Read a line', note: 'The words light up, she follows' },
  { n: '03', title: 'Chat a little', note: '“Tell us about your morning”' },
];

// Phone geometry (design px): the app is 390 x 844 CSS px.
const SCREEN = { w: 380, h: 822 };
const BEZEL = 13;
const PHONE = { x: 1180, y: 118 };

function Phone({ onTime }: { onTime: (t: number) => void }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [src] = useState(() => media(CLIP));
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.currentTime = 0;
    const id = window.setTimeout(() => v.play().catch(() => {}), 1100);
    return () => window.clearTimeout(id);
  }, []);
  return (
    <motion.div
      style={{
        position: 'absolute',
        left: PHONE.x,
        top: PHONE.y,
        width: SCREEN.w + BEZEL * 2,
        height: SCREEN.h + BEZEL * 2,
        borderRadius: 62,
        background: '#071a24',
        padding: BEZEL,
        boxShadow: '0 0 0 1.5px rgba(9,38,52,0.25), 0 50px 110px rgba(9,38,52,0.28), 0 18px 40px rgba(9,38,52,0.18)',
        transformPerspective: 1600,
      }}
      initial={{ opacity: 0, y: 90, rotateY: -14, rotateX: 6 }}
      animate={{ opacity: 1, y: 0, rotateY: 0, rotateX: 0 }}
      exit={{ opacity: 0, y: -30, transition: { duration: 0.5, ease } }}
      transition={{ duration: 1.5, ease, opacity: { duration: 0.8 } }}
    >
      <div style={{ position: 'relative', width: SCREEN.w, height: SCREEN.h, borderRadius: 49, overflow: 'hidden', background: '#ece8e1' }}>
        <video
          ref={ref}
          src={src}
          poster="/media/app/session_first.jpg"
          muted
          playsInline
          preload="auto"
          onTimeUpdate={(e) => onTime(e.currentTarget.currentTime)}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {/* Dynamic island */}
        <div style={{ position: 'absolute', left: '50%', top: 11, width: 104, height: 30, marginLeft: -52, borderRadius: 16, background: '#05141c' }} />
      </div>
    </motion.div>
  );
}

function Step({ i, state }: { i: number; state: 'next' | 'now' | 'done' }) {
  const s = STEPS[i];
  const op = state === 'now' ? 1 : state === 'done' ? 0.55 : 0.28;
  return (
    <motion.div
      style={{ position: 'absolute', left: 120, top: 430 + i * 128, width: 900 }}
      initial={{ opacity: 0, x: -14, filter: 'blur(8px)' }}
      animate={{ opacity: op, x: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.7, ease, delay: 0 }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 24 }}>
        <span className="mono" style={{ fontSize: 18, color: state === 'next' ? 'var(--paper)' : 'var(--coral)', transition: 'color .5s', width: 56, display: 'inline-flex', gap: 8 }}>
          <span style={{ width: 14, opacity: state === 'done' ? 1 : 0, transition: 'opacity .5s' }}>✓</span>
          {s.n}
        </span>
        <span className="display" style={{ fontSize: 52 }}>
          {s.title}
        </span>
      </div>
      <div className="body" style={{ fontSize: 24, marginLeft: 80, marginTop: 6 }}>
        {s.note}
      </div>
    </motion.div>
  );
}

function Content() {
  const [t, setT] = useState(0);
  const stateOf = (k: number): 'next' | 'now' | 'done' => {
    const starts = [AT.aah, AT.read, AT.chat, AT.done];
    if (t >= starts[k + 1]) return 'done';
    if (t >= starts[k]) return 'now';
    return 'next';
  };
  const done = t >= AT.done;
  return (
    <div className="content">
      <div className="text-col" style={{ top: 170, width: 940 }}>
        <h2 className="display d-88">
          <Words text="Three minutes a day." delay={0.4} />
        </h2>
        <motion.p className="body" style={{ marginTop: 22, maxWidth: 800 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 1 }}>
          A guided voice check-in, every morning, at home.
        </motion.p>
      </div>

      {STEPS.map((_, i) => (
        <Step key={i} i={i} state={stateOf(i)} />
      ))}

      {done && (
        <div className="text-col" style={{ top: 850, width: 940 }}>
          <h3 className="display" style={{ fontSize: 60 }}>
            <Words text="We measure." delay={0.2} />
            <Words text="Doctors decide." delay={0.6} wordClass={() => 'shimmer'} />
          </h3>
        </div>
      )}

      <Phone onTime={setT} />
    </div>
  );
}

export const S05: SlideDef = {
  id: 'S05',
  builds: 1,
  notes:
    'VoxWave is a three-minute voice check-in, every morning, at home. This is María’s phone. She holds an “aah” for five seconds. She reads a line, following the words as they light up. And she chats a little about her morning. Done. Each patient is compared only with themselves; when the voice drifts, her neurologist gets an alert and a one-page report. We measure. Doctors decide.',
  // The voice keeps flowing, low, behind the phone.
  wave: () => ({
    shape: wave({ y: 1000, amp: 22, speed: 0.9 }),
    paint: (out, n) => {
      for (let i = 0; i < n; i++) put(out, i, C.coral, 1);
    },
    opacity: 0.7,
    core: 1.4,
    glow: 0.9,
    echoes: 0.25,
    duration: 3200,
    stagger: 0.3,
    dir: 1,
  }),
  // The product lives on paper, like the web app itself.
  theme: () => 'light',
  bg: () => ({ pool: [0.68, 0.5], poolStrength: 1.05, warm: 0.8 }),
  Content,
};
