'use client'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { ArrowUpRight, FolderKanban, Loader2, Mail, MapPin, Phone, Save, Search, Trash2 } from 'lucide-react'
import Drawer from '@/components/dashboard/Drawer'
import { Chip, EmptyState, EnquiryStatusBadge, ENQUIRY_TONE, btnIcon, btnPrimary, btnSecondary, fmtDate } from '@/components/dashboard/ui'
import { ENQUIRY_STATUS_LABEL } from '@/lib/brand'

export type EnquiryDTO = {
  id: number
  fullName: string
  phone: string
  email: string
  problem: string
  notes: string | null
  projectType: string | null
  budget: string | null
  location: string | null
  assignedTo: string | null
  followUpDate: string | null
  projectId: number | null
  projectTitle: string | null
  preferredDate: string
  preferredTime: string
  status: string
  createdAt: string
}

// Booking.status values, in pipeline order ('missed' is set by the daily cron).
const STATUSES = ['pending', 'contacted', 'confirmed', 'completed', 'cancelled', 'missed'] as const

const SELECT_TONE: Record<string, string> = {
  bronze: 'bg-bronze-soft text-bronze-deep', neutral: 'bg-sand text-ink-muted', ink: 'bg-ink text-ivory',
  olive: 'bg-olive-soft text-olive', outline: 'bg-white border border-line text-muted', rust: 'bg-rust-soft text-rust',
}

