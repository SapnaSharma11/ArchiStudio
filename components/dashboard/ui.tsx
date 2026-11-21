import { PROJECT_STATUSES, ENQUIRY_STATUS_LABEL, labelOf } from '@/lib/brand'

/** Shared dashboard primitives (server- and client-safe, no hooks). */

export const btnPrimary =
  'inline-flex items-center justify-center gap-2 bg-ink hover:bg-ink-soft disabled:opacity-60 text-ivory text-[13px] font-semibold px-4 py-2.5 rounded-lg transition-colors'
export const btnSecondary =
  'inline-flex items-center justify-center gap-2 bg-white border border-line hover:bg-sand text-ink text-[13px] font-semibold px-4 py-2.5 rounded-lg transition-colors'
export const btnIcon =
  'inline-flex items-center justify-center w-8 h-8 rounded-md text-muted hover:text-ink hover:bg-sand transition-colors'

const TONES = {
  neutral: 'bg-sand text-ink-muted',
  bronze: 'bg-bronze-soft text-bronze-deep',
  olive: 'bg-olive-soft text-olive',
  ink: 'bg-ink text-ivory',
  rust: 'bg-rust-soft text-rust',
  outline: 'border border-line text-muted',
} as const
export type Tone = keyof typeof TONES

export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap text-[10.5px] font-semibold tracking-wide px-2 py-0.5 rounded-full ${TONES[tone]}`}>
      {children}
    </span>
  )
}

const PROJECT_TONE: Record<string, Tone> = {
  enquiry: 'outline', concept: 'neutral', design: 'bronze', documentation: 'bronze',
  construction: 'ink', completed: 'olive', 'on-hold': 'rust',
}
export function ProjectStatusBadge({ status }: { status: string }) {
  return <Badge tone={PROJECT_TONE[status] ?? 'neutral'}>{labelOf(PROJECT_STATUSES, status)}</Badge>
}

export const ENQUIRY_TONE: Record<string, Tone> = {
  pending: 'bronze', contacted: 'neutral', confirmed: 'ink', completed: 'olive', cancelled: 'outline', missed: 'rust',
}
export function EnquiryStatusBadge({ status }: { status: string }) {
  return <Badge tone={ENQUIRY_TONE[status] ?? 'neutral'}>{ENQUIRY_STATUS_LABEL[status] ?? status}</Badge>
}

export function ProgressBar({ value, className = '' }: { value: number; className?: string }) {
  const v = Math.max(0, Math.min(100, value || 0))
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="h-1 flex-1 bg-sand rounded-full overflow-hidden" role="progressbar" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100}>
        <div className={`h-full rounded-full ${v === 100 ? 'bg-olive' : 'bg-bronze'}`} style={{ width: `${v}%` }} />
      </div>
      <span className="text-[11px] tabular-nums text-muted w-8 text-right">{v}%</span>
    </div>
  )
}

export function initials(name: string): string {
  return name
    .replace(/[^A-Za-z\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('')
}

export function Monogram({ name, className = 'w-10 h-10 text-base' }: { name: string; className?: string }) {
  return (
    <div className={`rounded-full bg-sand text-ink-muted font-display flex items-center justify-center shrink-0 ${className}`} aria-hidden>
      {initials(name) || '·'}
    </div>
  )
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return <div className="card p-12 text-center text-sm text-muted">{children}</div>
}

export function CardTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 mb-4">
      <h3 className="font-display text-xl text-ink leading-none">{children}</h3>
      {action}
    </div>
  )
}

export function fmtDate(iso: unknown, opts: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' }): string {
  if (!iso) return '—'
  const d = new Date(String(iso))
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-IN', opts)
}

export function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors whitespace-nowrap ${
        active ? 'bg-ink text-ivory border-ink' : 'bg-white border-line text-muted hover:text-ink hover:border-stone'
      }`}
    >
      {children}
    </button>
  )
}
