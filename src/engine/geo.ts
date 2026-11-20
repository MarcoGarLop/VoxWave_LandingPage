import { geoAlbers, geoCentroid, geoEquirectangular, geoMercator, geoPath, type GeoProjection } from 'd3-geo';
import { feature } from 'topojson-client';
import type { Feature, FeatureCollection, Geometry, MultiPolygon } from 'geojson';
import countries from 'world-atlas/countries-50m.json';

/** ISO 3166 numeric ids used by the story. */
export const ISO = {
  spain: ['724'],
  usa: ['840'],
  // Spanish-speaking Latin America (+ Puerto Rico).
  latam: [
    '484', '320', '340', '222', '558', '188', '591', '192', '214', '630',
    '170', '862', '218', '604', '068', '152', '032', '858', '600',
  ],
  // Europe (for the cost-of-Parkinson's highlight).
  europe: [
    '724', '620', '250', '826', '372', '056', '528', '442', '276', '040', '756', '380', '470',
    '208', '752', '578', '246', '233', '428', '440', '616', '203', '703', '348', '705', '191',
    '070', '499', '688', '807', '008', '300', '196', '100', '642', '498', '804', '112', '352',
  ],
};

export interface GlobeDot {
  /** Unit-sphere position (y up, z towards the viewer at lon 0). */
  x: number;
  y: number;
  z: number;
  lat: number;
  lon: number;
  /** ISO numeric id of the country under the dot ('' for none). */
  iso: string;
}

let cache: GlobeDot[] | null = null;

/**
 * Evenly spaced dots (Fibonacci sphere) kept only where there is land,
 * each tagged with its country. Rasterised once from bundled TopoJSON (offline).
 */
