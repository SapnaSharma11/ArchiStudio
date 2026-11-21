'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Trash2, Check, EyeOff } from 'lucide-react'
import { Badge, Chip, EmptyState, btnIcon, btnPrimary, btnSecondary, fmtDate } from '@/components/dashboard/ui'

export type TestimonialDTO = {
  id: number
  name: string
  rating: number
  message: string
  approved: boolean
  createdAt: string
}

export default function TestimonialsManager({ initial }: { initial: TestimonialDTO[] }) {
  const router = useRouter()
  const pending = initial.filter((t) => !t.approved)
  const [view, setView] = useState<'all' | 'pending' | 'live'>(pending.length ? 'pending' : 'all')
  const list = view === 'all' ? initial : initial.filter((t) => (view === 'live' ? t.approved : !t.approved))

  async function setApproved(t: TestimonialDTO, approved: boolean) {
    const res = await fetch(`/api/admin/testimonials/${t.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approved }),
    })
    if (res.ok) {
      toast.success(approved ? 'Approved — now live on the website' : 'Hidden from the website')
      router.refresh()
    } else toast.error('Could not update')
  }

  async function remove(t: TestimonialDTO) {
    if (!confirm(`Delete the story from ${t.name}? This cannot be undone.`)) return
    const res = await fetch(`/api/admin/testimonials/${t.id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Deleted')
      router.refresh()
    } else toast.error('Could not delete')
  }

  if (initial.length === 0) return <EmptyState>No client stories yet. Reviews submitted on the website appear here.</EmptyState>

  return (
    <>
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        <Chip active={view === 'pending'} onClick={() => setView('pending')}>Awaiting approval <span className="opacity-60 ml-1">{pending.length}</span></Chip>
        <Chip active={view === 'live'} onClick={() => setView('live')}>Live <span className="opacity-60 ml-1">{initial.length - pending.length}</span></Chip>
        <Chip active={view === 'all'} onClick={() => setView('all')}>All <span className="opacity-60 ml-1">{initial.length}</span></Chip>
      </div>

      {list.length === 0 ? (
        <EmptyState>Nothing here.</EmptyState>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {list.map((t) => (
            <article key={t.id} className={`card p-5 flex flex-col ${t.approved ? '' : 'border-bronze/60 bg-[#fdfbf7]'}`}>
              <div className="flex items-center justify-between gap-3">
                <span className="text-bronze tracking-[0.2em] text-sm" aria-label={`${t.rating} out of 5`}>
                  {'★'.repeat(t.rating)}<span className="text-stone">{'★'.repeat(5 - t.rating)}</span>
                </span>
                {t.approved ? <Badge tone="olive">Live</Badge> : <Badge tone="bronze">Awaiting approval</Badge>}
              </div>
              <blockquote className="font-display text-xl leading-snug text-ink mt-3 flex-1">“{t.message}”</blockquote>
              <div className="mt-4 pt-4 border-t border-line flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink truncate">{t.name}</p>
                  <p className="text-[11px] text-muted">{fmtDate(t.createdAt)}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {t.approved ? (
                    <button onClick={() => setApproved(t, false)} className={`${btnSecondary} !py-1.5 !px-3 !text-xs`}>
                      <EyeOff size={13} /> Hide
                    </button>
                  ) : (
                    <button onClick={() => setApproved(t, true)} className={`${btnPrimary} !py-1.5 !px-3 !text-xs`}>
                      <Check size={13} /> Approve
                    </button>
                  )}
                  <button onClick={() => remove(t)} className={`${btnIcon} hover:!text-rust`} aria-label={`Delete story from ${t.name}`}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  )
}
