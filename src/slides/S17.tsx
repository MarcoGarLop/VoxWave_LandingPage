import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { C, EASE } from '../brand/tokens';
import type { SlideDef } from '../deck/types';
import { wave } from '../engine/shapes';
import { At, Words } from '../ui/motion';

const ease = EASE as unknown as [number, number, number, number];

/**
 * The weekend, on paper.
 * Build 0: the real material pops in, in the order it happened — prototype photos
 * drop like prints on the left, replies from researchers stack like notifications on
 * the right (newest on top), and a clock in the corner ticks through the weekend.
 * Build 1: what we tested, what it showed, and what we changed.
 */

const NAVY = C.navy, TEAL = C.teal, CORAL = C.coral;
const INK = 'rgba(9,38,52,0.72)';

type Photo = { kind: 'photo'; src: string; caption: string; x: number; y: number; w: number; rot: number };
type Mail = { kind: 'mail'; who: string; initials: string; org: string; country: string; quote: string; shots: { src: string; h: number }[] };
type Item = { at: number; clock: string; item: Photo | Mail };

const W = '/media/weekend/';
const ITEMS: Item[] = [
  { at: 0.7, clock: 'Thu · afternoon', item: { kind: 'mail', who: 'Kipras P.', initials: 'KP', org: 'Voice-data researcher', country: 'Lithuania', quote: '“I’ll put you in contact with a PhD working on the topic.”', shots: [{ src: W + 'kipras.png', h: 44 }] } },
  { at: 1.7, clock: 'Thu · afternoon', item: { kind: 'mail', who: 'Joonas Järve', initials: 'JJ', org: 'University of Tartu', country: 'Estonia', quote: '“Let’s arrange a short call to get to know you and your idea!”', shots: [{ src: W + 'joonas.png', h: 160 }] } },
  { at: 2.7, clock: 'Thu · 16:51', item: { kind: 'photo', src: W + 'parts.jpg', caption: 'Thu 16:51 · a box of parts', x: 130, y: 196, w: 250, rot: -5 } },
  { at: 3.6, clock: 'Thu · 17:17', item: { kind: 'photo', src: W + 'wired.jpg', caption: 'Thu 17:17 · first wiring', x: 410, y: 250, w: 240, rot: 3.5 } },
  { at: 4.6, clock: 'Thu · evening', item: { kind: 'mail', who: 'Evaldas Vaičiukynas', initials: 'EV', org: 'Kaunas University of Technology', country: 'Lithuania', quote: '“I’d see testing AUC on Spanish.” — so we did.', shots: [{ src: W + 'evaldas2.png', h: 140 }] } },
  { at: 5.9, clock: 'Fri · 01:38', item: { kind: 'photo', src: W + 'case.jpg', caption: 'Fri 01:38 · it has a body', x: 680, y: 186, w: 270, rot: -2.5 } },
  { at: 7.0, clock: 'Fri · 09:29', item: { kind: 'mail', who: 'Cristina Ibarrola', initials: 'CI', org: 'Asociación Navarra de Parkinson', country: 'Spain', quote: '“Nos parece un proyecto muy interesante.”', shots: [{ src: W + 'cristina.png', h: 66 }] } },
];
const ALL_IN = 8.2;
const SNIP = 0.45; // the real email, small, as proof under the quote

