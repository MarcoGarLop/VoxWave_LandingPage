import type { Engine } from '../engine/Engine';
import { preload, preloadImages } from '../media/preload';
import { warmMath } from '../ui/DrawnFormula';

/**
 * Everything heavy happens once, behind the boot screen in index.html: fonts, every
 * image, the formulas, every shader, and the fullscreen clips. Then the deck waits
 * for the presenter, so the first slide opens on cue and runs smoothly.
 */

const FACES = ['400 20px Sora', '600 20px Sora', '700 20px Sora', '400 20px Inter', '500 20px Inter', '500 20px "JetBrains Mono"'];
/** Never hold the room hostage to slow venue Wi-Fi: clips keep loading after this. */
const CLIP_CAP_MS = 15000;

const el = () => document.getElementById('boot');

function setProgress(p: number) {
  const fill = el()?.querySelector<HTMLElement>('.fill');
  if (fill) fill.style.transform = `scaleX(${Math.max(0.02, Math.min(1, p))})`;
}

function setLabel(text: string) {
  const label = el()?.querySelector<HTMLElement>('.label');
  if (label) label.textContent = text;
}

const nextFrame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));

export async function boot(engine: Engine): Promise<void> {
  let done = 0;
  const track = <T>(p: Promise<T>) =>
    p.finally(() => {
      done++;
      setProgress(done / total);
    });

  const clips = preload();
  const images = preloadImages();
  const fonts = Promise.all(FACES.map((f) => document.fonts.load(f).catch(() => []))).then(() => document.fonts.ready);
  const total = clips.length + images.length + 3;

  const clipsDone = Promise.all(clips.map(track));
  await Promise.all([...images.map(track), track(fonts)]);
  // CPU/GPU work one after the other, each after a frame so the bar keeps moving.
  await nextFrame();
  await track(warmMath());
  await nextFrame();
  await track(engine.warm());
  await Promise.race([clipsDone, new Promise((r) => setTimeout(r, CLIP_CAP_MS))]);
  setProgress(1);
}

/** Show "ready" and resolve when the presenter presses a key or clicks. */
export function waitForStart(): Promise<void> {
  const node = el();
  if (!node) return Promise.resolve();
  node.classList.add('ready');
  setLabel('Press any key to begin');
  return new Promise((resolve) => {
    const go = (ev: Event) => {
      // F still toggles fullscreen without starting.
      if (ev instanceof KeyboardEvent && (ev.key === 'f' || ev.key === 'F')) return;
      ev.preventDefault();
      ev.stopImmediatePropagation();
      window.removeEventListener('keydown', go, true);
      window.removeEventListener('pointerdown', go, true);
      resolve();
    };
    window.addEventListener('keydown', go, true);
    window.addEventListener('pointerdown', go, true);
  });
}

export function hideBoot() {
  const node = el();
  if (!node) return;
  node.classList.add('out');
  window.setTimeout(() => node.remove(), 1000);
}

/** While the boot screen is up, the deck ignores navigation keys. */
export function bootBlocksKeys(ev: KeyboardEvent) {
  return !!el() && !el()!.classList.contains('out') && ev.key !== 'f' && ev.key !== 'F';
}
