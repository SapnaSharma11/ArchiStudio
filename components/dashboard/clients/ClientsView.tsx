'use client'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, Mail, MapPin, Phone, Search } from 'lucide-react'
import Drawer from '@/components/dashboard/Drawer'
import { EmptyState, EnquiryStatusBadge, Monogram, ProgressBar, ProjectStatusBadge, fmtDate } from '@/components/dashboard/ui'
import { formatINR } from '@/lib/brand'

export type ClientDTO = {
  key: string
  name: string
  email: string | null
  phone: string | null
  location: string | null
  enquiries: {
    id: number; createdAt: string; status: string; projectType: string | null; budget: string | null
    brief: string; notes: string | null; followUpDate: string | null; preferredDate: string; preferredTime: string
    assignedTo: string | null
  }[]
  projects: { id: number; title: string; status: string; budget: number | null; progress: number; slug: string; published: boolean }[]
  totalBudget: number
  lastActivity: string | null
}

export default function ClientsView({ clients }: { clients: ClientDTO[] }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState<ClientDTO | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return clients
    return clients.filter((c) => [c.name, c.email, c.phone, c.location].some((v) => (v ?? '').toLowerCase().includes(q)))
  }, [clients, query])

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2 bg-white border border-line rounded-lg px-3 py-2 w-full sm:w-80">
          <Search size={15} className="text-concrete shrink-0" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search clients…" aria-label="Search clients" className="text-sm outline-none w-full bg-transparent" />
        </div>
        <p className="text-xs text-muted">Built automatically from enquiries and projects · {clients.length} clients</p>
      </div>

      {filtered.length === 0 ? (
        <EmptyState>{clients.length === 0 ? 'No clients yet. They appear here as enquiries and projects come in.' : 'No clients match your search.'}</EmptyState>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm min-w-[820px]">
            <thead>
              <tr className="text-left text-[10.5px] uppercase tracking-[0.1em] text-muted border-b border-line">
                <th className="px-4 py-3 font-semibold">Client</th>
                <th className="px-4 py-3 font-semibold">Contact</th>
                <th className="px-4 py-3 font-semibold text-center">Enquiries</th>
                <th className="px-4 py-3 font-semibold text-center">Projects</th>
                <th className="px-4 py-3 font-semibold text-right">Total budget</th>
                <th className="px-4 py-3 font-semibold">Last activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((c) => (
                <tr key={c.key} className="hover:bg-ivory/70 cursor-pointer" onClick={() => setOpen(c)}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Monogram name={c.name} className="w-9 h-9 text-sm" />
                      <div>
                        <div className="font-semibold text-ink">{c.name}</div>
                        {c.location && <div className="text-[11px] text-muted">{c.location}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink-muted">
                    <div>{c.email ?? '—'}</div>
                    <div className="text-[11px] text-muted">{c.phone ?? ''}</div>
                  </td>
                  <td className="px-4 py-3 text-center tabular-nums">{c.enquiries.length}</td>
                  <td className="px-4 py-3 text-center tabular-nums">{c.projects.length}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{c.totalBudget ? formatINR(c.totalBudget) : '—'}</td>
                  <td className="px-4 py-3 text-ink-muted whitespace-nowrap">{fmtDate(c.lastActivity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Drawer open={!!open} title={open?.name ?? ''} subtitle={open?.location ?? undefined} onClose={() => setOpen(null)} wide>
        {open && (
          <>
            <section className="card p-4 space-y-2 text-sm">
              <p className="label mb-1">Contact information</p>
              {open.email && <a href={`mailto:${open.email}`} className="flex items-center gap-2 text-ink hover:text-bronze-deep"><Mail size={14} className="text-bronze" /> {open.email}</a>}
              {open.phone && <a href={`tel:${open.phone}`} className="flex items-center gap-2 text-ink hover:text-bronze-deep"><Phone size={14} className="text-bronze" /> {open.phone}</a>}
              {open.location && <p className="flex items-center gap-2 text-ink"><MapPin size={14} className="text-bronze" /> {open.location}</p>}
            </section>

            {open.enquiries[0] && (
              <section>
                <p className="label">Project requirements (latest brief)</p>
                <p className="mt-1.5 text-sm text-ink leading-relaxed whitespace-pre-line bg-white border border-line rounded-lg p-4">{open.enquiries[0].brief}</p>
              </section>
            )}

            <section>
              <p className="label mb-2">Associated projects</p>
              {open.projects.length === 0 ? (
                <p className="text-sm text-muted">No projects yet.</p>
              ) : (
                <ul className="card divide-y divide-line">
                  {open.projects.map((p) => (
                    <li key={p.id} className="p-3 flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-ink text-sm">{p.title}</span>
                          <ProjectStatusBadge status={p.status} />
                        </div>
                        <ProgressBar value={p.progress} className="mt-2 max-w-[260px]" />
                      </div>
                      <span className="text-xs tabular-nums text-muted">{formatINR(p.budget)}</span>
                      <Link href={p.published ? `/projects/${p.slug}` : '/dashboard/projects'} target={p.published ? '_blank' : undefined} className="text-muted hover:text-ink" aria-label={`Open ${p.title}`}>
                        <ArrowUpRight size={15} />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <p className="label mb-2">Consultation history</p>
              {open.enquiries.length === 0 ? (
                <p className="text-sm text-muted">No enquiries on record.</p>
              ) : (
                <ol className="relative border-l border-line ml-1.5 space-y-4">
                  {open.enquiries.map((e) => (
                    <li key={e.id} className="pl-5 relative">
                      <span className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-bronze" />
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-ink">{e.projectType ?? 'Enquiry'}</span>
                        <EnquiryStatusBadge status={e.status} />
                      </div>
                      <p className="text-[11px] text-muted mt-0.5">
                        Received {fmtDate(e.createdAt)} · consultation {fmtDate(e.preferredDate, { day: '2-digit', month: 'short' })} {e.preferredTime}
                        {e.budget ? ` · ${e.budget}` : ''}
                      </p>
                    </li>
                  ))}
                </ol>
              )}
            </section>

            <section>
              <p className="label mb-2">Communication history</p>
              {open.enquiries.every((e) => !e.notes && !e.followUpDate && !e.assignedTo) ? (
                <p className="text-sm text-muted">No notes yet — add them from Enquiries.</p>
              ) : (
                <ul className="space-y-2">
                  {open.enquiries
                    .filter((e) => e.notes || e.followUpDate || e.assignedTo)
                    .map((e) => (
                      <li key={e.id} className="card p-3 text-sm">
                        <p className="text-[11px] text-muted">
                          {fmtDate(e.createdAt)}
                          {e.assignedTo ? ` · handled by ${e.assignedTo}` : ''}
                          {e.followUpDate ? ` · follow up ${fmtDate(e.followUpDate)}` : ''}
                        </p>
                        {e.notes && <p className="text-ink mt-1 whitespace-pre-line">{e.notes}</p>}
                      </li>
                    ))}
                </ul>
              )}
            </section>
          </>
        )}
      </Drawer>
    </>
  )
}
