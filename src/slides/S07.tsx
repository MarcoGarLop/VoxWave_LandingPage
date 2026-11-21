import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { C, EASE } from '../brand/tokens';
import { useAdvance, useEngine } from '../deck/engineContext';
import type { SlideDef } from '../deck/types';
import { wave } from '../engine/shapes';
import { media } from '../media/preload';
import { At, Words } from '../ui/motion';

const ease = EASE as unknown as [number, number, number, number];

// Video frames are 1920x1068, shown "cover" in the 1920x1080 stage.
const K = 1080 / 1068;
const OX = (1920 - 1920 * K) / 2;
const v2s = ([x, y]: [number, number]): [number, number] => [x * K + OX, y * K];

// Where each part rests at the end of the exploded view (video px).
const PARTS: { at: [number, number]; side: 'l' | 'r'; title: string; body: string }[] = [
  { at: [812, 205], side: 'l', title: 'Tactile button', body: 'One press starts the session' },
  { at: [736, 446], side: 'l', title: 'Lavalier microphone', body: 'Close to the voice, USB' },
  { at: [746, 716], side: 'l', title: 'Slim power bank', body: 'Inside the case, no cables' },
  { at: [1130, 352], side: 'r', title: '1.3″ OLED screen', body: 'Guides each exercise' },
  { at: [1215, 510], side: 'r', title: 'ESP32 microprocessor', body: 'Records and stores sessions offline' },
  { at: [1270, 800], side: 'r', title: '3D-printed case', body: '7 × 12 × 4 cm' },
];
const COL_L = 600, COL_R = 1330;
/** Seconds the labelled exploded view stays before reassembling. */
const LABEL_HOLD = 5;
/** Playback speeds: the opening clip, and the reassembly. */
const RATE_OPEN = 1.4, RATE_CLOSE = 2.2;
/** Clip time (s) of the reassembly at which the fade to black starts: during the final push-in. */
const FADE_AT = 7.0;

/** Keeps the WebGL engine asleep while a fullscreen clip covers it. */
function useSuspend(on: boolean) {
  const eng = useEngine();
  useEffect(() => {
    const e = eng?.current;
    if (!e || !on) return;
    return e.hold();
  }, [eng, on]);
}

/**
 * Starts a clip and keeps it going: retries play() if the browser refuses or stalls it
 * (entering fullscreen, a busy GPU, a slow decoder). Never throws.
 */
function useKeepPlaying(ref: React.RefObject<HTMLVideoElement>, rate: number) {
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    let tries = 0;
    let timer = 0;
    const kick = () => {
      if (!v || v.ended) return;
      v.playbackRate = rate;
      v.play().catch(() => {
        if (tries++ < 6) timer = window.setTimeout(kick, 350);
      });
    };
    const nudge = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (!v.ended && (v.paused || v.readyState < 3)) kick();
      }, 600);
    };
    v.currentTime = 0;
    kick();
    v.addEventListener('stalled', nudge);
    v.addEventListener('waiting', nudge);
    v.addEventListener('pause', nudge);
    return () => {
      window.clearTimeout(timer);
      v.removeEventListener('stalled', nudge);
      v.removeEventListener('waiting', nudge);
      v.removeEventListener('pause', nudge);
    };
  }, [ref, rate]);
}

/** Seconds each clip should take at its playback speed (15.08 s and 10.04 s long). */
const OPEN_SECONDS = 15.08 / RATE_OPEN; // ≈ 10.8 s
const FADE_SECONDS = FADE_AT / RATE_CLOSE; // ≈ 3.2 s

/** A fullscreen sentence, white on black. */
function Statement({ text, size, top, delay = 0.6, weight }: { text: string; size: number; top: number; delay?: number; weight?: number }) {
  return (
    <div style={{ position: 'absolute', left: 160, right: 160, top, textAlign: 'center' }}>
      <h2 className="display" style={{ fontSize: size, lineHeight: 1.08, fontWeight: weight, color: '#fff' }}>
        <Words text={text} delay={delay} stagger={0.09} />
      </h2>
    </div>
  );
}

/** Line + dot + caption for one part; the line draws out from the part. */
function Label({ i, p }: { i: number; p: (typeof PARTS)[number] }) {
  const [x, y] = v2s(p.at);
  const left = p.side === 'l';
  const x2 = left ? COL_L : COL_R;
  const d = 0.2 + i * 0.14;
  return (
    <>
      <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none' }}>
        <motion.circle cx={x} cy={y} r={5} fill={C.coral} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.6, ease, delay: d }} />
        <motion.circle cx={x} cy={y} r={14} fill="none" stroke={C.coral} strokeWidth={1} initial={{ scale: 0.3, opacity: 0 }} animate={{ scale: 1, opacity: [0, 0.8, 0] }} transition={{ duration: 1.4, ease, delay: d }} />
      </svg>
      <motion.div
        style={{ position: 'absolute', top: y, left: left ? x2 : x + 10, width: Math.abs(x - x2) - 10, height: 1, background: 'rgba(241,237,228,0.55)', transformOrigin: left ? '100% 50%' : '0% 50%' }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.9, ease, delay: d + 0.1 }}
      />
      <motion.div
        style={{ position: 'absolute', top: y - 34, left: left ? undefined : x2 + 18, right: left ? 1920 - x2 + 18 : undefined, textAlign: left ? 'right' : 'left', whiteSpace: 'nowrap' }}
        initial={{ opacity: 0, x: left ? 10 : -10, filter: 'blur(6px)' }}
        animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.9, ease, delay: d + 0.45 }}
      >
        <div className="display" style={{ fontSize: 28, lineHeight: 1.15 }}>
          {p.title}
        </div>
        <div className="mono" style={{ fontSize: 13, marginTop: 8 }}>
          {p.body}
        </div>
      </motion.div>
    </>
  );
}

