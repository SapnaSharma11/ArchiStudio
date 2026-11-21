import { formatINR } from '@/lib/brand'

/** Hand-built, dependency-free SVG charts for the dashboard overview. */

export type BarDatum = { label: string; completed: number; active: number }

const INK = '#252522'
const BRONZE = '#b49a7a'
const GRID = '#e4dfd6'
const MUTED = '#6f6b65'

function niceMax(v: number): number {
  if (v <= 0) return 1
  const pow = 10 ** Math.floor(Math.log10(v))
  const n = v / pow
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10
  return step * pow
}

export function StackedBars({ data, title, desc }: { data: BarDatum[]; title: string; desc: string }) {
  const W = 640
  const H = 260
  const pad = { l: 56, r: 12, t: 12, b: 32 }
  const iw = W - pad.l - pad.r
  const ih = H - pad.t - pad.b
  const max = niceMax(Math.max(...data.map((d) => d.completed + d.active), 0))
  const slot = iw / Math.max(data.length, 1)
  const bw = Math.min(42, slot * 0.56)
  const y = (v: number) => pad.t + ih - (v / max) * ih
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * max)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-labelledby="bars-title bars-desc">
      <title id="bars-title">{title}</title>
      <desc id="bars-desc">{desc}</desc>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke={GRID} strokeDasharray={t ? '2 4' : undefined} />
          <text x={pad.l - 8} y={y(t) + 4} textAnchor="end" fontSize="10" fill={MUTED}>{formatINR(t)}</text>
        </g>
      ))}
      {data.map((d, i) => {
        const x = pad.l + slot * i + (slot - bw) / 2
        const hc = (d.completed / max) * ih
        const ha = (d.active / max) * ih
        return (
          <g key={d.label}>
            <rect x={x} y={y(d.completed)} width={bw} height={hc} fill={INK} rx={1.5}>
              <title>{`${d.label} — completed ${formatINR(d.completed)}`}</title>
            </rect>
            <rect x={x} y={y(d.completed + d.active)} width={bw} height={ha} fill={BRONZE} rx={1.5}>
              <title>{`${d.label} — in progress ${formatINR(d.active)}`}</title>
            </rect>
            <text x={x + bw / 2} y={H - 12} textAnchor="middle" fontSize="10.5" fill={MUTED}>{d.label}</text>
          </g>
        )
      })}
    </svg>
  )
}

export type Slice = { label: string; value: number; color: string }

export function Donut({ data, centerLabel }: { data: Slice[]; centerLabel: string }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  const R = 70
  const C = 2 * Math.PI * R
  let offset = 0
  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <svg viewBox="0 0 180 180" className="w-40 h-40 shrink-0" role="img" aria-label={`Project status distribution, ${total} projects`}>
        <circle cx="90" cy="90" r={R} fill="none" stroke={GRID} strokeWidth="18" />
        {total > 0 &&
          data.filter((d) => d.value > 0).map((d) => {
            const len = (d.value / total) * C
            const el = (
              <circle
                key={d.label}
                cx="90" cy="90" r={R} fill="none" stroke={d.color} strokeWidth="18"
                strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-offset}
                transform="rotate(-90 90 90)"
              >
                <title>{`${d.label}: ${d.value}`}</title>
              </circle>
            )
            offset += len
            return el
          })}
        <text x="90" y="88" textAnchor="middle" fontSize="34" fill={INK} style={{ fontFamily: 'var(--font-display)' }}>{total}</text>
        <text x="90" y="108" textAnchor="middle" fontSize="9" letterSpacing="2" fill={MUTED}>{centerLabel.toUpperCase()}</text>
      </svg>
      <ul className="space-y-1.5 text-sm w-full">
        {data.map((d) => (
          <li key={d.label} className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: d.color }} />
            <span className="text-ink-muted flex-1">{d.label}</span>
            <span className="tabular-nums text-ink font-semibold">{d.value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
