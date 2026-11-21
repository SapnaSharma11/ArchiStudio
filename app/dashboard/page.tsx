import Link from 'next/link'
import { ArrowUpRight, CalendarClock, FolderKanban, Inbox, Quote } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { ACTIVE_PROJECT_STATUSES, PROJECT_STATUSES, formatINR } from '@/lib/brand'
import { StackedBars, Donut, type BarDatum } from '@/components/dashboard/overview/Charts'
import { CardTitle, EnquiryStatusBadge, ProgressBar, ProjectStatusBadge, fmtDate } from '@/components/dashboard/ui'

export const dynamic = 'force-dynamic'

const STATUS_COLORS: Record<string, string> = {
  enquiry: '#d9d3c8', concept: '#a19d95', design: '#b49a7a', documentation: '#7a6347',
  construction: '#252522', completed: '#5f6347', 'on-hold': '#9a3b2e',
}

async function getData() {
  try {
    const [projects, enquiries, testimonials] = await Promise.all([
      prisma.project.findMany({ orderBy: { updatedAt: 'desc' } }),
      prisma.booking.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.testimonial.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
    ])
    return { projects, enquiries, testimonials }
  } catch {
    // DB not provisioned yet — render an empty overview rather than crashing.
    return { projects: [], enquiries: [], testimonials: [] }
  }
}

function revenueSeries(projects: Awaited<ReturnType<typeof getData>>['projects']): { data: BarDatum[]; byYear: boolean } {
  const dated = projects.filter((p) => p.startDate && p.budget)
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth() - 11, 1)
  const recent = dated.filter((p) => p.startDate! >= monthStart)
  const monthsWithData = new Set(recent.map((p) => `${p.startDate!.getFullYear()}-${p.startDate!.getMonth()}`))
  if (monthsWithData.size >= 4) {
    const data: BarDatum[] = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(monthStart.getFullYear(), monthStart.getMonth() + i, 1)
      return { label: d.toLocaleDateString('en-IN', { month: 'short' }), completed: 0, active: 0 }
    })
    for (const p of recent) {
      const idx = (p.startDate!.getFullYear() - monthStart.getFullYear()) * 12 + p.startDate!.getMonth() - monthStart.getMonth()
      if (data[idx]) data[idx][p.status === 'completed' ? 'completed' : 'active'] += p.budget!
    }
    return { data, byYear: false }
  }
  const years = new Map<number, BarDatum>()
  for (const p of dated) {
    const y = p.startDate!.getFullYear()
    const d = years.get(y) ?? { label: String(y), completed: 0, active: 0 }
    d[p.status === 'completed' ? 'completed' : 'active'] += p.budget!
    years.set(y, d)
  }
  return { data: [...years.entries()].sort((a, b) => a[0] - b[0]).slice(-8).map(([, d]) => d), byYear: true }
}

