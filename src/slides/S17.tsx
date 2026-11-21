import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { C, EASE } from '../brand/tokens';
import type { SlideDef } from '../deck/types';
import { wave } from '../engine/shapes';
import { DrawnFormula, prewarmTex } from '../ui/DrawnFormula';
import { Words } from '../ui/motion';

const ease = EASE as unknown as [number, number, number, number];

/**
 * The weekend, on paper.
 * Build 0: the real material pops in, in the order it happened — prototype photos
 * drop like prints on the left, replies from researchers stack like notifications on
 * the right (newest on top), and a clock in the corner ticks through the weekend.
 * Build 1: three things we learned, and the paper we wrote about them.
 */

const NAVY = C.navy, TEAL = C.teal, CORAL = C.coral;
const INK = 'rgba(9,38,52,0.72)';

type Photo = { kind: 'photo'; src: string; caption: string; x: number; y: number; w: number; rot: number };
type Mail = { kind: 'mail'; who: string; initials: string; org?: string; country: string; quote: string; shots: { src: string; h: number }[]; logo?: { src: string; h: number } };
type Item = { at: number; clock: string; item: Photo | Mail };

const W = '/media/weekend/';
const ITEMS: Item[] = [
  { at: 0.7, clock: 'Thu · afternoon', item: { kind: 'mail', who: 'Kipras P.', initials: 'KP', org: 'Voice-data researcher', country: 'Lithuania', quote: '“I’ll put you in contact with a PhD working on the topic.”', shots: [{ src: W + 'kipras.png', h: 44 }] } },
  { at: 1.7, clock: 'Thu · afternoon', item: { kind: 'mail', who: 'Joonas Järve', initials: 'JJ', org: 'University of Tartu', country: 'Estonia', quote: '“Let’s arrange a short call to get to know you and your idea!”', shots: [{ src: W + 'joonas.png', h: 160 }], logo: { src: '/media/partners/tartu.png', h: 44 } } },
  { at: 2.7, clock: 'Thu · 16:51', item: { kind: 'photo', src: W + 'parts.jpg', caption: 'Thu 16:51 · a box of parts', x: 130, y: 196, w: 250, rot: -5 } },
  { at: 3.6, clock: 'Thu · 17:17', item: { kind: 'photo', src: W + 'wired.jpg', caption: 'Thu 17:17 · first wiring', x: 410, y: 250, w: 240, rot: 3.5 } },
  { at: 4.6, clock: 'Thu · evening', item: { kind: 'mail', who: 'Evaldas Vaičiukynas', initials: 'EV', org: 'Kaunas University of Technology', country: 'Lithuania', quote: '“I’d see testing AUC on Spanish.” — so we did.', shots: [{ src: W + 'evaldas2.png', h: 140 }], logo: { src: '/media/partners/ktu.png', h: 30 } } },
  { at: 5.9, clock: 'Fri · 01:38', item: { kind: 'photo', src: W + 'case.jpg', caption: 'Fri 01:38 · it has a body', x: 680, y: 186, w: 270, rot: -2.5 } },
  { at: 7.0, clock: 'Fri · 09:29', item: { kind: 'mail', who: 'Cristina Ibarrola', initials: 'CI', org: 'Asociación Navarra de Parkinson', country: 'Spain', quote: '“Nos parece un proyecto muy interesante.”', shots: [{ src: W + 'cristina.png', h: 66 }], logo: { src: '/media/partners/fep_color.png', h: 46 } } },
  // TODO before the final: replace with the exact words (and a crop) of the hospital's real email.
  { at: 8.0, clock: 'Fri', item: { kind: 'mail', who: 'Neurology team', initials: 'GM', country: 'Spain', quote: 'A very interesting idea, with a big market opportunity: the need is real.', shots: [], logo: { src: '/media/partners/maranon_color.svg', h: 34 } } },
];
const ALL_IN = 9.2;
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
        {m.logo ? (
          <img src={m.logo.src} alt="" style={{ height: m.logo.h, display: 'block', flex: 'none' }} />
        ) : (
          <div className="display" style={{ width: 40, height: 40, borderRadius: 20, background: TEAL, color: '#fff', fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
            {m.initials}
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="display" style={{ fontSize: 21, fontWeight: 700, color: NAVY, lineHeight: 1.1 }}>
            {m.who}
          </div>
          {m.org && (
            <div className="body" style={{ fontSize: 16, color: INK, marginTop: 2, whiteSpace: 'nowrap' }}>
              {m.org}
            </div>
          )}
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
  const mails = shown.filter((it) => it.item.kind === 'mail').reverse().slice(0, 4); // newest on top; the oldest slides out
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
            {done ? 'A working device. Five replies from Spain, Estonia and Lithuania.' : <Words text="From a box of parts…" delay={0.1} />}
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
            ['5', 'replies'],
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

// ---------- Build 1: what we learned, and the paper we wrote about it ----------
// Left side: one result, said plainly. AUROC 0.91 = given one voice with Parkinson's and one
// without, the model ranks the right one higher 9 times out of 10.
const NINE = { x: 120, w: 1040, top: 270, bottom: 900 };
const ROW_D = 0.7;

/** A round voice icon: filled coral with a white wave (9), or a grey outline (the miss). */
function VoiceDot({ hit, i }: { hit: boolean; i: number }) {
  return (
    <motion.svg
      width={70}
      height={70}
      viewBox="0 0 70 70"
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease, delay: ROW_D + 0.9 + i * 0.09 }}
    >
      <circle cx={35} cy={35} r={hit ? 33 : 32} fill={hit ? CORAL : 'none'} stroke={hit ? 'none' : 'rgba(9,38,52,0.3)'} strokeWidth={2.5} />
      <path
        d="M14 35 L20 35 L24 26 L29 45 L34 20 L39 50 L44 28 L48 40 L51 35 L56 35"
        fill="none"
        stroke={hit ? '#fbf9f5' : 'rgba(9,38,52,0.35)'}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </motion.svg>
  );
}

function NineInTen() {
  const line = { height: 2, background: 'rgba(9,38,52,0.1)' };
  return (
    <div style={{ position: 'absolute', left: NINE.x, top: NINE.top, width: NINE.w, height: NINE.bottom - NINE.top, display: 'flex', flexDirection: 'column' }}>
      <div style={line} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <motion.div style={{ display: 'flex', alignItems: 'baseline', gap: 22 }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease, delay: ROW_D }}>
          <span className="number" style={{ fontSize: 290, lineHeight: 0.82, color: NAVY }}>
            9
          </span>
          <span className="display" style={{ fontSize: 64, fontWeight: 600, color: 'rgba(9,38,52,0.45)' }}>
            in 10
          </span>
        </motion.div>
        <div style={{ display: 'flex', gap: 16, marginTop: 44 }}>
          {Array.from({ length: 10 }, (_, i) => (
            <VoiceDot key={i} i={i} hit={i < 9} />
          ))}
        </div>
        <motion.div className="display" style={{ fontSize: 36, fontWeight: 600, lineHeight: 1.25, color: NAVY, marginTop: 40, maxWidth: 1000 }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease, delay: ROW_D + 2.0 }}>
          Play it one voice with Parkinson’s and one without: it picks the right one 9 times out of 10.
        </motion.div>
        <motion.div className="body" style={{ fontSize: 18, color: 'rgba(9,38,52,0.55)', marginTop: 16 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: ROW_D + 2.5 }}>
          AUROC 0.91 · 107 people · always tested on people the model had never heard
        </motion.div>
      </div>
      <div style={line} />
    </div>
  );
}

