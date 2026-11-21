import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { C, EASE } from '../brand/tokens';
import type { SlideDef } from '../deck/types';
import { wave } from '../engine/shapes';
import { Words } from '../ui/motion';

const ease = EASE as unknown as [number, number, number, number];

/**
 * Costs, on paper.
 * Left: a receipt prints line by line — the ESP32 device and the yearly cost per
 * patient, medical regulation included — and gets stamped with the gross margin
 * (≈ 70%, between Omada and Hinge Health). Right: the first year, month by month:
 * the up-front cost of a new patient is paid back on day 38; the rest is margin.
 */

const NAVY = C.navy, TEAL = C.teal, CORAL = C.coral;
const INK = 'rgba(9,38,52,0.72)';

// ---------- Estimate (distributor prices, medical-grade, regulation included) ----------
type Line = { k: 'head' | 'item' | 'total' | 'gap'; label?: string; value?: string };
const RECEIPT: Line[] = [
  { k: 'head', label: 'ONE-OFF · THE DEVICE' },
  { k: 'item', label: 'ESP32-S3 chip', value: '€4.80' },
  { k: 'item', label: '1.3″ OLED screen', value: '€3.50' },
  { k: 'item', label: 'Medical-grade microphone', value: '€2.70' },
  { k: 'item', label: 'Battery & charging', value: '€5.00' },
  { k: 'item', label: 'Button', value: '€0.50' },
  { k: 'item', label: 'Board, assembly & testing', value: '€12.50' },
  { k: 'item', label: 'Case & packaging', value: '€10.00' },
  { k: 'total', label: 'DEVICE', value: '€39.00' },
  { k: 'gap' },
  { k: 'head', label: 'EVERY YEAR · PER PATIENT' },
  { k: 'item', label: 'Device (reused 3 years)', value: '€13' },
  { k: 'item', label: 'Cloud & AI, hosted in the EU', value: '€12' },
  { k: 'item', label: 'Clinical & patient support', value: '€36' },
  { k: 'item', label: 'Logistics & refurbishing', value: '€18' },
  { k: 'item', label: 'Regulation & quality (CE, ISO)', value: '€58' },
  { k: 'item', label: 'Payments & admin', value: '€8' },
  { k: 'total', label: 'TOTAL / YEAR', value: '€145' },
];
const UPFRONT = 50; // device + shipping & onboarding, per new patient
const PER_DAY = 40 / 30; // €40 a month
const PAYBACK_DAY = Math.ceil(UPFRONT / PER_DAY); // 38
const MARGIN_YEAR = 480 - 145; // €335

// ---------- Timeline (s since the slide appeared) ----------
const T = { head: 0.15, print0: 0.7, lineGap: 0.18, stamp: 0, right: 0, days0: 0, dayGap: 0.045, monthGap: 0.11 };
T.stamp = T.print0 + RECEIPT.length * T.lineGap + 0.3;
T.right = T.stamp + 0.35;
T.days0 = T.right + 0.6;
const PAID_AT = T.days0 + PAYBACK_DAY * T.dayGap;

// ---------- Geometry ----------
const RC = { x: 120, w: 730, slot: 190, line: 37 };
const YR = { x: 920, y: 560, cell: 132, h: 96, gap: 14, cols: 6 };
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

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

