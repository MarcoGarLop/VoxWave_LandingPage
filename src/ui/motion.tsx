import { AnimatePresence, motion, type MotionStyle } from 'motion/react';
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { easeOut as easeOutCurve } from '../engine/math';
import { EASE, T } from '../brand/tokens';

const ease = EASE as unknown as [number, number, number, number];

/**
 * Headline that rises word by word out of a mask, clearing a light blur.
 * `delay` is in seconds.
 */
export function Words({
  text,
  className,
  style,
  delay = 0,
  stagger = T.wordStagger / 1000,
  wordClass,
}: {
  text: string;
  className?: string;
  style?: CSSProperties;
  delay?: number;
  stagger?: number;
  wordClass?: (word: string, i: number) => string | undefined;
}) {
  const words = text.split(' ');
  return (
    <span className={className} style={{ display: 'block', ...style }}>
      {words.map((w, i) => (
        <span className="word-mask" key={i}>
          <motion.span
            className={['word', wordClass?.(w, i)].filter(Boolean).join(' ')}
            initial={{ y: '105%', opacity: 0, filter: 'blur(10px)' }}
            animate={{ y: '0%', opacity: 1, filter: 'blur(0px)' }}
            exit={{ y: '-30%', opacity: 0, filter: 'blur(8px)', transition: { duration: T.textOut / 1000, ease } }}
            transition={{ duration: T.textIn / 1000, ease, delay: delay + i * stagger }}
          >
            {w}
          </motion.span>
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </span>
  );
}

/** Soft fade + rise for secondary elements. */
export function Fade({
  children,
  delay = 0,
  y = 16,
  className,
  style,
  dim = false,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  style?: MotionStyle;
  /** When true the element steps back (an earlier build). */
  dim?: boolean;
}) {
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y, filter: 'blur(8px)' }}
      animate={{ opacity: dim ? 0.3 : 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -10, filter: 'blur(6px)', transition: { duration: T.textOut / 1000, ease } }}
      transition={{ duration: T.textIn / 1000, ease, delay }}
    >
      {children}
    </motion.div>
  );
}

/** Shows its children from build `at` onwards, animating in and out. */
export function At({ build, at, until, children }: { build: number; at: number; until?: number; children: ReactNode }) {
  const visible = build >= at && (until === undefined || build < until);
  return <AnimatePresence>{visible && children}</AnimatePresence>;
}

/** A thin vertical marker that draws itself, with a mono label. */
export function Marker({
  x,
  y,
  height = 96,
  label,
  labelSide = 'below',
  delay = 0,
  color = 'rgba(241,237,228,0.45)',
  size = 16,
}: {
  size?: number;
  x: number;
  y: number;
  height?: number;
  label: string;
  labelSide?: 'above' | 'below';
  delay?: number;
  color?: string;
}) {
  return (
    <motion.div
      style={{ position: 'absolute', left: x, top: y - height / 2, width: 0, height }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: T.textOut / 1000, ease } }}
      transition={{ duration: 0.6, delay }}
    >
      <motion.div
        style={{ position: 'absolute', left: 0, top: 0, width: 1, height, background: color, transformOrigin: '50% 50%' }}
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 1.1, ease, delay }}
      />
      <motion.div
        className="mono"
        style={{
          position: 'absolute',
          left: 0,
          whiteSpace: 'nowrap',
          fontSize: size,
          [labelSide === 'below' ? 'top' : 'bottom']: height + 16,
        }}
        initial={{ opacity: 0, x: '-50%', y: labelSide === 'below' ? -6 : 6 }}
        animate={{ opacity: 1, x: '-50%', y: 0 }}
        transition={{ duration: 0.9, ease, delay: delay + 0.4 }}
      >
        {label}
      </motion.div>
    </motion.div>
  );
}

/**
 * A number that counts up to its value (ease-out), with tabular digits so the
 * width never jitters. `format` turns the running value into text.
 */
export function Counter({
  to,
  from = 0,
  duration = 1.8,
  delay = 0,
  format,
  className,
  style,
}: {
  to: number;
  from?: number;
  duration?: number;
  delay?: number;
  format: (v: number) => string;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  // The formatter may be a fresh closure on every render: never restart the count for it.
  const fmt = useRef(format);
  fmt.current = format;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const t0 = performance.now() + delay * 1000;
    const tick = (now: number) => {
      const p = Math.min(1, Math.max(0, (now - t0) / (duration * 1000)));
      el.textContent = fmt.current(from + (to - from) * easeOutCurve(p));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    el.textContent = fmt.current(from);
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, from, duration, delay]);
  return <span ref={ref} className={className} style={style} />;
}