export default async function DashboardHome() {
  const { projects, enquiries, testimonials } = await getData()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const active = projects.filter((p) => ACTIVE_PROJECT_STATUSES.includes(p.status))
  const completed = projects.filter((p) => p.status === 'completed')
  const pendingConsultations = enquiries.filter((e) => e.status === 'confirmed' && e.preferredDate >= today)
  const newEnquiries = enquiries.filter((e) => e.status === 'pending')
  const pipeline = active.reduce((s, p) => s + (p.budget ?? 0), 0)

  const kpis = [
    { label: 'Total projects', value: String(projects.length), note: `${projects.filter((p) => p.published).length} in portfolio`, href: '/dashboard/projects' },
    { label: 'Active projects', value: String(active.length), note: 'Concept → on site', href: '/dashboard/projects' },
    { label: 'Completed', value: String(completed.length), note: 'Handed over', href: '/dashboard/projects' },
    { label: 'Upcoming consultations', value: String(pendingConsultations.length), note: 'Booked, not yet held', href: '/dashboard/enquiries' },
    { label: 'New enquiries', value: String(newEnquiries.length), note: 'Awaiting first contact', href: '/dashboard/enquiries' },
    { label: 'Pipeline value', value: formatINR(pipeline), note: 'Budgets of active work', href: '/dashboard/projects' },
  ]

  const { data: revenue, byYear } = revenueSeries(projects)
  const statusData = PROJECT_STATUSES.map((s) => ({
    label: s.label,
    value: projects.filter((p) => p.status === s.value).length,
    color: STATUS_COLORS[s.value] ?? '#a19d95',
  }))

  const horizon = new Date(today.getTime() + 120 * 86_400_000)
  const deadlines = active
    .filter((p) => p.deadline && p.deadline <= horizon)
    .sort((a, b) => a.deadline!.getTime() - b.deadline!.getTime())
    .slice(0, 6)

  type Activity = { at: Date; text: string; meta: string; icon: 'enquiry' | 'project' | 'testimonial' }
  const activity: Activity[] = [
    ...enquiries.slice(0, 6).map((e) => ({ at: e.createdAt, text: `New enquiry from ${e.fullName}`, meta: e.projectType ?? 'Consultation request', icon: 'enquiry' as const })),
    ...projects.slice(0, 6).map((p) => ({ at: p.updatedAt, text: `${p.title} updated`, meta: PROJECT_STATUSES.find((s) => s.value === p.status)?.label ?? p.status, icon: 'project' as const })),
    ...testimonials.map((t) => ({ at: t.createdAt, text: `Client story from ${t.name.split('—')[0].trim()}`, meta: t.approved ? 'Published' : 'Awaiting approval', icon: 'testimonial' as const })),
  ]
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, 8)
  const ICONS = { enquiry: Inbox, project: FolderKanban, testimonial: Quote }

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">{today.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        <p className="text-sm text-muted mt-1">Here is where the studio stands today.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-px bg-line border border-line rounded-lg overflow-hidden">
        {kpis.map((k) => (
          <Link key={k.label} href={k.href} className="bg-white p-4 sm:p-5 hover:bg-ivory transition-colors group">
            <p className="label !text-[10px]">{k.label}</p>
            <p className="font-display text-[34px] sm:text-[40px] leading-none text-ink mt-3 tabular-nums">{k.value}</p>
            <p className="text-[11px] text-muted mt-2 flex items-center gap-1">
              {k.note}
              <ArrowUpRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <section className="card p-5 sm:p-6 xl:col-span-2">
          <CardTitle
            action={
              <div className="flex items-center gap-4 text-[11px] text-muted">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-ink rounded-sm" /> Completed</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-bronze rounded-sm" /> In progress</span>
              </div>
            }
          >
            Revenue overview
          </CardTitle>
          <p className="text-xs text-muted -mt-2 mb-3">Project value by {byYear ? 'start year' : 'start month (last 12 months)'}</p>
          {revenue.length === 0 ? (
            <p className="text-sm text-muted py-16 text-center">Add budgets and start dates to projects to see revenue.</p>
          ) : (
            <StackedBars data={revenue} title="Project value over time" desc={`Stacked bars of completed and in-progress project budgets by ${byYear ? 'year' : 'month'}.`} />
          )}
        </section>

        <section className="card p-5 sm:p-6">
          <CardTitle>Project status</CardTitle>
          <Donut data={statusData} centerLabel="Projects" />
        </section>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <section className="card p-5 sm:p-6">
          <CardTitle action={<CalendarClock size={16} className="text-bronze" />}>Upcoming deadlines</CardTitle>
          {deadlines.length === 0 ? (
            <p className="text-sm text-muted py-6">No active deadlines in the next 120 days.</p>
          ) : (
            <ul className="divide-y divide-line">
              {deadlines.map((p) => {
                const days = Math.ceil((p.deadline!.getTime() - today.getTime()) / 86_400_000)
                return (
                  <li key={p.id} className="py-3 flex items-center gap-3">
                    <div className="w-12 text-center shrink-0">
                      <div className={`font-display text-2xl leading-none ${days < 0 ? 'text-rust' : days <= 30 ? 'text-bronze-deep' : 'text-ink'}`}>{Math.abs(days)}</div>
                      <div className="text-[9px] uppercase tracking-wider text-muted mt-0.5">{days < 0 ? 'late' : 'days'}</div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-ink truncate">{p.title}</div>
                      <div className="text-[11px] text-muted">{fmtDate(p.deadline)}</div>
                    </div>
                    <ProjectStatusBadge status={p.status} />
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        <section className="card p-5 sm:p-6">
          <CardTitle action={<Link href="/dashboard/enquiries" className="text-[11px] font-semibold uppercase tracking-wider text-muted hover:text-ink">All</Link>}>
            Recent enquiries
          </CardTitle>
          {enquiries.length === 0 ? (
            <p className="text-sm text-muted py-6">No enquiries yet.</p>
          ) : (
            <ul className="divide-y divide-line">
              {enquiries.slice(0, 5).map((e) => (
                <li key={e.id} className="py-3 flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-ink truncate">{e.fullName}</div>
                    <div className="text-[11px] text-muted truncate">{[e.projectType, e.location].filter(Boolean).join(' · ') || e.problem}</div>
                  </div>
                  <EnquiryStatusBadge status={e.status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card p-5 sm:p-6">
          <CardTitle action={<Link href="/dashboard/projects" className="text-[11px] font-semibold uppercase tracking-wider text-muted hover:text-ink">All</Link>}>
            Recently updated
          </CardTitle>
          {projects.length === 0 ? (
            <p className="text-sm text-muted py-6">No projects yet.</p>
          ) : (
            <ul className="divide-y divide-line">
              {projects.slice(0, 5).map((p) => (
                <li key={p.id} className="py-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-ink truncate">{p.title}</span>
                    <span className="text-[11px] text-muted shrink-0">{fmtDate(p.updatedAt, { day: '2-digit', month: 'short' })}</span>
                  </div>
                  <ProgressBar value={p.progress} className="mt-2" />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="card p-5 sm:p-6">
        <CardTitle>Recent activity</CardTitle>
        {activity.length === 0 ? (
          <p className="text-sm text-muted py-6">Activity will appear here as the studio works.</p>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
            {activity.map((a, i) => {
              const Icon = ICONS[a.icon]
              return (
                <li key={i} className="py-3 flex items-center gap-3 border-b border-line">
                  <span className="w-8 h-8 rounded-full bg-sand flex items-center justify-center shrink-0">
                    <Icon size={14} className="text-bronze-deep" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm text-ink truncate">{a.text}</div>
                    <div className="text-[11px] text-muted">{a.meta}</div>
                  </div>
                  <span className="text-[11px] text-muted shrink-0">{fmtDate(a.at, { day: '2-digit', month: 'short' })}</span>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