function Receipt({ t }: { t: number }) {
  const printed = clamp((t - T.print0) / (RECEIPT.length * T.lineGap)) * RECEIPT.length;
  const n = Math.floor(printed);
  const paperH = 98 + printed * RC.line + (printed >= RECEIPT.length ? 30 : 0);
  return (
    <>
      <div style={{ position: 'absolute', left: RC.x - 22, top: RC.slot - 14, width: RC.w + 44, height: 16, borderRadius: 8, background: NAVY }} />
      <div
        style={{
          position: 'absolute',
          left: RC.x,
          top: RC.slot,
          width: RC.w,
          height: paperH,
          background: '#fffefb',
          boxShadow: '0 18px 40px rgba(9,38,52,0.12)',
          overflow: 'hidden',
          clipPath: `polygon(0 0, 100% 0, 100% calc(100% - 10px), ${Array.from({ length: 31 }, (_, i) => `${100 - (i + 0.5) * (100 / 30)}% ${i % 2 ? '100%' : 'calc(100% - 10px)'}`).join(', ')}, 0 calc(100% - 10px))`,
        }}
      >
        <div className="mono" style={{ position: 'absolute', left: 34, right: 34, top: 22, fontSize: 18, color: NAVY, display: 'flex', justifyContent: 'space-between' }}>
          <span>VOXWAVE · COST SHEET</span>
          <span style={{ color: TEAL }}>ESP32 · MEDICAL GRADE</span>
        </div>
        <div style={{ position: 'absolute', left: 34, right: 34, top: 56, borderTop: '2px dashed rgba(9,38,52,0.25)' }} />
        {RECEIPT.slice(0, n).map((l, i) => (
          <motion.div
            key={i}
            className="mono"
            style={{
              position: 'absolute',
              left: 30,
              right: 30,
              top: 76 + i * RC.line,
              fontSize: l.k === 'head' ? 17 : 22,
              color: l.k === 'head' ? CORAL : NAVY,
              fontWeight: l.k === 'total' ? 700 : 400,
              display: 'flex',
              alignItems: 'baseline',
              gap: 10,
              letterSpacing: l.k === 'head' ? '0.18em' : '0.02em',
              textTransform: l.k === 'head' ? 'uppercase' : 'none',
              borderTop: l.k === 'total' ? '2px solid rgba(9,38,52,0.6)' : undefined,
              paddingTop: l.k === 'total' ? 3 : 0,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
          >
            {l.label && <span style={{ whiteSpace: 'nowrap' }}>{l.label}</span>}
            {l.value && (
              <>
                <span style={{ flex: 1, borderBottom: l.k === 'item' ? '2px dotted rgba(9,38,52,0.22)' : 'none', transform: 'translateY(-5px)' }} />
                <span>{l.value}</span>
              </>
            )}
          </motion.div>
        ))}
      </div>
      {/* the margin, stamped on the torn edge */}
      <div style={{ position: 'absolute', left: RC.x + RC.w - 150, top: RC.slot + 76 + RECEIPT.length * RC.line + 4 }}>
        <motion.div
          style={{ width: 230, height: 116, borderRadius: 16, border: `4px solid ${CORAL}`, color: CORAL, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,254,251,0.9)' }}
          initial={{ opacity: 0, scale: 1.7, rotate: -18 }}
          animate={{ opacity: [0, 1, 1, 1], scale: [1.7, 0.95, 1.03, 1], rotate: [-18, -6, -10, -9] }}
          transition={{ duration: 0.65, delay: T.stamp, times: [0, 0.45, 0.72, 1], ease: [0.5, 0, 0.75, 0] }}
        >
          <div className="number" style={{ fontSize: 48, lineHeight: 1 }}>
            ≈ 70%
          </div>
          <div className="mono" style={{ fontSize: 13, marginTop: 4 }}>
            gross margin
          </div>
        </motion.div>
      </div>
    </>
  );
}

function Payback({ t }: { t: number }) {
  const day = Math.max(0, Math.min(PAYBACK_DAY, Math.floor((t - T.days0) / T.dayGap)));
  const paid = t >= PAID_AT;
  return (
    <motion.div style={{ position: 'absolute', left: YR.x, top: 236 }} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease, delay: T.right }}>
      <div className="mono" style={{ fontSize: 17, color: CORAL }}>
        Each new patient pays back in
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 18, marginTop: 4 }}>
        <span className="number" style={{ fontSize: 110, lineHeight: 1, color: paid ? CORAL : NAVY, transition: 'color .4s' }}>
          {day}
        </span>
        <span className="display" style={{ fontSize: 40, fontWeight: 700, color: NAVY }}>
          days
        </span>
      </div>
      <div className="body" style={{ fontSize: 22, color: INK, marginTop: 8 }}>
        €{UPFRONT} up front · €40 a month coming back
      </div>
    </motion.div>
  );
}