async function patch(id: number, body: Record<string, unknown>) {
  return fetch(`/api/admin/bookings/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

export default function EnquiriesManager({ initial, team }: { initial: EnquiryDTO[]; team: string[] }) {
  const router = useRouter()
  const [filter, setFilter] = useState<string>('all')
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState<EnquiryDTO | null>(null)
  const [draft, setDraft] = useState({ assignedTo: '', followUpDate: '', notes: '', status: 'pending' })
  const [saving, setSaving] = useState(false)
  const [converting, setConverting] = useState(false)

  const counts = useMemo(
    () => Object.fromEntries(STATUSES.map((s) => [s, initial.filter((b) => b.status === s).length])) as Record<string, number>,
    [initial],
  )
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return initial
      .filter((b) => filter === 'all' || b.status === filter)
      .filter((b) => !q || [b.fullName, b.email, b.projectType, b.location].some((v) => (v ?? '').toLowerCase().includes(q)))
  }, [initial, filter, query])

  function openDetail(b: EnquiryDTO) {
    setOpen(b)
    setDraft({
      assignedTo: b.assignedTo ?? '',
      followUpDate: b.followUpDate ? b.followUpDate.slice(0, 10) : '',
      notes: b.notes ?? '',
      status: b.status,
    })
  }

  async function setStatus(b: EnquiryDTO, status: string) {
    const res = await patch(b.id, { status })
    if (res.ok) {
      toast.success(`Marked “${ENQUIRY_STATUS_LABEL[status]}”`)
      router.refresh()
    } else toast.error('Could not update status')
  }

  async function saveDetail() {
    if (!open) return
    setSaving(true)
    try {
      const res = await patch(open.id, {
        status: draft.status,
        assignedTo: draft.assignedTo,
        followUpDate: draft.followUpDate,
        notes: draft.notes,
      })
      if (res.ok) {
        toast.success('Enquiry updated')
        setOpen(null)
        router.refresh()
      } else toast.error('Could not save')
    } finally {
      setSaving(false)
    }
  }

  async function convert() {
    if (!open) return
    setConverting(true)
    try {
      const res = await fetch(`/api/admin/bookings/${open.id}/convert`, { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        toast.success(`Project created: ${data.title ?? 'new project'}`)
        setOpen(null)
        router.refresh()
      } else toast.error(data.error ?? 'Could not convert')
    } finally {
      setConverting(false)
    }
  }

  async function remove(b: EnquiryDTO) {
    if (!confirm(`Delete the enquiry from ${b.fullName}? This cannot be undone.`)) return
    const res = await fetch(`/api/admin/bookings/${b.id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Enquiry deleted')
      setOpen(null)
      router.refresh()
    } else toast.error('Could not delete')
  }

  return (
    <>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-5">
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          <Chip active={filter === 'all'} onClick={() => setFilter('all')}>All <span className="opacity-60 ml-1">{initial.length}</span></Chip>
          {STATUSES.filter((s) => s !== 'missed' || counts.missed > 0).map((s) => (
            <Chip key={s} active={filter === s} onClick={() => setFilter(s)}>
              {ENQUIRY_STATUS_LABEL[s]} <span className="opacity-60 ml-1">{counts[s] ?? 0}</span>
            </Chip>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-white border border-line rounded-lg px-3 py-2 w-full lg:w-72 shrink-0">
          <Search size={15} className="text-concrete shrink-0" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search enquiries…" aria-label="Search enquiries" className="text-sm outline-none w-full bg-transparent" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState>{initial.length === 0 ? 'No enquiries yet. Consultation requests from the website appear here.' : 'No enquiries in this view.'}</EmptyState>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm min-w-[980px]">
            <thead>
              <tr className="text-left text-[10.5px] uppercase tracking-[0.1em] text-muted border-b border-line">
                <th className="px-4 py-3 font-semibold">Client</th>
                <th className="px-4 py-3 font-semibold">Project</th>
                <th className="px-4 py-3 font-semibold">Budget</th>
                <th className="px-4 py-3 font-semibold">Consultation</th>
                <th className="px-4 py-3 font-semibold">Assigned</th>
                <th className="px-4 py-3 font-semibold">Follow-up</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((b) => (
                <tr key={b.id} className="hover:bg-ivory/70 cursor-pointer align-top" onClick={() => openDetail(b)}>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-ink">{b.fullName}</div>
                    <div className="text-[11px] text-muted">{b.email}</div>
                  </td>
                  <td className="px-4 py-3 max-w-[240px]">
                    <div className="text-ink truncate">{b.projectType ?? <span className="text-concrete">Not specified</span>}</div>
                    <div className="text-[11px] text-muted truncate">{b.location ?? b.problem}</div>
                  </td>
                  <td className="px-4 py-3 text-ink-muted whitespace-nowrap">{b.budget ?? '—'}</td>
                  <td className="px-4 py-3 text-ink-muted whitespace-nowrap">
                    {fmtDate(b.preferredDate, { day: '2-digit', month: 'short' })} · {b.preferredTime}
                  </td>
                  <td className="px-4 py-3 text-ink-muted whitespace-nowrap">{b.assignedTo ?? <span className="text-concrete">Unassigned</span>}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {b.followUpDate ? (
                      <span className={new Date(b.followUpDate) < new Date() && !['completed', 'cancelled'].includes(b.status) ? 'text-rust' : 'text-ink-muted'}>
                        {fmtDate(b.followUpDate, { day: '2-digit', month: 'short' })}
                      </span>
                    ) : (
                      <span className="text-concrete">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={b.status}
                      onChange={(e) => setStatus(b, e.target.value)}
                      aria-label={`Status for ${b.fullName}`}
                      className={`text-[11px] font-semibold pl-2 pr-1 py-1 rounded-full cursor-pointer outline-none ${SELECT_TONE[ENQUIRY_TONE[b.status] ?? 'neutral']}`}
                    >
                      {STATUSES.map((s) => <option key={s} value={s}>{ENQUIRY_STATUS_LABEL[s]}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => remove(b)} className={`${btnIcon} hover:!text-rust`} aria-label={`Delete enquiry from ${b.fullName}`}>
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Drawer
        open={!!open}
        title={open?.fullName ?? ''}
        subtitle={open ? `Received ${fmtDate(open.createdAt)}` : undefined}
        onClose={() => setOpen(null)}
        wide
        footer={
          <>
            <button onClick={() => setOpen(null)} className={`${btnSecondary} flex-1`}>Close</button>
            <button onClick={saveDetail} disabled={saving} className={`${btnPrimary} flex-1`}>
              {saving ? <Loader2 className="animate-spin" size={15} /> : <Save size={15} />} Save
            </button>
          </>
        }
      >
        {open && (
          <>
            <div className="flex items-center gap-2 flex-wrap">
              <EnquiryStatusBadge status={open.status} />
              {open.projectType && <span className="text-xs text-muted">{open.projectType}</span>}
            </div>

            <div className="card p-4 space-y-2 text-sm">
              <a href={`mailto:${open.email}`} className="flex items-center gap-2 text-ink hover:text-bronze-deep"><Mail size={14} className="text-bronze" /> {open.email}</a>
              <a href={`tel:${open.phone}`} className="flex items-center gap-2 text-ink hover:text-bronze-deep"><Phone size={14} className="text-bronze" /> {open.phone}</a>
              {open.location && <p className="flex items-center gap-2 text-ink"><MapPin size={14} className="text-bronze" /> {open.location}</p>}
            </div>

            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div className="card p-3"><dt className="label">Budget</dt><dd className="text-ink mt-1">{open.budget ?? '—'}</dd></div>
              <div className="card p-3">
                <dt className="label">Preferred consultation</dt>
                <dd className="text-ink mt-1">{fmtDate(open.preferredDate)} · {open.preferredTime}</dd>
              </div>
            </dl>

            <div>
              <p className="label">Project brief</p>
              <p className="mt-1.5 text-sm text-ink leading-relaxed whitespace-pre-line bg-white border border-line rounded-lg p-4">{open.problem}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="label" htmlFor="enq-status">Status</label>
                <select id="enq-status" className="input" value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })}>
                  {STATUSES.map((s) => <option key={s} value={s}>{ENQUIRY_STATUS_LABEL[s]}</option>)}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="enq-assign">Assigned to</label>
                <select id="enq-assign" className="input" value={draft.assignedTo} onChange={(e) => setDraft({ ...draft, assignedTo: e.target.value })}>
                  <option value="">Unassigned</option>
                  {[...new Set([...team, ...(open.assignedTo ? [open.assignedTo] : [])])].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="enq-follow">Follow-up date</label>
                <input id="enq-follow" type="date" className="input" value={draft.followUpDate} onChange={(e) => setDraft({ ...draft, followUpDate: e.target.value })} />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="enq-notes">Internal notes</label>
              <textarea id="enq-notes" rows={4} className="input" placeholder="Call summary, site details, next steps…" value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} />
            </div>

            <div className="border-t border-line pt-5">
              {open.projectId ? (
                <Link href="/dashboard/projects" className="flex items-center justify-between card p-4 hover:bg-sand transition-colors">
                  <span className="flex items-center gap-3">
                    <FolderKanban size={16} className="text-bronze" />
                    <span>
                      <span className="block label">Converted to project</span>
                      <span className="block text-sm text-ink font-semibold mt-0.5">{open.projectTitle ?? `Project #${open.projectId}`}</span>
                    </span>
                  </span>
                  <ArrowUpRight size={16} className="text-muted" />
                </Link>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <p className="text-xs text-muted max-w-xs">Creates a draft project (concept stage) with this client’s details and marks the enquiry as converted.</p>
                  <button onClick={convert} disabled={converting} className={btnSecondary}>
                    {converting ? <Loader2 className="animate-spin" size={15} /> : <FolderKanban size={15} />} Convert to project
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </Drawer>
    </>
  )
}