/** Build 1: the device appears and comes apart, one continuous clip; parts and price when it rests. */
function Explode() {
  const ref = useRef<HTMLVideoElement>(null);
  const [rest, setRest] = useState(false);
  const advance = useAdvance();
  // Resolved once: swapping the src mid-play would reload the clip.
  const [src] = useState(() => media('/media/device/device.mp4'));
  useSuspend(true);
  useEffect(() => {
    if (!rest) return;
    const id = window.setTimeout(advance, LABEL_HOLD * 1000);
    return () => window.clearTimeout(id);
  }, [rest, advance]);
  useKeepPlaying(ref, RATE_OPEN);
  // Safety net: if the clip never reports its end, show the parts anyway.
  useEffect(() => {
    const id = window.setTimeout(() => setRest(true), (OPEN_SECONDS + 3) * 1000);
    return () => window.clearTimeout(id);
  }, []);
  return (
    <motion.div style={{ position: 'absolute', inset: 0 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.3 } }} transition={{ duration: 1.4, ease }}>
      <video
        ref={ref}
        src={src}
        autoPlay
        poster="/media/device/hero_first.jpg"
        muted
        playsInline
        preload="auto"
        onEnded={() => setRest(true)}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
      />
      {/* While it opens: the answer to the question. */}
      <motion.div
        style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(4,20,28,0.88) 0%, rgba(4,20,28,0.45) 34%, rgba(4,20,28,0) 56%)' }}
        animate={{ opacity: rest ? 0 : 1 }}
        transition={{ duration: 1.4, ease }}
      />
      <motion.div className="text-col" style={{ top: 170 }} animate={{ opacity: rest ? 0 : 1, y: rest ? -12 : 0 }} transition={{ duration: 0.9, ease }}>
        <h2 className="display d-88">
          <Words text="We thought of them." delay={1.0} />
        </h2>
      </motion.div>
      {rest && (
        <>
          {PARTS.map((p, i) => (
            <Label key={p.title} i={i} p={p} />
          ))}
          <motion.div
            style={{ position: 'absolute', left: 120, bottom: 96 }}
            initial={{ opacity: 0, y: 14, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 1.1, ease, delay: 1.3 }}
          >
            <div className="number coral" style={{ fontSize: 96, lineHeight: 1 }}>
              ≈ €30
            </div>
            <div className="mono" style={{ fontSize: 14, marginTop: 12 }}>
              in parts · one button · no app · no internet
            </div>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}

/** Build 2: it reassembles, holds for a breath, then fades to black. */
function Reassemble() {
  const ref = useRef<HTMLVideoElement>(null);
  const gone = useRef(false);
  const advance = useAdvance();
  const [src] = useState(() => media('/media/device/device_rev.mp4'));
  useSuspend(true);
  useKeepPlaying(ref, RATE_CLOSE);
  // The fade to black starts while the camera is still pushing in on the closed device.
  const fade = () => {
    if (gone.current) return;
    gone.current = true;
    advance();
  };
  // Safety net: if the clip stalls, still move on to "…and we built it."
  useEffect(() => {
    const id = window.setTimeout(fade, (FADE_SECONDS + 2.5) * 1000);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <motion.div style={{ position: 'absolute', inset: 0 }} initial={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 1.0, ease: [0.65, 0, 0.35, 1] } }}>
      <video
        ref={ref}
        src={src}
        autoPlay
        poster="/media/device/explode_last.jpg"
        muted
        playsInline
        preload="auto"
        onTimeUpdate={(e) => e.currentTarget.currentTime >= FADE_AT && fade()}
        onEnded={fade}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
      />
    </motion.div>
  );
}

function Content({ build }: { build: number }) {
  return (
    <div className="content">
      <At build={build} at={0} until={1}>
        <div key="q">
          <Statement text="What about elderly people in rural areas, or with connection issues…" size={72} top={400} delay={0.7} />
        </div>
      </At>
      <At build={build} at={1} until={2}>
        <Explode key="explode" />
      </At>
      <At build={build} at={2} until={3}>
        <Reassemble key="reassemble" />
      </At>
      <At build={build} at={3}>
        <div key="built">
          <Statement text="…and we built it." size={150} top={420} delay={0.9} weight={700} />
        </div>
      </At>
    </div>
  );
}

export const S07: SlideDef = {
  id: 'S07',
  builds: 4,
  // The question holds for a breath; then the clips drive the rhythm themselves.
  auto: [3.6, Infinity, Infinity],
  notes:
    "But what about people in rural areas, or with no internet? [device] We thought of them too. One button, a screen, a microphone and a battery. About thirty euros of parts, and no connection needed: sessions sync at each check-up. [black] …and we built it. [ENTER → live demo]",
  theme: (b) => (b === 0 || b === 3 ? 'black' : 'dark'),
  // "…and we built it." → Enter opens the live clinician dashboard.
  link: (b) => (b === 3 ? 'https://vox-wave-demo.vercel.app/clinic/dashboard' : undefined),
  wave: () => ({ shape: wave({ y: 900, amp: 26 }), opacity: 0, duration: 1600, stagger: 0 }),
  bg: () => ({ pool: [0.5, 0.55], poolStrength: 1.1, warm: 0.6 }),
  Content,
};
