import * as THREE from 'three';

const cache = new Map<string, THREE.Color>();
/** Linear colour from a brand hex (cached). */
export function lin(hex: string) {
  let c = cache.get(hex);
  if (!c) cache.set(hex, (c = new THREE.Color(hex)));
  return c;
}

/** Write one point's colour + intensity. */
export function put(out: Float32Array, i: number, hex: string, k: number) {
  const c = lin(hex);
  out[i * 4] = c.r;
  out[i * 4 + 1] = c.g;
  out[i * 4 + 2] = c.b;
  out[i * 4 + 3] = k;
}

/** Paint for `rows`: each row its own colour, bridges between rows invisible. */
export function paintRows(count: number, look: (row: number) => [string, number]) {
  return (out: Float32Array, n: number) => {
    const per = n / count;
    for (let i = 0; i < n; i++) {
      const r = Math.min(count - 1, Math.floor(i / per));
      const first = i <= Math.ceil(r * per) + 1;
      const last = i >= Math.ceil((r + 1) * per) - 2;
      const [hex, k] = look(r);
      put(out, i, hex, first || last ? 0 : k);
    }
  };
}