/** The first year, month by month: navy while paying back, coral once it's margin. */
function Year({ t }: { t: number }) {
  const days = Math.max(0, Math.min(PAYBACK_DAY, (t - T.days0) / T.dayGap));
  const paid = t >= PAID_AT;
  return (
    <>
      {MONTHS.map((m, i) => {
        const col = i % YR.cols, row = Math.floor(i / YR.cols);
        const fillNavy = clamp((days - i * 30) / 30); // part of this month spent paying back
        const coralAt = PAID_AT + Math.max(0, i - 1) * T.monthGap;
        const coral = paid && t >= coralAt && i >= 1;
        const isPay = i === 1; // day 38 falls in month 2
        return (
          <motion.div
            key={m}
            style={{
              position: 'absolute',
              left: YR.x + col * (YR.cell + YR.gap),
              top: YR.y + row * (YR.h + YR.gap),
              width: YR.cell,
              height: YR.h,
              borderRadius: 14,
              overflow: 'hidden',
              border: '2px solid rgba(9,38,52,0.10)',
              background: coral ? (isPay ? CORAL : 'rgba(255,110,66,0.2)') : 'transparent',
              transition: 'background .3s',
              boxShadow: coral && isPay ? '0 14px 30px rgba(255,110,66,0.35)' : 'none',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, scale: coral && isPay && t < coralAt + 0.6 ? [1, 1.12, 1] : 1 }}
            transition={{ opacity: { duration: 0.4, delay: T.right + 0.3 + i * 0.03 }, scale: { duration: 0.5 } }}
          >
            {/* paying back: navy fill growing left to right */}
            {!coral && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${fillNavy * 100}%`, background: NAVY }} />}
            {isPay && coral && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${((PAYBACK_DAY - 30) / 30) * 100}%`, background: NAVY }} />}
            <div
              className="mono"
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 19,
                textTransform: 'none',
                color: coral ? (isPay ? '#fff' : CORAL) : fillNavy > 0.5 ? '#fbf9f5' : 'rgba(9,38,52,0.4)',
              }}
            >
              {coral && isPay ? '✓ day 38' : m}
            </div>
          </motion.div>
        );
      })}
      {t >= PAID_AT + 11 * T.monthGap && (
        <motion.div className="display" style={{ position: 'absolute', left: YR.x, top: YR.y + 2 * (YR.h + YR.gap) + 10, fontSize: 25, fontWeight: 600, color: CORAL }} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }}>
          Then it’s margin: ≈ €{MARGIN_YEAR} per patient, every year.
        </motion.div>
      )}
    </>
  );
}

function Content() {
  const t = useElapsed();
  const status = t < T.stamp ? 'Printing' : t < PAID_AT ? 'Paying back' : 'In profit';
  return (
    <div className="content">
      <div className="mono" style={{ position: 'absolute', left: 120, top: 62, fontSize: 18, color: NAVY, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ width: 10, height: 10, borderRadius: 5, background: CORAL, display: 'inline-block' }} />
        Costs
      </div>
      <motion.div key={status} className="mono" style={{ position: 'absolute', right: 120, top: 62, fontSize: 18, color: status === 'In profit' ? CORAL : TEAL }} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        {status}
      </motion.div>
      <h2 className="display" style={{ position: 'absolute', left: 120, top: 104, fontSize: 52, color: NAVY }}>
        <Words text="What it costs us, and how fast it comes back." delay={T.head} />
      </h2>

      <Receipt t={t} />
      <Payback t={t} />
      <Year t={t} />

      <div className="mono" style={{ position: 'absolute', right: 120, bottom: 34, fontSize: 13, color: 'rgba(9,38,52,0.45)' }}>
        Estimate · gross margin peers: Omada ≈ 61% · Hinge Health ≈ 77% (2024)
      </div>
    </div>
  );
}

export const S14: SlideDef = {
  id: 'S14',
  builds: 1,
  notes:
    "Each device costs us thirty-nine euros; each patient, about a hundred and forty-five a year, medical regulation included. That's a seventy percent gross margin, in line with Omada and Hinge Health. And every new patient pays back in thirty-eight days.",
  theme: () => 'light',
  wave: () => ({ shape: wave({ y: 540, amp: 30 }), opacity: 0, duration: 1600, stagger: 0 }),
  bg: () => ({ pool: [0.5, 0.5], poolStrength: 1, warm: 0.6 }),
  Content,
};
