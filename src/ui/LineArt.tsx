import { useEffect, useRef } from 'react';

/**
 * Minimal line drawings that trace themselves (one stroke after another).
 * Coral strokes are the accent; the rest is paper.
 */
function useTrace(delay: number, duration: number) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    const els = Array.from(svg.querySelectorAll<SVGGeometryElement>('path'));
    const per = duration / Math.max(1, els.length) * 1.8;
    const ids: number[] = [];
    els.forEach((el, i) => {
      el.setAttribute('pathLength', '1');
      el.style.strokeDasharray = '1';
      el.style.strokeDashoffset = '1';
      el.style.transition = 'none';
      ids.push(
        window.setTimeout(() => {
          el.style.transition = `stroke-dashoffset ${per}s cubic-bezier(.65,0,.35,1)`;
          el.style.strokeDashoffset = '0';
        }, (delay + (i / Math.max(1, els.length - 1)) * (duration - per)) * 1000 + 30),
      );
    });
    return () => ids.forEach((id) => window.clearTimeout(id));
  }, [delay, duration]);
  return ref;
}

const ink = { fill: 'none', stroke: 'rgba(241,237,228,0.85)', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
const accent = { ...ink, stroke: '#FF6E42' } as const;

export function PapersArt({ size = 120, delay = 0 }: { size?: number; delay?: number }) {
  const ref = useTrace(delay, 2.2);
  return (
    <svg ref={ref} width={size} height={size * 0.85} viewBox="0 0 120 102" style={{ overflow: 'visible' }}>
      {/* the sheet behind */}
      <path {...ink} strokeOpacity={0.5} d="M38 8 H86 L100 22 V80" />
      {/* the front sheet with its folded corner */}
      <path {...ink} d="M22 20 H72 L86 34 V96 H22 Z" />
      <path {...ink} d="M72 20 V34 H86" />
      {/* a voice on the page */}
      <path {...accent} d="M31 50 C35 42, 39 42, 43 50 S51 58, 55 50 S63 42, 67 50 S73 56, 77 50" />
      {/* lines of text */}
      <path {...ink} strokeOpacity={0.6} d="M31 66 H77" />
      <path {...ink} strokeOpacity={0.6} d="M31 75 H77" />
      <path {...ink} strokeOpacity={0.6} d="M31 84 H62" />
    </svg>
  );
}

export function HospitalArt({ size = 120, delay = 0 }: { size?: number; delay?: number }) {
  const ref = useTrace(delay, 2.2);
  return (
    <svg ref={ref} width={size} height={size * 0.85} viewBox="0 0 120 102" style={{ overflow: 'visible' }}>
      {/* ground */}
      <path {...ink} strokeOpacity={0.5} d="M6 96 H114" />
      {/* main wing */}
      <path {...ink} d="M20 96 V44 H100 V96" />
      {/* central block */}
      <path {...ink} d="M42 44 V16 H78 V44" />
      {/* the cross */}
      <path {...accent} d="M60 21 V37" />
      <path {...accent} d="M52 29 H68" />
      {/* windows */}
      <path {...ink} strokeOpacity={0.6} d="M29 56 H37 M29 68 H37 M83 56 H91 M83 68 H91" />
      {/* door */}
      <path {...ink} d="M52 96 V76 H68 V96" />
    </svg>
  );
}
