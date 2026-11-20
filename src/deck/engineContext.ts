import { createContext, useContext, type MutableRefObject } from 'react';
import type { Engine } from '../engine/Engine';

export const EngineContext = createContext<MutableRefObject<Engine | null> | null>(null);

/** Access the running engine from slide content (e.g. to project 3D anchors). */
export function useEngine() {
  return useContext(EngineContext);
}

/**
 * Lets a slide play its next build itself when its own media says so
 * (e.g. when a clip ends), instead of on a fixed timer.
 */
export const AdvanceContext = createContext<() => void>(() => {});
export function useAdvance() {
  return useContext(AdvanceContext);
}