export function globeDots(candidates = 26000): GlobeDot[] {
  if (cache) return cache;
  const W = 2048, H = 1024;
  const cv = document.createElement('canvas');
  cv.width = W;
  cv.height = H;
  const g = cv.getContext('2d', { willReadFrequently: true })!;
  g.fillStyle = '#000';
  g.fillRect(0, 0, W, H);

  const topo = countries as unknown as Parameters<typeof feature>[0];
  const fc = feature(topo, (topo as any).objects.countries) as unknown as FeatureCollection<Geometry, { name: string }>;
  const proj = geoEquirectangular().scale(W / (2 * Math.PI)).translate([W / 2, H / 2]);
  const path = geoPath(proj, g);
  const ids: string[] = [''];
  fc.features.forEach((f, i) => {
    const idx = i + 1;
    ids.push(String(f.id ?? ''));
    g.fillStyle = `rgb(${idx & 255},${(idx >> 8) & 255},255)`;
    g.beginPath();
    path(f);
    g.fill();
  });
  const px = g.getImageData(0, 0, W, H).data;

  const dots: GlobeDot[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < candidates; i++) {
    const y = 1 - (i / (candidates - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const th = golden * i;
    const x = Math.cos(th) * r;
    const z = Math.sin(th) * r;
    const lat = Math.asin(y) * (180 / Math.PI);
    const lon = Math.atan2(x, z) * (180 / Math.PI);
    const u = Math.min(W - 1, Math.max(0, Math.round(((lon + 180) / 360) * W)));
    const v = Math.min(H - 1, Math.max(0, Math.round(((90 - lat) / 180) * H)));
    const o = (v * W + u) * 4;
    if (px[o + 2] < 128) continue; // ocean
    // Anti-aliased borders blend two country colours into a bogus id, so take
    // the majority id among fully covered pixels around the sample.
    const votes = new Map<number, number>();
    for (let dy = -3; dy <= 3; dy++) {
      for (let dx = -3; dx <= 3; dx++) {
        const uu = Math.min(W - 1, Math.max(0, u + dx));
        const vv = Math.min(H - 1, Math.max(0, v + dy));
        const p = (vv * W + uu) * 4;
        if (px[p + 2] !== 255) continue;
        const id = px[p] + (px[p + 1] << 8);
        votes.set(id, (votes.get(id) ?? 0) + 1);
      }
    }
    let idx = 0, best = 0;
    votes.forEach((c, id) => {
      if (c > best) {
        best = c;
        idx = id;
      }
    });
    dots.push({ x, y, z, lat, lon, iso: ids[idx] ?? '' });
  }
  cache = dots;
  return dots;
}

/** Unit vector for a lat/lon (same convention as the dots). */
export function latLonToVec(lat: number, lon: number): [number, number, number] {
  const la = (lat * Math.PI) / 180, lo = (lon * Math.PI) / 180;
  return [Math.cos(la) * Math.sin(lo), Math.sin(la), Math.cos(la) * Math.cos(lo)];
}

export const MADRID = { lat: 40.4168, lon: -3.7038 };

export interface MapDot {
  /** Design px on the flat map. */
  x: number;
  y: number;
  /** Where the same point sits on the globe. */
  lat: number;
  lon: number;
  vx: number;
  vy: number;
  vz: number;
}

/** Fixed number of map dots, so the particle budget is known before rendering. */
export const SPAIN_DOTS = 4200;
let spainCache: MapDot[] | null = null;

/**
 * Peninsular Spain + the Balearic Islands as a dot matrix filling a box (design px),
 * each dot knowing its own lat/lon so it can fly to its place on the globe.
 */
export function spainDots(box: [[number, number], [number, number]] = [[1000, 150], [1800, 920]]): MapDot[] {
  if (spainCache) return spainCache;
  const topo = countries as unknown as Parameters<typeof feature>[0];
  const fc = feature(topo, (topo as any).objects.countries) as unknown as FeatureCollection<Geometry>;
  const es = fc.features.find((f) => String(f.id) === '724')!;
  const geom = es.geometry as MultiPolygon;
  // Keep the peninsula and the Balearics (drop the Canaries, Ceuta and Melilla).
  const polys = geom.coordinates.filter((p) => {
    const [lon, lat] = geoCentroid({ type: 'Polygon', coordinates: p } as never);
    return lat > 36 && lon > -10;
  });
  const shape: Feature<MultiPolygon> = { type: 'Feature', properties: {}, geometry: { type: 'MultiPolygon', coordinates: polys } };
  const proj = geoMercator().fitExtent(box, shape);
  const [[x0, y0], [x1, y1]] = box;
  const W = Math.ceil(x1), H = Math.ceil(y1);
  const cv = document.createElement('canvas');
  cv.width = W;
  cv.height = H;
  const g = cv.getContext('2d', { willReadFrequently: true })!;
  g.fillStyle = '#fff';
  g.beginPath();
  geoPath(proj, g)(shape);
  g.fill();
  const px = g.getImageData(0, 0, W, H).data;
  const inside = (x: number, y: number) => {
    const u = Math.round(x), v = Math.round(y);
    return u >= 0 && v >= 0 && u < W && v < H && px[(v * W + u) * 4] > 127;
  };
  // Find the hex-grid spacing that yields about SPAIN_DOTS dots, then take exactly that many.
  const grid = (sp: number) => {
    const pts: [number, number][] = [];
    const rowH = sp * 0.866;
    for (let r = 0, y = y0; y <= y1; r++, y += rowH)
      for (let x = x0 + (r % 2 ? sp / 2 : 0); x <= x1; x += sp) if (inside(x, y)) pts.push([x, y]);
    return pts;
  };
  let lo = 4, hi = 30;
  for (let k = 0; k < 18; k++) {
    const mid = (lo + hi) / 2;
    if (grid(mid).length > SPAIN_DOTS) lo = mid;
    else hi = mid;
  }
  let pts = grid(lo);
  // Trim evenly to the exact budget.
  const step = pts.length / SPAIN_DOTS;
  pts = Array.from({ length: SPAIN_DOTS }, (_, i) => pts[Math.min(pts.length - 1, Math.floor(i * step))]);
  spainCache = pts.map(([x, y]) => {
    const [lon, lat] = proj.invert!([x, y])!;
    const [vx, vy, vz] = latLonToVec(lat, lon);
    return { x, y, lat, lon, vx, vy, vz };
  });
  return spainCache;
}

/**
 * A flat dot-matrix map of one country (only the polygons `keep` accepts), fitted
 * into a box in design px. Returns the dots and the projection, to place pins.
 */
export function countryDots(
  iso: string,
  box: [[number, number], [number, number]],
  spacing: number,
  keep: (lon: number, lat: number) => boolean,
  kind: 'mercator' | 'albers' = 'mercator',
): { dots: [number, number][]; project: (lon: number, lat: number) => [number, number] } {
  const topo = countries as unknown as Parameters<typeof feature>[0];
  const fc = feature(topo, (topo as any).objects.countries) as unknown as FeatureCollection<Geometry>;
  const f = fc.features.find((x) => String(x.id) === iso)!;
  const geom = f.geometry as MultiPolygon;
  const polys = geom.type === 'MultiPolygon' ? geom.coordinates : [(f.geometry as any).coordinates];
  const shape: Feature<MultiPolygon> = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'MultiPolygon',
      coordinates: polys.filter((p: any) => {
        const [lon, lat] = geoCentroid({ type: 'Polygon', coordinates: p } as never);
        return keep(lon, lat);
      }),
    },
  };
  const proj: GeoProjection = (kind === 'albers' ? geoAlbers() : geoMercator()).fitExtent(box, shape);
  const [[x0, y0], [x1, y1]] = box;
  const W = Math.ceil(x1) + 2, H = Math.ceil(y1) + 2;
  const cv = document.createElement('canvas');
  cv.width = W;
  cv.height = H;
  const g = cv.getContext('2d', { willReadFrequently: true })!;
  g.fillStyle = '#fff';
  g.beginPath();
  geoPath(proj, g)(shape);
  g.fill();
  const px = g.getImageData(0, 0, W, H).data;
  const dots: [number, number][] = [];
  const rowH = spacing * 0.866;
  for (let r = 0, y = y0; y <= y1; r++, y += rowH)
    for (let x = x0 + (r % 2 ? spacing / 2 : 0); x <= x1; x += spacing) {
      const u = Math.round(x), v = Math.round(y);
      if (px[(v * W + u) * 4] > 127) dots.push([x, y]);
    }
  return { dots, project: (lon, lat) => proj([lon, lat]) as [number, number] };
}
