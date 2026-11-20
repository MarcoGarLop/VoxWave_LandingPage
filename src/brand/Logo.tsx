import { motion } from 'motion/react';
import { C, EASE } from './tokens';
import { symbolLeft, symbolMid, symbolRight, wordVox, wordWave } from './logoPaths';

const ease = EASE as unknown as [number, number, number, number];

/**
 * VoxWave logo for dark backgrounds: the three strokes (paper · coral · light teal)
 * draw in one after another, then the wordmark appears.
 */
export function Logo({ width = 640, delay = 0, tone = 'dark' }: { width?: number; delay?: number; tone?: 'dark' | 'light' }) {
  // On paper the logo takes its original colours (navy · coral · teal).
  const ink = tone === 'light' ? C.navy : C.paper;
  const blue = tone === 'light' ? C.teal : C.tealBright;
  const strokes = [
    { d: symbolLeft, fill: ink },
    { d: symbolMid, fill: C.coral },
    { d: symbolRight, fill: blue },
  ];
  return (
    <svg viewBox="130 330 1000 610" width={width} style={{ overflow: 'visible' }}>
      <defs>
        {strokes.map((_, i) => (
          <clipPath key={i} id={`lg-clip-${tone}-${i}`}>
            <motion.rect
              x={130}
              y={330}
              height={420}
              initial={{ width: 0 }}
              animate={{ width: 1000 }}
              transition={{ duration: 1.6, ease, delay: delay + i * 0.45 }}
            />
          </clipPath>
        ))}
      </defs>
      {strokes.map((s, i) => (
        <g key={i} clipPath={`url(#lg-clip-${tone}-${i})`}>
          <path d={s.d} fill={s.fill} />
        </g>
      ))}
      <motion.g initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, ease, delay: delay + 1.6 }}>
        <path d={wordVox} fill={ink} />
        <path d={wordWave} fill={blue} />
      </motion.g>
    </svg>
  );
}