// The preprint, set like the studies on the evidence slide.
const PAPER_TITLE = ['Channel-robust speech biomarkers', 'for between-visit monitoring of', 'Parkinson’s disease: confound', 'control, cross-lingual validation', 'and a personal-baseline tracking rule'];
const PAPER_FACTS: [string, string][] = [
  ['14', 'pages'],
  ['4', 'datasets'],
  ['3', 'languages'],
];
const SHEET = { x: 1236, y: 236, w: 564, h: 700 };
const SHEET_D = 0.5;
const ptex = (line: string) => String.raw`\text{${line.replace(/([&%$#_{}])/g, '\\$1')}}`;

prewarmTex(PAPER_TITLE.map(ptex));

function PaperSheet() {
  const roll = { duration: 1.2, ease: [0.45, 0, 0.2, 1] as [number, number, number, number], delay: SHEET_D };
  return (
    <motion.div style={{ position: 'absolute', left: SHEET.x, top: SHEET.y, width: SHEET.w, height: SHEET.h, rotate: 1.2 }}>
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, #fffefb 0%, #fbf8f2 100%)',
          borderRadius: 4,
          boxShadow: '0 30px 60px rgba(9,38,52,0.16), 0 3px 8px rgba(9,38,52,0.07)',
          overflow: 'hidden',
        }}
        initial={{ clipPath: 'inset(0 0 100% 0)' }}
        animate={{ clipPath: 'inset(0 0 0% 0)' }}
        transition={roll}
      >
        <div className="mono" style={{ position: 'absolute', left: 40, top: 38, fontSize: 13, color: CORAL }}>
          Preprint · November 2026
        </div>
        <div style={{ position: 'absolute', left: 40, top: 80, display: 'flex', flexDirection: 'column', gap: 7 }}>
          {PAPER_TITLE.map((line, i) => (
            <DrawnFormula key={i} tex={ptex(line)} size={25} still color={NAVY} />
          ))}
        </div>
        <div className="body" style={{ position: 'absolute', left: 40, right: 40, top: 300, fontSize: 15, color: INK, lineHeight: 1.4 }}>
          Reboll Gómez · de Paz Figueras · García López · Verdú García
        </div>
        {/* The abstract, as a texture: the page is full. */}
        <div style={{ position: 'absolute', left: 40, right: 40, top: 360, display: 'flex', flexDirection: 'column', gap: 11 }}>
          {[1, 0.96, 0.99, 0.93, 1, 0.97, 0.6].map((w, i) => (
            <div key={i} style={{ height: 7, width: `${w * 100}%`, borderRadius: 4, background: 'rgba(9,38,52,0.08)' }} />
          ))}
        </div>
        <div style={{ position: 'absolute', left: 40, right: 40, bottom: 44, display: 'flex', justifyContent: 'space-between', borderTop: '2px solid rgba(9,38,52,0.1)', paddingTop: 26 }}>
          {PAPER_FACTS.map(([n, l]) => (
            <div key={l}>
              <div className="number" style={{ fontSize: 54, lineHeight: 1, color: NAVY }}>
                {n}
              </div>
              <div className="display" style={{ fontSize: 20, fontWeight: 600, color: TEAL, marginTop: 6 }}>
                {l}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

function Learned() {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div style={{ position: 'absolute', left: 120, top: 92 }}>
        <div className="mono" style={{ fontSize: 18, color: NAVY, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ width: 10, height: 10, borderRadius: 5, background: CORAL, display: 'inline-block' }} />
          What we learned
        </div>
        <h2 className="display" style={{ fontSize: 60, color: NAVY, marginTop: 14 }}>
          <Words text="We tested. We learned. We changed." delay={0.15} wordClass={(w) => (w === 'learned.' ? 'coral' : undefined)} />
        </h2>
      </div>
      <NineInTen />
      <PaperSheet />
    </div>
  );
}

function Content() {
  return (
    <div className="content">
      <Weekend />
    </div>
  );
}

function LearnedContent() {
  return (
    <div className="content">
      <Learned />
    </div>
  );
}

export const S17: SlideDef = {
  id: 'S17',
  builds: 1,
  notes:
    "On Thursday we had a box of parts. By one in the morning, a working device. And the replies came in: from Estonia, from Lithuania, from the Navarra Parkinson's Association and from Gregorio Marañón.",
  theme: () => 'light',
  wave: () => ({ shape: wave({ y: 540, amp: 30 }), opacity: 0, duration: 1600, stagger: 0 }),
  bg: () => ({ pool: [0.5, 0.5], poolStrength: 1, warm: 0.6 }),
  Content,
};

/** What we tested, learned and changed — its own slide, right after the weekend. */
export const S17B: SlideDef = {
  id: 'S17B',
  builds: 1,
  notes:
    "We tested, we learned, and we changed. Play it one voice with Parkinson's and one without: it picks the right one nine times out of ten, always on people it had never heard before. All of it, in our paper.",
  theme: () => 'light',
  wave: () => ({ shape: wave({ y: 540, amp: 30 }), opacity: 0, duration: 1600, stagger: 0 }),
  bg: () => ({ pool: [0.5, 0.5], poolStrength: 1, warm: 0.6 }),
  Content: LearnedContent,
};
