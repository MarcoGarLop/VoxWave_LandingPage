import { mathjax } from 'mathjax-full/js/mathjax.js';
import { TeX } from 'mathjax-full/js/input/tex.js';
import { SVG } from 'mathjax-full/js/output/svg.js';
import { liteAdaptor } from 'mathjax-full/js/adaptors/liteAdaptor.js';
import { RegisterHTMLHandler } from 'mathjax-full/js/handlers/html.js';
import { useEffect, useMemo, useRef } from 'react';

// TeX -> pure SVG paths, offline (no fonts, no network).
const adaptor = liteAdaptor();
RegisterHTMLHandler(adaptor);
const doc = mathjax.document('', {
  InputJax: new TeX({ packages: ['base', 'ams'] }),
  OutputJax: new SVG({ fontCache: 'none' }),
});
const cache = new Map<string, string>();
function tex2svg(tex: string) {
  let s = cache.get(tex);
  if (!s) {
    s = adaptor.innerHTML(doc.convert(tex, { display: false }) as never);
    cache.set(tex, s);
  }
  return s;
}

/**
 * Slides register their formulas when they load; the boot screen typesets them
 * all, so no slide stalls on MathJax the first time it appears.
 */
const queued: string[] = [];
export function prewarmTex(list: string[]) {
  queued.push(...list);
}
export async function warmMath() {
  while (queued.length) {
    try {
      tex2svg(queued.shift()!);
    } catch {
      /* a bad formula shows up on its slide, not here */
    }
    await new Promise((r) => setTimeout(r, 0));
  }
}

/**
 * A formula that draws itself by hand: every glyph is traced as a thin line,
 * stroke by stroke, then fills in with ink.
 */
export function DrawnFormula({
  tex,
  size = 36,
  delay = 0,
  duration = 2.4,
  color = 'var(--paper)',
  still = false,
}: {
  /** Render already written (no tracing), e.g. text printed on a sheet. */
  still?: boolean;
  tex: string;
  size?: number;
  delay?: number;
  /** Seconds for the whole formula to be traced. */
  duration?: number;
  color?: string;
}) {
  const html = useMemo(() => tex2svg(tex), [tex]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const shapes = Array.from(root.querySelectorAll<SVGGeometryElement>('path, rect, line'));
    if (still) {
      shapes.forEach((el) => {
        el.style.fill = 'currentColor';
        el.style.stroke = 'none';
      });
      return;
    }
    // Order glyphs left to right, the way a hand writes.
    const xs = shapes.map((el) => {
      try {
        return el.getBoundingClientRect().left;
      } catch {
        return 0;
      }
    });
    const order = shapes.map((_, i) => i).sort((a, b) => xs[a] - xs[b]);
    const n = shapes.length;
    const per = Math.max(0.25, duration * 0.42);
    const timers: number[] = [];
    order.forEach((idx, k) => {
      const el = shapes[idx];
      const start = delay + (n > 1 ? (k / (n - 1)) * (duration - per) : 0);
      el.setAttribute('pathLength', '1');
      el.style.fill = 'currentColor';
      el.style.fillOpacity = '0';
      el.style.stroke = 'currentColor';
      el.style.strokeWidth = '1.1px';
      el.style.setProperty('vector-effect', 'non-scaling-stroke');
      el.style.strokeDasharray = '1';
      el.style.strokeDashoffset = '1';
      el.style.strokeLinecap = 'round';
      el.style.strokeLinejoin = 'round';
      el.style.transition = 'none';
      timers.push(
        window.setTimeout(() => {
          el.style.transition = `stroke-dashoffset ${per}s cubic-bezier(.65,0,.35,1), fill-opacity ${per * 0.9}s ease ${per * 0.55}s, stroke-opacity ${per}s ease ${per * 0.8}s`;
          el.style.strokeDashoffset = '0';
          el.style.fillOpacity = '1';
          el.style.strokeOpacity = '0.35';
        }, start * 1000 + 30),
      );
    });
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [html, delay, duration, still]);

  return (
    <div
      ref={ref}
      className="drawn-formula"
      style={{ fontSize: size, color, lineHeight: 1, display: 'inline-block' }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
