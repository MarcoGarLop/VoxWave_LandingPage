import type { ComponentType } from 'react';
import type { WaveState } from '../engine/Wave';
import type { BackgroundState } from '../engine/Background';
import type { ParticleState } from '../engine/Particles';
import type { DeviceState } from '../engine/Device';

export type Theme = 'dark' | 'light' | 'black';

export interface SlideDef {
  id: string;
  /** Number of states inside the slide. One click enters the slide; the builds then play by themselves. */
  builds: number;
  /**
   * Seconds each build stays on screen before the next one plays by itself
   * (length builds - 1). Defaults to DEFAULT_HOLD for every step.
   */
  auto?: number[];
  /** Target of the thread for each build. */
  wave: (build: number) => WaveState;
  /**
   * Particle formation for each build (null/undefined = particles fade out).
   * seed 'wave': on entering this build going forward, the particles are born
   * from the thread (the voice shatters into points).
   */
  particles?: (build: number) => { state: ParticleState; seed?: 'wave' | ((pos: Float32Array, col: Float32Array, n: number) => void) } | null;
  /** The 3D device for each build (null/undefined = hidden). */
  device?: (build: number) => DeviceState | null;
  /** Called when the slide is left (e.g. to keep the recorded "aah"). */
  onLeave?: () => void;
  /**
   * Tone of the page for each build: 'dark' (navy, default), 'light' (paper, like the
   * product itself — it dawns from the centre) or 'black' (a fade to black).
   */
  theme?: (build: number) => Theme;
  /** Optional background mood for each build. */
  bg?: (build: number) => BackgroundState;
  /** DOM content (text, cards, labels). Receives the current build. */
  Content: ComponentType<{ build: number }>;
  /** Speaker notes (kept in data only; never shown on screen). */
  notes?: string;
}
