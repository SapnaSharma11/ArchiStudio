'use client'
import ResourceManager, { type ResourceConfig, type Item } from '@/components/dashboard/ResourceManager'
import { ProjectStatusBadge, ProgressBar, fmtDate } from '@/components/dashboard/ui'
import { PROJECT_DEFAULTS, PROJECT_FIELDS, categoryLabel } from '@/components/dashboard/projects/projectConfig'
import { ACTIVE_PROJECT_STATUSES, formatINR } from '@/lib/brand'

function deadlineCell(it: Item) {
  if (!it.deadline) return <span className="text-concrete">—</span>
  const days = Math.ceil((new Date(String(it.deadline)).getTime() - Date.now()) / 86_400_000)
  const late = days < 0 && it.status !== 'completed'
  return (
    <div className="leading-tight">
      <div className="text-ink">{fmtDate(it.deadline)}</div>
      {it.status !== 'completed' && (
        <div className={`text-[11px] ${late ? 'text-rust' : 'text-muted'}`}>{late ? `${-days} days overdue` : `${days} days left`}</div>
      )}
    </div>
  )
}

const config: ResourceConfig = {
  resource: 'projects',
  singular: 'Project',
  plural: 'projects',
  titleField: 'title',
  imageField: 'coverImage',
  publishable: true,
  publishLabel: 'Published in portfolio',
  layout: 'table',
  wideDrawer: true,
  defaults: PROJECT_DEFAULTS,
  searchFields: ['clientName', 'location', 'category', 'status'],
  tabs: [
    { label: 'All', filter: () => true },
    { label: 'Active', filter: (it) => ACTIVE_PROJECT_STATUSES.includes(String(it.status)) },
    { label: 'Completed', filter: (it) => it.status === 'completed' },
    { label: 'On hold', filter: (it) => it.status === 'on-hold' },
    { label: 'Enquiry stage', filter: (it) => it.status === 'enquiry' },
  ],
  columns: [
    {
      label: 'Project',
      render: (it) => (
        <div className="flex items-center gap-3 min-w-0">
          {it.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={String(it.coverImage)} alt="" className="w-12 h-9 rounded object-cover bg-sand shrink-0" />
          ) : (
            <div className="w-12 h-9 rounded bg-sand shrink-0" />
          )}
          <div className="min-w-0">
            <div className="font-semibold text-ink truncate max-w-[220px]">{String(it.title)}</div>
            <div className="text-[11px] text-muted truncate">{categoryLabel(it)}{it.location ? ` · ${it.location}` : ''}</div>
          </div>
        </div>
      ),
    },
    { label: 'Client', render: (it) => <span className="text-ink-muted">{String(it.clientName ?? '—')}</span> },
    { label: 'Status', render: (it) => <ProjectStatusBadge status={String(it.status)} /> },
    { label: 'Progress', className: 'w-40', render: (it) => <ProgressBar value={Number(it.progress ?? 0)} /> },
    { label: 'Budget', className: 'text-right', render: (it) => <span className="tabular-nums">{formatINR(it.budget as number | null)}</span> },
    { label: 'Deadline', render: deadlineCell },
  ],
  fields: PROJECT_FIELDS,
}

export default function ProjectsManager({ initial }: { initial: Item[] }) {
  return <ResourceManager config={config} initial={initial} />
}
