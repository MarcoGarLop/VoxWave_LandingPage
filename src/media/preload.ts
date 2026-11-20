/**
 * Fullscreen clips are fetched into memory when the deck opens, so they start
 * instantly and never stall on the venue's network or disk.
 */
const ready = new Map<string, string>();

export const CLIPS = ['/media/app/session.mp4', '/media/device/device.mp4', '/media/device/device_rev.mp4'];

export function preload(urls: string[] = CLIPS) {
  for (const url of urls) {
    if (ready.has(url)) continue;
    fetch(url)
      .then((r) => (r.ok ? r.blob() : Promise.reject(r.status)))
      .then((b) => ready.set(url, URL.createObjectURL(b)))
      .catch(() => {});
  }
}

/** The in-memory copy when it's ready, otherwise the network URL. */
export function media(url: string) {
  return ready.get(url) ?? url;
}
