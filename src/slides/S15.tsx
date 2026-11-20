import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { C, EASE } from '../brand/tokens';
import type { SlideDef } from '../deck/types';
import { countryDots } from '../engine/geo';
import { wave } from '../engine/shapes';
import { Words } from '../ui/motion';

const ease = EASE as unknown as [number, number, number, number];

/**
 * Go-to-market, as a road on a dot map (US left, Spain right, the Atlantic between).
 * Year 1: a pin drops on Madrid. Year 2: the road tours Spain, city by city.
 * Year 3: it crosses the Atlantic in one arc, lands in Miami and lights up the
 * Hispanic US — Florida, Texas, the Southwest, California, Chicago, New York.
 */

const NAVY = C.navy, TEAL = C.teal, CORAL = C.coral;
const INK = 'rgba(9,38,52,0.72)';

const US_BOX: [[number, number], [number, number]] = [[110, 250], [1060, 760]];
const ES_BOX: [[number, number], [number, number]] = [[1330, 330], [1800, 720]];

type City = { name: string; lat: number; lon: number; r: number };
const MADRID: City = { name: 'Madrid', lat: 40.42, lon: -3.7, r: 52 };
const SPAIN: City[] = [
  { name: 'Bilbao', lat: 43.26, lon: -2.93, r: 34 },
  { name: 'Barcelona', lat: 41.39, lon: 2.17, r: 40 },
  { name: 'Valencia', lat: 39.47, lon: -0.38, r: 36 },
  { name: 'Sevilla', lat: 37.39, lon: -5.98, r: 38 },
];
const US: City[] = [
  { name: 'Miami', lat: 25.76, lon: -80.19, r: 46 },
  { name: 'New York', lat: 40.71, lon: -74.0, r: 50 },
  { name: 'Chicago', lat: 41.88, lon: -87.63, r: 40 },
  { name: 'Houston', lat: 29.76, lon: -95.37, r: 58 },
  { name: 'Phoenix', lat: 33.45, lon: -112.07, r: 48 },
  { name: 'Los Angeles', lat: 34.05, lon: -118.24, r: 62 },
];

// ---------- Timeline (s since the slide appeared) ----------
const T = { head: 0.15, maps: 0.35, y1: 1.0, y2: 2.4, y2end: 4.0, arc0: 4.4, arc1: 5.6, y3end: 7.6, end: 8.4 };

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const io = (v: number) => (v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2);

