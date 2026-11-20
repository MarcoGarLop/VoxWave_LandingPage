// Brand tokens shared by the WebGL engine and the DOM layer.
export const C = {
  abyss: '#04141C',
  navy: '#092634',
  teal: '#004E72',
  tealBright: '#2F9BCB',
  coral: '#FF6E42',
  coralSoft: '#FF9A7A',
  coralHot: '#FFD9C9',
  paper: '#F1EDE4',
  muted: '#5E7480',
} as const;

/** Design space. Every slide is composed at 1920x1080 and scaled to fit. */
export const W = 1920;
export const H = 1080;

/** Resting height of the wave (65% of the frame). */
export const WAVE_Y = Math.round(H * 0.65);

/** Default easing for the whole pitch: fast start, long soft landing. */
export const EASE = [0.22, 1, 0.36, 1] as const;

/** Timings (ms). Deliberately unhurried: the jury must see every move. */
export const T = {
  wordStagger: 55,
  textIn: 780,
  textOut: 380,
  morph: 2200,
  slideGap: 350,
} as const;
