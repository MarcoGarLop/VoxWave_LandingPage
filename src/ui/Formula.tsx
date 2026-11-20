import katex from 'katex';
import 'katex/dist/katex.min.css';
import { motion } from 'motion/react';
import { useMemo } from 'react';
import { EASE } from '../brand/tokens';

const ease = EASE as unknown as [number, number, number, number];

/** A KaTeX formula that "writes itself": revealed left to right behind a soft wipe. */
export function Formula({ tex, delay = 0, size = 30 }: { tex: string; delay?: number; size?: number }) {
  const html = useMemo(() => katex.renderToString(tex, { throwOnError: false, displayMode: false, output: 'html' }), [tex]);
  return (
    <motion.div
      style={{ fontSize: size, color: 'var(--paper)', whiteSpace: 'nowrap', display: 'inline-block' }}
      initial={{ clipPath: 'inset(-20% 100% -20% 0)', opacity: 0.4 }}
      animate={{ clipPath: 'inset(-20% 0% -20% 0)', opacity: 1 }}
      transition={{ duration: 1.8, ease, delay }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