function useElapsed() {
  const [t, setT] = useState(0);
  useEffect(() => {
    const t0 = performance.now();
    let raf = 0;
    const loop = () => {
      setT((performance.now() - t0) / 1000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  return t;
}

function Print({ p, last }: { p: Photo; last: boolean }) {
  return (
    <motion.div
      style={{ position: 'absolute', left: p.x, top: p.y, width: p.w + 24, padding: '12px 12px 0', background: '#fffefb', borderRadius: 4, boxShadow: last ? '0 30px 60px rgba(9,38,52,0.25)' : '0 18px 40px rgba(9,38,52,0.16)', zIndex: 2 }}
      initial={{ opacity: 0, y: -70, rotate: p.rot - 14, scale: 1.18 }}
      animate={{ opacity: 1, y: 0, rotate: p.rot, scale: 1 }}
      transition={{ type: 'spring', stiffness: 170, damping: 17 }}
    >
      <img src={p.src} alt="" style={{ width: p.w, display: 'block', borderRadius: 2 }} />
      <div className="mono" style={{ fontSize: 14, color: NAVY, padding: '14px 2px 16px', textTransform: 'none', letterSpacing: '0.04em' }}>
        {p.caption}
      </div>
    </motion.div>
  );
}

function Notification({ m, time }: { m: Mail; time: string }) {
  return (
    <motion.div
      layout
      style={{ width: 720, borderRadius: 22, background: '#fbf9f5', border: '2px solid rgba(9,38,52,0.08)', boxShadow: '0 18px 44px rgba(9,38,52,0.12)', overflow: 'hidden' }}
      initial={{ opacity: 0, y: -30, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px' }}>
        <div className="display" style={{ width: 40, height: 40, borderRadius: 20, background: TEAL, color: '#fff', fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
          {m.initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="display" style={{ fontSize: 21, fontWeight: 700, color: NAVY, lineHeight: 1.1 }}>
            {m.who}
          </div>
          <div className="body" style={{ fontSize: 16, color: INK, marginTop: 2, whiteSpace: 'nowrap' }}>
            {m.org}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="mono" style={{ fontSize: 12, color: CORAL }}>
            {m.country}
          </div>
          <div className="mono" style={{ fontSize: 12, color: 'rgba(9,38,52,0.45)', marginTop: 4 }}>
            {time}
          </div>
        </div>
      </div>
      <div className="display" style={{ padding: '0 20px 10px', fontSize: 22, fontWeight: 600, color: NAVY, lineHeight: 1.25 }}>
        {m.quote}
      </div>
      <div style={{ padding: '0 20px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {m.shots.map((s) => (
          <img key={s.src} src={s.src} alt="" style={{ width: 800 * SNIP, height: s.h * SNIP, objectFit: 'cover', objectPosition: 'top left', display: 'block', borderRadius: 8, border: '1px solid rgba(9,38,52,0.06)' }} />
        ))}
      </div>
    </motion.div>
  );
}

function Weekend() {
  const t = useElapsed();
  const shown = ITEMS.filter((it) => t >= it.at);
  const clock = shown.length ? shown[shown.length - 1].clock : 'Thu · noon';
  const photos = shown.filter((it) => it.item.kind === 'photo');
  const mails = shown.filter((it) => it.item.kind === 'mail').reverse(); // newest on top
  const done = t >= ALL_IN;
  return (
    <motion.div style={{ position: 'absolute', inset: 0 }} exit={{ opacity: 0, transition: { duration: 0.5 } }}>
      <div className="mono" style={{ position: 'absolute', left: 120, top: 62, fontSize: 18, color: NAVY, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ width: 10, height: 10, borderRadius: 5, background: CORAL, display: 'inline-block' }} />
        This weekend
      </div>
      <motion.div key={clock} className="mono" style={{ position: 'absolute', right: 120, top: 62, fontSize: 18, color: TEAL }} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        {clock}
      </motion.div>
      <div style={{ position: 'absolute', left: 120, top: 100 }}>
        <AnimatePresence mode="wait">
          <motion.h2
            key={done ? 'end' : 'start'}
            className="display"
            style={{ fontSize: 46, color: done ? CORAL : NAVY }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8, transition: { duration: 0.3 } }}
            transition={{ duration: 0.6, ease }}
          >
            {done ? 'A working device. Researchers in three countries answering.' : <Words text="From a box of parts…" delay={0.1} />}
          </motion.h2>
        </AnimatePresence>
      </div>

      {photos.map((it, i) => (
        <Print key={(it.item as Photo).src} p={it.item as Photo} last={i === photos.length - 1} />
      ))}

      <div style={{ position: 'absolute', left: 1080, top: 176, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <AnimatePresence>
          {mails.map((it) => (
            <Notification key={(it.item as Mail).who} m={it.item as Mail} time={it.clock} />
          ))}
        </AnimatePresence>
      </div>

      {done && (
        <div style={{ position: 'absolute', left: 130, top: 880, display: 'flex', gap: 46 }}>
          {[
            ['1', 'working prototype'],
            ['4', 'replies from researchers'],
            ['3', 'countries'],
          ].map(([n, l], i) => (
            <motion.div key={l} style={{ display: 'flex', alignItems: 'baseline', gap: 12 }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease, delay: 0.3 + i * 0.15 }}>
              <span className="number" style={{ fontSize: 52, color: CORAL, lineHeight: 1 }}>
                {n}
              </span>
              <span className="display" style={{ fontSize: 22, fontWeight: 600, color: NAVY }}>
                {l}
              </span>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ---------- Build 1: tested → showed → changed ----------
const LEARNED = [
  {
    test: 'Can our model cheat?',
    showed: 'Silence alone predicted Parkinson’s',
    big: 'AUROC 0.83',
    changed: 'We remove the room from every recording.',
  },
  {
    test: 'Does it work beyond Spanish?',
    showed: 'Spanish 0.91 · English, never trained on it',
    big: '0.79',
    changed: 'One model for the Spanish-speaking world, and beyond.',
  },
  {
    test: 'Can the device scale?',
    showed: 'A medical-grade ESP32 device — less than a Raspberry Pi 4 alone',
    big: '€39',
    changed: 'The prototype proves it; the next version runs on an ESP32.',
  },
];

function Learned() {
  return (
    <div style={{ position: 'absolute', left: 120, top: 92, width: 1680 }}>
      <div className="mono" style={{ fontSize: 18, color: NAVY, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ width: 10, height: 10, borderRadius: 5, background: CORAL, display: 'inline-block' }} />
        What we tested · what we changed
      </div>
      <h2 className="display" style={{ fontSize: 64, color: NAVY, marginTop: 14 }}>
        <Words text="We tested. We learned. We changed." delay={0.2} />
      </h2>
      <div style={{ marginTop: 60 }}>
        {LEARNED.map((r, i) => (
          <motion.div
            key={r.test}
            style={{ display: 'grid', gridTemplateColumns: '440px 600px 1fr', gap: 40, alignItems: 'center', padding: '30px 0', borderTop: '2px solid rgba(9,38,52,0.1)' }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.8 + i * 0.45 }}
          >
            <div className="display" style={{ fontSize: 32, fontWeight: 700, color: NAVY }}>
              {r.test}
            </div>
            <div>
              <div className="number" style={{ fontSize: 58, lineHeight: 1, color: NAVY }}>
                {r.big}
              </div>
              <div className="body" style={{ fontSize: 21, color: INK, marginTop: 8 }}>
                {r.showed}
              </div>
            </div>
            <div className="display" style={{ fontSize: 30, fontWeight: 700, color: CORAL, lineHeight: 1.2 }}>
              → {r.changed}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function Content({ build }: { build: number }) {
  return (
    <div className="content">
      <At build={build} at={0} until={1}>
        <Weekend key="weekend" />
      </At>
      <At build={build} at={1}>
        <Learned key="learned" />
      </At>
    </div>
  );
}

export const S17: SlideDef = {
  id: 'S17',
  builds: 2,
  auto: [11.5],
  notes:
    "On Thursday we had a box of parts. By Thursday evening, a wired prototype; by one in the morning, a device with a body. Meanwhile, we wrote to researchers — and they answered: the University of Tartu in Estonia wants a call, Kaunas University of Technology in Lithuania told us how to validate our model, and the Navarra Parkinson's Association called it a very interesting project. Then we tested. Can our model cheat? Silence alone predicted Parkinson's — so we remove the room from every recording. Does it work beyond Spanish? Trained on Spanish, it recognised Parkinson's in English with no retraining. Can the device scale? The Pi works but costs too much — the next version runs on an ESP32.",
  theme: () => 'light',
  wave: () => ({ shape: wave({ y: 540, amp: 30 }), opacity: 0, duration: 1600, stagger: 0 }),
  bg: () => ({ pool: [0.5, 0.5], poolStrength: 1, warm: 0.6 }),
  Content,
};
