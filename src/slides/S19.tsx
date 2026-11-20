import { C } from '../brand/tokens';
import type { SlideDef } from '../deck/types';
import { paintRows } from '../engine/paint';
import { fork } from '../engine/shapes';
import { Counter, Fade, Words } from '../ui/motion';

function Content() {
  return (
    <div className="content">
      <div className="text-col" style={{ top: 150, width: 1500 }}>
        <div className="mono" style={{ fontSize: 15, color: 'var(--coral)' }}>
          Next
        </div>
        <h2 className="display" style={{ fontSize: 120, marginTop: 14 }}>
          <Words text="Parkinson’s is only the beginning." delay={0.4} />
        </h2>
      </div>
      <div style={{ position: 'absolute', left: 120, top: 760, display: 'flex', gap: 100, alignItems: 'flex-end' }}>
        <Fade delay={2.6}>
          <div className="mono" style={{ fontSize: 14, color: 'var(--paper)' }}>Stroke</div>
          <div className="number" style={{ fontSize: 80, marginTop: 6 }}>
            <Counter to={12} duration={1.6} delay={2.8} format={(v) => `${Math.round(v)}M`} />
          </div>
          <div className="mono" style={{ fontSize: 13, marginTop: 6 }}>new cases a year · WSO 2022</div>
        </Fade>
        <Fade delay={3.4}>
          <div className="number" style={{ fontSize: 80 }}>up to 4 in 10</div>
          <div className="mono" style={{ fontSize: 13, marginTop: 6 }}>survivors lose part of their speech (20–42% dysarthria)</div>
        </Fade>
        <Fade delay={4.4}>
          <div className="display coral" style={{ fontSize: 46, lineHeight: 1.1 }}>
            Same voice.
            <br />
            Same baseline.
            <br />
            Next disease.
          </div>
        </Fade>
      </div>
      <Fade delay={5.2} style={{ position: 'absolute', left: 120, top: 990 }}>
        <div className="mono" style={{ fontSize: 12 }}>
          Research already shows AI can hear a stroke in the voice (pilot studies, preliminary) · a line of work we will develop and validate
        </div>
      </Fade>
    </div>
  );
}

export const S19: SlideDef = {
  id: 'S19',
  builds: 1,
  notes:
    'And Parkinson’s is only the beginning. Every year, twelve million people have a stroke, and up to four in ten survivors lose part of their speech. Research already shows that AI can hear a stroke in the voice. Same voice, same baseline, next disease.',
  // From the crowd, one thread splits into two: Parkinson's (coral) and stroke (paper).
  wave: () => ({
    shape: fork({ x0: -40, x1: 1960, y: 600, spread: 90, at: 0.3, amp: 26 }),
    paint: paintRows(2, (r) => (r === 0 ? [C.coral, 1] : [C.paper, 0.85])),
    core: 1.6,
    glow: 1,
    echoes: 0.25,
    duration: 3400,
    stagger: 0.4,
    dir: 1,
  }),
  particles: () => null,
  bg: () => ({ pool: [0.6, 0.55], poolStrength: 1, warm: 0.7 }),
  Content,
};
