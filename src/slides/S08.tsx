import { C } from '../brand/tokens';
import { captured, syntheticAah } from '../audio/mic';
import { spectrogram } from '../audio/spectrum';
import type { SlideDef } from '../deck/types';
import { N } from '../engine/Wave';
import { branches, paintBranches } from '../engine/shapes';
import { DrawnFormula } from '../ui/DrawnFormula';
import { At, Fade, Words } from '../ui/motion';

// ---------- Geometry ----------
const Y0 = 600; // the voice comes in here
const YS = [330, 520, 710, 900]; // one row per step
const XS = 520, XR = 980; // where the strands part / settle
const FX = 1060; // formulas start here, riding above their strand

// ---------- The "aah" itself (the room's, if it was recorded on the demo slide) ----------
let src: { x: Float32Array; period: number; peak: number } | null = null;
let srcFor: Float32Array | null = null;
function voiceSource() {
  const rec = captured.aah;
  if (!src || (rec && rec !== srcFor)) {
    srcFor = rec;
    const sr = rec ? captured.sr : 48000;
    const x = rec ?? syntheticAah(48000, 3);
    const f0 = spectrogram(x, sr, 32, 70, 900).f0 || 190;
    // Robust peak (98th percentile) so one click doesn't flatten the wave.
    const abs = Array.from(x.subarray(0, Math.min(x.length, sr * 3)), Math.abs).sort((a, b) => a - b);
    src = { x, period: sr / f0, peak: abs[Math.floor(abs.length * 0.98)] || 1 };
  }
  return src;
}

const PERIOD_PX = 380; // one vocal cycle on screen: the zoom
/** The zoomed voice, lightly smoothed so its sharp glottal edge doesn't kink the light. */
function voice(x: number, t: number) {
  return (rawVoice(x - 7, t) + 2 * rawVoice(x, t) + rawVoice(x + 7, t)) / 4;
}
function rawVoice(x: number, t: number) {
  const s = voiceSource();
  const span = s.x.length * 0.7;
  const pos = s.x.length * 0.15 + ((((x + t * 70) / PERIOD_PX) * s.period) % span);
  const i = Math.floor(pos), k = pos - i;
  const a = s.x[i] ?? 0, b = s.x[i + 1] ?? 0;
  return Math.max(-1.3, Math.min(1.3, (a * (1 - k) + b * k) / s.peak));
}

// ---------- Each strand's character ----------
const wob = (x: number, t: number) => Math.sin(x * 0.013 + t * 0.7) * 0.6 + Math.sin(x * 0.031 - t * 1.1 + 2) * 0.4;
const CHARACTER = [
  // Quality gate: the clean tone, freed from the noise.
  (x: number, t: number) => Math.sin(x * 0.03 - t * 1.6),
  // Features: the same tone, its cycles slightly irregular (jitter).
  (x: number, t: number) => Math.sin(x * 0.04 - t * 1.9 + 0.75 * wob(x, t)),
  // Personal baseline: the variation settles onto the patient's own line.
  (x: number, t: number) => Math.sin(x * 0.035 - t * 1.4) * Math.exp(-Math.max(0, x - XR) / 380),
  // Change detection: quiet, until a sustained drift accumulates.
  (x: number, t: number) => 0.25 * Math.sin(x * 0.05 - t * 2) + Math.max(0, (x - 1450) / 260) ** 1.6 * (0.8 + 0.2 * Math.sin(t * 0.8)),
];

const TEX = [
  String.raw`\mathrm{SNR}=10\log_{10}\frac{P_{\mathrm{voice}}}{P_{\mathrm{noise}}}\geq 20\,\mathrm{dB}`,
  String.raw`\mathrm{jitter}=\frac{\frac{1}{N-1}\sum_{i}\left|T_i-T_{i+1}\right|}{\frac{1}{N}\sum_{i}T_i}`,
  String.raw`z_{k,t}=\frac{x_{k,t}-\tilde{x}_k}{1.4826\,\mathrm{MAD}_k}`,
  String.raw`C_t=\max\left(0,\;C_{t-1}+D_t-k\right)`,
];
const SIZE = [40, 36, 40, 42];
const LIFT = [118, 128, 112, 92]; // formula top above its strand

function Caption() {
  const isLive = !!captured.aah;
  const s = voiceSource();
  const sr = isLive ? captured.sr : 48000;
  return (
    <div className="mono" style={{ fontSize: 15 }}>
      {isLive ? 'Your “aah”, recorded a minute ago' : 'A sustained “aah”'} · F0 {Math.round(sr / s.period)} Hz
    </div>
  );
}

function Content({ build }: { build: number }) {
  return (
    <div className="content">
      <div className="text-col" style={{ top: 120, width: 820 }}>
        <h2 className="display d-88">
          <Words text="Behind every “aah”." delay={0.4} />
        </h2>
        <Fade delay={1.1}>
          <div style={{ marginTop: 22 }}>
            <Caption />
          </div>
        </Fade>
      </div>

      <At build={build} at={1}>
        <div key="formulas">
          {TEX.map((tex, k) => (
            <div key={k} style={{ position: 'absolute', left: FX, top: YS[k] - LIFT[k] }}>
              <DrawnFormula tex={tex} size={SIZE[k]} delay={1.0 + k * 0.75} duration={2.2} />
            </div>
          ))}
          <Fade delay={4.6} style={{ position: 'absolute', left: 120, top: 1000 }}>
            <div className="mono" style={{ fontSize: 13 }}>
              In today’s prototype the scoring is simulated · this is the pipeline we will validate on clinical data
            </div>
          </Fade>
        </div>
      </At>
    </div>
  );
}

const K = YS.length;
const shape = (open: number) => branches({ y0: Y0, ys: YS, xs: XS, xr: XR, open, voice, character: CHARACTER, amp: 74, ampOpen: 15 });

export const S08: SlideDef = {
  id: 'S08',
  builds: 2,
  // A breath on the zoomed voice, then it opens.
  auto: [2.8],
  notes:
    "Behind every “aah” — this is the one you just recorded — there are four steps. A quality gate rejects bad recordings. We extract the acoustic features the literature validates: jitter, shimmer, harmonics-to-noise, pauses. Each one is compared with the patient's own baseline, not a population average. And a change detector only raises an alert when the drift is sustained. In today's prototype, the scoring is simulated: this is the pipeline we'll validate on clinical data.",
  wave: (b) => ({
    shape: shape(b === 0 ? 0 : 1),
    // Closed: only the first strand shows (the others lie hidden on top of it).
    paint: paintBranches(K, N, XS, (k) => [C.coral, b === 0 && k > 0 ? 0 : 1]),
    core: 1.5,
    glow: 1.05,
    echoes: 0.18,
    opacity: 1,
    duration: b === 0 ? 3000 : 3400,
    stagger: b === 0 ? 0.3 : 0.25,
    dir: 1,
  }),
  bg: () => ({ pool: [0.62, 0.5], poolStrength: 1, warm: 0.5 }),
  Content,
};