function useElapsed() {
  const [t, setT] = useState(0);
  useEffect(() => {
    const t0 = performance.now();
    let raf = 0;
    const loop = () => {
      setT((performance.now() - t0) / 1000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  return t;
}

/** Both maps, their projections, and the road (sampled), computed once. */
function useGeo() {
  return useMemo(() => {
    const es = countryDots('724', ES_BOX, 13, (lon, lat) => lat > 36 && lon > -10);
    const us = countryDots('840', US_BOX, 15, (lon, lat) => lon > -128 && lat > 24 && lat < 50, 'albers');
    const pE = (c: City) => es.project(c.lon, c.lat);
    const pU = (c: City) => us.project(c.lon, c.lat);
    // The road: Madrid → around Spain → back to Madrid → arc over the Atlantic → the Hispanic US.
    type Seg = { pts: [number, number][]; t0: number; t1: number };
    const segs: Seg[] = [];
    const tour = [MADRID, ...SPAIN, MADRID].map(pE);
    const per = (T.y2end - T.y2) / (tour.length - 1);
    for (let i = 0; i < tour.length - 1; i++) segs.push({ pts: [tour[i], tour[i + 1]], t0: T.y2 + i * per, t1: T.y2 + (i + 1) * per });
    // Atlantic arc (quadratic, high over the ocean)
    const a = pE(MADRID), b = pU(US[0]);
    const ctrl: [number, number] = [(a[0] + b[0]) / 2, Math.min(a[1], b[1]) - 360];
    const arc: [number, number][] = Array.from({ length: 60 }, (_, i) => {
      const s = i / 59, u = 1 - s;
      return [u * u * a[0] + 2 * u * s * ctrl[0] + s * s * b[0], u * u * a[1] + 2 * u * s * ctrl[1] + s * s * b[1]];
    });
    segs.push({ pts: arc, t0: T.arc0, t1: T.arc1 });
    const usRoute = US.map(pU);
    const perUs = (T.y3end - T.arc1) / (usRoute.length - 1);
    for (let i = 0; i < usRoute.length - 1; i++) segs.push({ pts: [usRoute[i], usRoute[i + 1]], t0: T.arc1 + i * perUs, t1: T.arc1 + (i + 1) * perUs });
    // Static base dots as one path each (cheap to render).
    const base = (d: [number, number][]) => d.map(([x, y]) => `M${x.toFixed(1)} ${y.toFixed(1)}h0`).join('');
    return { es, us, pE, pU, segs, esBase: base(es.dots), usBase: base(us.dots) };
  }, []);
}

/** Dots around a city that light up coral when the road reaches it. */
function cityGlow(dots: [number, number][], c: [number, number], r: number) {
  return dots
    .filter(([x, y]) => Math.hypot(x - c[0], y - c[1]) < r)
    .map(([x, y]) => `M${x.toFixed(1)} ${y.toFixed(1)}h0`)
    .join('');
}

function MapLayer({ t }: { t: number }) {
  const g = useGeo();
  const show = io(clamp((t - T.maps) / 0.9));
  // When does the road reach each city?
  const reach = useMemo(() => {
    const m = new Map<string, number>();
    m.set('Madrid', T.y1);
    const per = (T.y2end - T.y2) / (SPAIN.length + 1);
    SPAIN.forEach((c, i) => m.set(c.name, T.y2 + (i + 1) * per));
    const perUs = (T.y3end - T.arc1) / (US.length - 1);
    US.forEach((c, i) => m.set(c.name, T.arc1 + i * perUs));
    return m;
  }, []);
  const glows = useMemo(
    () => [
      { c: MADRID, d: cityGlow(g.es.dots, g.pE(MADRID), MADRID.r) },
      ...SPAIN.map((c) => ({ c, d: cityGlow(g.es.dots, g.pE(c), c.r) })),
      ...US.map((c) => ({ c, d: cityGlow(g.us.dots, g.pU(c), c.r) })),
    ],
    [g],
  );

  // The road drawn so far, and its moving head.
  let head: [number, number] | null = null;
  const drawn: string[] = [];
  for (const sgm of g.segs) {
    if (t <= sgm.t0) break;
    const f = io(clamp((t - sgm.t0) / (sgm.t1 - sgm.t0)));
    const n = sgm.pts.length;
    if (n === 2) {
      const [p, q] = sgm.pts;
      const h: [number, number] = [p[0] + (q[0] - p[0]) * f, p[1] + (q[1] - p[1]) * f];
      drawn.push(`M${p[0]} ${p[1]} L${h[0]} ${h[1]}`);
      head = h;
    } else {
      const k = Math.max(1, Math.floor(f * (n - 1)));
      drawn.push('M' + sgm.pts.slice(0, k + 1).map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' L'));
      head = sgm.pts[k];
    }
  }
  const pulse = (t * 1.4) % 1;

  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
      <g opacity={show}>
        <path d={g.usBase} stroke="rgba(9,38,52,0.22)" strokeWidth={6} strokeLinecap="round" />
        <path d={g.esBase} stroke="rgba(9,38,52,0.22)" strokeWidth={5.5} strokeLinecap="round" />
      </g>
      {glows.map(({ c, d }) => {
        const at = reach.get(c.name)!;
        const on = clamp((t - at) / 0.5);
        return on > 0 ? <path key={c.name} d={d} stroke={CORAL} strokeWidth={c.name === 'Madrid' ? 6.5 : 6} strokeLinecap="round" opacity={on} /> : null;
      })}
      {/* the road */}
      <path d={drawn.join(' ')} fill="none" stroke={CORAL} strokeWidth={3.5} strokeDasharray="2 9" strokeLinecap="round" strokeLinejoin="round" />
      {head && t < T.y3end + 0.2 && (
        <g>
          <circle cx={head[0]} cy={head[1]} r={9 + pulse * 18} fill="none" stroke={CORAL} strokeWidth={2} opacity={0.7 * (1 - pulse)} />
          <circle cx={head[0]} cy={head[1]} r={8} fill={CORAL} />
        </g>
      )}
      {/* pins on the three stops */}
      {[
        { at: T.y1, p: g.pE(MADRID), label: 'Madrid' },
        { at: T.arc1, p: g.pU(US[0]), label: 'Miami' },
      ].map(({ at, p, label }) => {
        const f = clamp((t - at) / 0.45);
        if (f <= 0) return null;
        const drop = (1 - io(f)) * -40;
        return (
          <g key={label} transform={`translate(${p[0]} ${p[1] + drop})`} opacity={Math.min(1, f * 2)}>
            <path d="M0 0 C-4 -10 -14 -16 -14 -27 A14 14 0 1 1 14 -27 C14 -16 4 -10 0 0 Z" fill={CORAL} />
            <circle cx={0} cy={-27} r={5.5} fill="#fbf9f5" />
            <text x={18} y={-30} fontFamily="Sora, sans-serif" fontWeight={700} fontSize={20} fill={NAVY}>
              {label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

type Stop = { year: string; title: string; line: string; big: string; small: string; at: number; x: number; y: number; w: number };
const STOPS: Stop[] = [
  { year: 'Year 1', title: 'Validate in Madrid', line: 'Clinical pilot with Gregorio Marañón + first private clinics', big: '60', small: 'patients', at: T.y1 + 0.3, x: 1330, y: 190, w: 470 },
  { year: 'Year 2', title: 'Scale across Spain', line: 'CE mark · private clinics & insurers', big: '300 → 1,000', small: 'patients', at: T.y2 + 0.8, x: 1330, y: 768, w: 470 },
  { year: 'Year 3', title: 'The US Hispanic community', line: 'FDA clearance · a model that already speaks Spanish · the highest Parkinson’s incidence', big: '68M', small: 'Hispanic Americans · 1.1M Americans live with Parkinson’s', at: T.arc1 + 0.4, x: 120, y: 790, w: 900 },
];

function StopCard({ s }: { s: Stop }) {
  return (
    <motion.div style={{ position: 'absolute', left: s.x, top: s.y, width: s.w, paddingLeft: 22, borderLeft: `3px solid ${CORAL}` }} initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease, delay: s.at }}>
      <div className="mono" style={{ fontSize: 16, color: CORAL }}>
        {s.year}
      </div>
      <div className="display" style={{ fontSize: 30, fontWeight: 700, color: NAVY, marginTop: 4 }}>
        {s.title}
      </div>
      <div className="body" style={{ fontSize: 19, color: INK, marginTop: 4, lineHeight: 1.3 }}>
        {s.line}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 8 }}>
        <span className="number" style={{ fontSize: 40, color: CORAL, lineHeight: 1 }}>
          {s.big}
        </span>
        <span className="body" style={{ fontSize: 18, color: INK }}>
          {s.small}
        </span>
      </div>
    </motion.div>
  );
}

function Content() {
  const t = useElapsed();
  const status = t < T.y2 ? 'Year 1' : t < T.arc0 ? 'Year 2' : 'Year 3';
  const ended = t >= T.end;
  return (
    <div className="content">
      <div className="mono" style={{ position: 'absolute', left: 120, top: 62, fontSize: 18, color: NAVY, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ width: 10, height: 10, borderRadius: 5, background: CORAL, display: 'inline-block' }} />
        Go to market
      </div>
      <motion.div key={status} className="mono" style={{ position: 'absolute', right: 120, top: 62, fontSize: 18, color: TEAL }} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        {status}
      </motion.div>
      <div style={{ position: 'absolute', left: 120, top: 104 }}>
        <AnimatePresence mode="wait">
          <motion.h2
            key={ended ? 'end' : 'start'}
            className="display"
            style={{ fontSize: 54, color: ended ? CORAL : NAVY }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8, transition: { duration: 0.3 } }}
            transition={{ duration: 0.6, ease }}
          >
            {ended ? 'Validate in Madrid. Grow where Spanish is spoken.' : <Words text="Our road." delay={T.head} />}
          </motion.h2>
        </AnimatePresence>
      </div>

      <MapLayer t={t} />
      {STOPS.map((s) => (
        <StopCard key={s.year} s={s} />
      ))}
    </div>
  );
}

export const S15: SlideDef = {
  id: 'S15',
  builds: 1,
  notes:
    "Our road. Year one: we validate in Madrid, with a clinical pilot at Gregorio Marañón and our first private clinics — sixty patients. Year two: with the CE mark, we scale across Spain through private clinics and insurers, from three hundred to a thousand patients. Year three: we cross the Atlantic to the US Hispanic community — sixty-eight million people, the group with the highest Parkinson's incidence — with FDA clearance and a model that already speaks Spanish. Validate in Madrid. Grow where Spanish is spoken.",
  theme: () => 'light',
  wave: () => ({ shape: wave({ y: 540, amp: 30 }), opacity: 0, duration: 1600, stagger: 0 }),
  bg: () => ({ pool: [0.5, 0.5], poolStrength: 1, warm: 0.6 }),
  Content,
};
