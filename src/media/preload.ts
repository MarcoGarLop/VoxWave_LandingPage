/**
 * Fullscreen clips are fetched into memory when the deck opens, so they start
 * instantly and never stall on the venue's network or disk.
 */
const ready = new Map<string, string>();
const pending = new Map<string, Promise<void>>();

export const CLIPS = ['/media/app/session.mp4', '/media/device/device.mp4', '/media/device/device_rev.mp4'];

/** Every still the slides show, decoded up front so none of them pops in late. */
export const IMAGES = [
  '/media/atmosphere/plate.jpg',
  '/media/app/session_first.jpg',
  '/media/device/explode_last.jpg',
  '/media/device/hero_first.jpg',
  '/media/partners/fep_color.png',
  '/media/partners/maranon_color.svg',
  '/media/weekend/parts.jpg',
  '/media/weekend/wired.jpg',
  '/media/weekend/case.jpg',
  '/media/weekend/kipras.png',
  '/media/weekend/joonas.png',
  '/media/weekend/evaldas2.png',
  '/media/weekend/cristina.png',
  '/media/partners/tartu.png',
  '/media/partners/ktu.png',
  '/media/qr_demo.svg',
];

/** Starts (once) fetching each clip into memory; resolves per clip, never rejects. */
export function preload(urls: string[] = CLIPS): Promise<void>[] {
  return urls.map((url) => {
    let p = pending.get(url);
    if (!p) {
      p = fetch(url)
        .then((r) => (r.ok ? r.blob() : Promise.reject(r.status)))
        .then((b) => void ready.set(url, URL.createObjectURL(b)))
        .catch(() => {});
      pending.set(url, p);
    }
    return p;
  });
}

// Decoded images are kept referenced so the browser doesn't drop them.
const keep: HTMLImageElement[] = [];

export function preloadImages(urls: string[] = IMAGES): Promise<void>[] {
  return urls.map((url) => {
    const img = new Image();
    img.src = url;
    keep.push(img);
    return img.decode().catch(() => {});
  });
}

/** The in-memory copy when it's ready, otherwise the network URL. */
export function media(url: string) {
  return ready.get(url) ?? url;
}
