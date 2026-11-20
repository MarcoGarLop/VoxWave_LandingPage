import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { H, W } from '../brand/tokens';
import { Engine } from '../engine/Engine';
import { slides } from '../slides';
import { AdvanceContext, EngineContext } from './engineContext';
import { mic } from '../audio/mic';
import { preload } from '../media/preload';

/** Default seconds a build stays before the next plays by itself. */
const DEFAULT_HOLD = 6;

interface Pos {
  i: number;
  b: number;
}

function readHash(): Pos {
  const m = location.hash.match(/^#(\d+)(?:\.(\d+))?$/);
  if (!m) return { i: 0, b: 0 };
  const i = Math.min(slides.length - 1, Math.max(0, parseInt(m[1], 10) - 1));
  const b = Math.min(slides[i].builds - 1, Math.max(0, parseInt(m[2] ?? '0', 10)));
  return { i, b };
}

/** Fit the 1920x1080 stage into the window (letterboxed). */
function useStageScale() {
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const fit = () => setScale(Math.min(window.innerWidth / W, window.innerHeight / H));
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);
  return scale;
}

export function Deck() {
  const scale = useStageScale();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const [pos, setPos] = useState<Pos>(readHash);
  const [blackout, setBlackout] = useState(false);
  const first = useRef(true);
  const prevPos = useRef<Pos>(pos);

  // Engine lifecycle.
  useEffect(() => {
    const engine = new Engine(canvasRef.current!);
    engineRef.current = engine;
    if (import.meta.env.DEV) (window as unknown as { __engine: Engine }).__engine = engine;
    engine.background.loadAtmosphere('/media/atmosphere/haze.mp4', '/media/atmosphere/plate.jpg');
    engine.start();
    preload();
    return () => engine.dispose();
  }, []);

  // Drawing-buffer size follows the on-screen size of the stage (capped for laptops).
  useEffect(() => {
    const e = engineRef.current;
    if (!e) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const pxW = Math.min(2560, Math.round(W * scale * dpr));
    e.resize(pxW, Math.round((pxW * H) / W));
  }, [scale]);

  // Send the target state of the current slide/build to the engine.
  useEffect(() => {
    const e = engineRef.current;
    if (!e) return;
    const s = slides[pos.i];
    const p0 = prevPos.current;
    const forward = pos.i > p0.i || (pos.i === p0.i && pos.b > p0.b);
    e.setWave(s.wave(pos.b), first.current);
    const ps = s.particles?.(pos.b) ?? null;
    e.setParticles(ps?.state ?? null, {
      seed: ps?.seed && forward && !first.current ? ps.seed : undefined,
      instant: first.current,
    });
    e.setDevice(s.device?.(pos.b) ?? null, first.current);
    if (p0.i !== pos.i) slides[p0.i].onLeave?.();
    prevPos.current = pos;
    if (s.bg) e.setBackground({ ...s.bg(pos.b), ...(first.current ? { duration: 1 } : {}) });
    first.current = false;
    history.replaceState(null, '', `#${pos.i + 1}.${pos.b}`);
  }, [pos]);

  // Builds inside a slide play by themselves: one click = one whole slide.
  useEffect(() => {
    const s = slides[pos.i];
    if (pos.b >= s.builds - 1) return;
    const hold = s.auto?.[pos.b] ?? DEFAULT_HOLD;
    if (hold === Infinity) return; // the slide advances itself (useAdvance)
    const id = window.setTimeout(() => setPos((p) => (p.i === pos.i && p.b === pos.b ? { i: p.i, b: p.b + 1 } : p)), hold * 1000);
    return () => window.clearTimeout(id);
  }, [pos]);

  const next = useCallback(() => {
    setPos((p) => (p.i < slides.length - 1 ? { i: p.i + 1, b: 0 } : p));
  }, []);

  /** Going back replays the previous slide from its start. */
  const prev = useCallback(() => {
    setPos((p) => (p.i > 0 ? { i: p.i - 1, b: 0 } : { i: 0, b: 0 }));
  }, []);

  /** Rehearsal only (Shift + arrows): step through builds by hand. */
  const stepBuild = useCallback((dir: 1 | -1) => {
    setPos((p) => {
      const b = p.b + dir;
      if (b >= 0 && b < slides[p.i].builds) return { i: p.i, b };
      return dir > 0 ? (p.i < slides.length - 1 ? { i: p.i + 1, b: 0 } : p) : p.i > 0 ? { i: p.i - 1, b: slides[p.i - 1].builds - 1 } : p;
    });
  }, []);

  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (ev.repeat) return;
      const k = ev.key;
      if (ev.shiftKey && (k === 'ArrowRight' || k === 'ArrowLeft')) {
        ev.preventDefault();
        stepBuild(k === 'ArrowRight' ? 1 : -1);
      } else if (['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Enter'].includes(k)) {
        ev.preventDefault();
        next();
      } else if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'].includes(k)) {
        ev.preventDefault();
        prev();
      } else if (k === 'Home') {
        setPos({ i: 0, b: 0 });
      } else if (k === 'End') {
        setPos({ i: slides.length - 1, b: slides[slides.length - 1].builds - 1 });
      } else if (k === 'f' || k === 'F') {
        if (document.fullscreenElement) document.exitFullscreen();
        else document.documentElement.requestFullscreen().catch(() => {});
      } else if (k === 'm' || k === 'M') {
        if (mic.active) mic.stop();
        else mic.start();
      } else if (k === 'b' || k === 'B' || k === '.') {
        setBlackout((v) => !v);
      } else if (/^[0-9]$/.test(k)) {
        const n = (k === '0' ? 10 : parseInt(k, 10)) + (ev.shiftKey ? 10 : 0);
        if (n <= slides.length) setPos({ i: n - 1, b: 0 });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev, stepBuild]);

  /** Next build of the current slide, requested by the slide's own content. */
  const advance = useCallback(() => {
    setPos((p) => (p.b < slides[p.i].builds - 1 ? { i: p.i, b: p.b + 1 } : p));
  }, []);

  const slide = slides[pos.i];
  const Content = slide.Content;
  const theme = slide.theme?.(pos.b) ?? 'dark';

  return (
    <div className="viewport">
      <div className={`stage theme-${theme}`} style={{ transform: `translate(-50%, -50%) scale(${scale})`, transformOrigin: '50% 50%' }}>
        <canvas ref={canvasRef} className="engine" />
        {/* The page tone: paper dawns from the centre; black fades in. */}
        <div className="tone tone-paper" data-on={theme === 'light'} />
        <div className="tone tone-black" data-on={theme === 'black'} />
        <EngineContext.Provider value={engineRef}>
        <AdvanceContext.Provider value={advance}>
        <div className="layer">
          <AnimatePresence mode="wait">
            <motion.div key={slide.id} className="layer" exit={{ opacity: 1 }} transition={{ duration: 0.5 }}>
              <Content build={pos.b} />
            </motion.div>
          </AnimatePresence>
        </div>
        </AdvanceContext.Provider>
        </EngineContext.Provider>
        <div className="vignette" />
        <div className="grain" />
        <div className="blackout" style={{ opacity: blackout ? 1 : 0 }} />
      </div>
    </div>
  );
}
