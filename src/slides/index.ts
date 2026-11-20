import type { SlideDef } from '../deck/types';

// Every file named S*.tsx exporting a SlideDef is picked up automatically.
const modules = import.meta.glob<Record<string, unknown>>('./S*.tsx', { eager: true });

/**
 * The story order. Problem (dark) → "This is why we created VoxWave" (the page dawns)
 * → the app → the device → "…and we built it" (live demo) → how it works → the evidence → impact…
 * Slides not listed here follow at the end, in id order.
 */
const ORDER = ['S02', 'S02B', 'S01', 'S03', 'S03E', 'S04B', 'S05', 'S08', 'S07', 'S06'];

const all = Object.values(modules).flatMap((m) =>
  Object.values(m).filter((v): v is SlideDef => !!v && typeof v === 'object' && 'builds' in v),
);
const rank = (id: string) => {
  const k = ORDER.indexOf(id);
  return k >= 0 ? k : ORDER.length;
};

export const slides: SlideDef[] = all.sort((a, b) => rank(a.id) - rank(b.id) || a.id.localeCompare(b.id));
