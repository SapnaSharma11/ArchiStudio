'use client'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, Eye, EyeOff, Search, Save, Loader2 } from 'lucide-react'
import Drawer from '@/components/dashboard/Drawer'
import ImageUpload from '@/components/dashboard/ImageUpload'
import GalleryField from '@/components/dashboard/GalleryField'
import { Badge, Chip, EmptyState, Monogram, btnIcon, btnPrimary, btnSecondary } from '@/components/dashboard/ui'

/**
 * Generic, config-driven CRUD manager used by most dashboard modules.
 * Talks to `/api/admin/<resource>` (+ `/<id>`) — see lib/crud.ts.
 */

export type FieldType =
  | 'text' | 'textarea' | 'number' | 'currency' | 'image' | 'gallery' | 'date' | 'time'
  | 'select' | 'tags' | 'checkbox' | 'heading' | 'email' | 'url'

export type FieldDef = {
  key: string
  label: string
  type: FieldType
  placeholder?: string
  hint?: string
  options?: readonly { value: string; label: string }[]
  folder?: string
  accept?: string
  half?: boolean
  rows?: number
}

export type Item = Record<string, unknown> & { id: number; published?: boolean }

export type Column = {
  label: string
  render: (item: Item) => React.ReactNode
  className?: string
}

export type Tab = { label: string; filter: (item: Item) => boolean }

export type ResourceConfig = {
  resource: string
  singular: string
  /** Plural label for search / empty states (defaults to resource). */
  plural?: string
  titleField: string
  imageField?: string
  badge?: (item: Item) => React.ReactNode
  /** @deprecated use `badge` */
  badgeField?: string
  subtitle?: (item: Item) => string
  publishable?: boolean
  /** Label for the published toggle (default "Visible on website"). */
  publishLabel?: string
  fields: FieldDef[]
  layout?: 'cards' | 'rows' | 'table'
  columns?: Column[]
  tabs?: Tab[]
  /** Extra fields to match in search. */
  searchFields?: string[]
  /** Draft values for a new item (merged over blanks). */
  defaults?: Record<string, unknown>
  /** Show an initials monogram when there's no image. */
  monogram?: boolean
  /** Hide the "Display order" input. */
  hideOrder?: boolean
  wideDrawer?: boolean
  /** Image aspect for card layout. */
  cardAspect?: string
}

const isValueField = (f: FieldDef) => f.type !== 'heading'

function blankDraft(cfg: ResourceConfig): Record<string, unknown> {
  const d: Record<string, unknown> = { displayOrder: 0 }
  if (cfg.publishable) d.published = true
  for (const f of cfg.fields.filter(isValueField)) {
    d[f.key] = f.type === 'checkbox' ? false : f.type === 'gallery' ? [] : ''
  }
  return { ...d, ...(cfg.defaults ?? {}) }
}

function toDraft(item: Item, cfg: ResourceConfig): Record<string, unknown> {
  const d: Record<string, unknown> = { displayOrder: (item.displayOrder as number) ?? 0 }
  if (cfg.publishable) d.published = item.published ?? true
  for (const f of cfg.fields.filter(isValueField)) {
    const v = item[f.key]
    if (f.type === 'tags') d[f.key] = Array.isArray(v) ? v.join('\n') : ''
    else if (f.type === 'gallery') d[f.key] = Array.isArray(v) ? v : []
    else if (f.type === 'checkbox') d[f.key] = Boolean(v)
    else if (f.type === 'date') d[f.key] = v ? String(v).slice(0, 10) : ''
    else d[f.key] = v ?? ''
  }
  return d
}

function buildPayload(draft: Record<string, unknown>, cfg: ResourceConfig): Record<string, unknown> {
  const p: Record<string, unknown> = { displayOrder: Number(draft.displayOrder) || 0 }
  if (cfg.publishable) p.published = Boolean(draft.published)
  for (const f of cfg.fields.filter(isValueField)) {
    const v = draft[f.key]
    if (f.type === 'tags') p[f.key] = String(v ?? '').split('\n').map((s) => s.trim()).filter(Boolean)
    else if (f.type === 'gallery') p[f.key] = Array.isArray(v) ? v : []
    else if (f.type === 'checkbox') p[f.key] = Boolean(v)
    else if (f.type === 'number' || f.type === 'currency') p[f.key] = v === '' || v == null ? null : Number(v)
    else p[f.key] = v === '' ? null : v
  }
  return p
}

export default function ResourceManager({ config, initial }: { config: ResourceConfig; initial: Item[] }) {
  const router = useRouter()
  const {
    resource, singular, plural = resource, titleField, imageField, subtitle, publishable,
    fields, layout = 'cards', columns, tabs, searchFields = [], monogram, hideOrder,
  } = config

  const [query, setQuery] = useState('')
  const [tab, setTab] = useState(0)
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [draft, setDraft] = useState<Record<string, unknown>>(() => blankDraft(config))
  const [saving, setSaving] = useState(false)

  const badgeFor = (it: Item): React.ReactNode =>
    config.badge ? config.badge(it) : config.badgeField && it[config.badgeField] ? <Badge tone="bronze">{String(it[config.badgeField])}</Badge> : null

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const byTab = tabs?.[tab] ? initial.filter(tabs[tab].filter) : initial
    if (!q) return byTab
    return byTab.filter((it) =>
      [titleField, ...searchFields].some((k) => String(it[k] ?? '').toLowerCase().includes(q)),
    )
  }, [initial, query, tab, tabs, titleField, searchFields])

  function openCreate() {
    setEditingId(null)
    setDraft(blankDraft(config))
    setOpen(true)
  }
  function openEdit(it: Item) {
    setEditingId(it.id)
    setDraft(toDraft(it, config))
    setOpen(true)
  }

  async function save() {
    setSaving(true)
    try {
      const res = await fetch(editingId ? `/api/admin/${resource}/${editingId}` : `/api/admin/${resource}`, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload(draft, config)),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        toast.success(editingId ? `${singular} updated` : `${singular} created`)
        setOpen(false)
        router.refresh()
      } else toast.error(data.error ?? 'Could not save')
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function toggle(it: Item) {
    const res = await fetch(`/api/admin/${resource}/${it.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !it.published }),
    })
    if (res.ok) {
      toast.success(it.published ? 'Hidden from website' : 'Now visible on website')
      router.refresh()
    } else toast.error('Could not update visibility')
  }

  async function remove(it: Item) {
    if (!confirm(`Delete “${String(it[titleField])}”? This cannot be undone.`)) return
    const res = await fetch(`/api/admin/${resource}/${it.id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success(`${singular} deleted`)
      router.refresh()
    } else toast.error('Could not delete')
  }

  const actions = (it: Item) => (
    <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
      <button onClick={() => openEdit(it)} className={btnIcon} title="Edit" aria-label={`Edit ${String(it[titleField])}`}>
        <Pencil size={14} />
      </button>
      {publishable && (
        <button onClick={() => toggle(it)} className={btnIcon} title={it.published ? 'Hide from website' : 'Show on website'} aria-label={it.published ? 'Hide' : 'Show'}>
          {it.published ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      )}
      <button onClick={() => remove(it)} className={`${btnIcon} hover:!text-rust`} title="Delete" aria-label={`Delete ${String(it[titleField])}`}>
        <Trash2 size={14} />
      </button>
    </div>
  )

  const visibility = (it: Item) =>
    publishable ? <Badge tone={it.published ? 'olive' : 'outline'}>{it.published ? 'Live' : 'Draft'}</Badge> : null

  const thumb = (it: Item, cls: string) => {
    const src = imageField ? it[imageField] : null
    if (src) {
      // eslint-disable-next-line @next/next/no-img-element
      return <img src={String(src)} alt="" className={`${cls} object-cover bg-sand`} />
    }
    if (monogram) return <Monogram name={String(it[titleField] ?? '')} className={`${cls} text-xl !rounded-md`} />
    if (imageField) return <div className={`${cls} bg-sand`} />
    return null
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-3">
        <div className="flex items-center gap-2 bg-white border border-line rounded-lg px-3 py-2 w-full sm:w-80">
          <Search size={15} className="text-concrete shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${plural}…`}
            aria-label={`Search ${plural}`}
            className="text-sm outline-none w-full bg-transparent"
          />
        </div>
        <button onClick={openCreate} className={`${btnPrimary} shrink-0`}>
          <Plus size={15} /> Add {singular.toLowerCase()}
        </button>
      </div>

      {tabs && (
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1 -mx-1 px-1">
          {tabs.map((t, i) => (
            <Chip key={t.label} active={tab === i} onClick={() => setTab(i)}>
              {t.label} <span className="opacity-60 ml-1">{initial.filter(t.filter).length}</span>
            </Chip>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState>
          {initial.length === 0 ? `No ${plural} yet. Use “Add ${singular.toLowerCase()}” to create one.` : 'Nothing matches this view.'}
        </EmptyState>
      ) : layout === 'table' && columns ? (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm min-w-[880px]">
            <thead>
              <tr className="text-left text-[10.5px] uppercase tracking-[0.1em] text-muted border-b border-line">
                {columns.map((c) => <th key={c.label} className={`px-4 py-3 font-semibold ${c.className ?? ''}`}>{c.label}</th>)}
                <th className="px-4 py-3 w-28"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((it) => (
                <tr key={it.id} className="hover:bg-ivory/70 cursor-pointer align-middle" onClick={() => openEdit(it)}>
                  {columns.map((c) => <td key={c.label} className={`px-4 py-3 ${c.className ?? ''}`}>{c.render(it)}</td>)}
                  <td className="px-4 py-3">{actions(it)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : layout === 'rows' ? (
        <div className="card divide-y divide-line">
          {filtered.map((it) => (
            <div key={it.id} className="p-4 flex items-center gap-4">
              {thumb(it, 'w-20 h-14 rounded-md shrink-0')}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-ink truncate">{String(it[titleField])}</h3>
                  {badgeFor(it)}
                  {visibility(it)}
                </div>
                {subtitle && <p className="text-xs text-muted mt-0.5 truncate">{subtitle(it)}</p>}
              </div>
              <div className="shrink-0">{actions(it)}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((it) => (
            <div key={it.id} className="card overflow-hidden group flex flex-col">
              {(imageField || monogram) && (
                <button type="button" onClick={() => openEdit(it)} className={`relative block w-full ${config.cardAspect ?? 'aspect-[4/3]'} overflow-hidden`}>
                  {thumb(it, 'absolute inset-0 w-full h-full transition-transform duration-700 group-hover:scale-[1.03]')}
                  <span className="absolute top-3 left-3 flex gap-1.5">{visibility(it)}</span>
                </button>
              )}
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex gap-1.5 flex-wrap">{badgeFor(it)}{!imageField && !monogram && visibility(it)}</div>
                <h3 className="font-display text-xl text-ink mt-1.5 leading-tight">{String(it[titleField])}</h3>
                {subtitle && <p className="text-xs text-muted mt-1 line-clamp-2">{subtitle(it)}</p>}
                <div className="mt-auto pt-3 flex justify-end">{actions(it)}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Drawer
        open={open}
        wide={config.wideDrawer}
        title={editingId ? `Edit ${singular.toLowerCase()}` : `New ${singular.toLowerCase()}`}
        subtitle={editingId ? String(draft[titleField] ?? '') : undefined}
        onClose={() => setOpen(false)}
        footer={
          <>
            <button onClick={() => setOpen(false)} className={`${btnSecondary} flex-1`}>Cancel</button>
            <button onClick={save} disabled={saving} className={`${btnPrimary} flex-1`}>
              {saving ? <Loader2 className="animate-spin" size={15} /> : <Save size={15} />} Save
            </button>
          </>
        }
      >
        {renderFields(fields, draft, setDraft)}
        {!hideOrder && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="rm-order">Display order</label>
              <input id="rm-order" type="number" className="input" value={String(draft.displayOrder ?? 0)} onChange={(e) => setDraft({ ...draft, displayOrder: e.target.value })} />
            </div>
          </div>
        )}
        {publishable && (
          <label className="flex items-center justify-between bg-white border border-line rounded-lg px-4 py-3 cursor-pointer">
            <span>
              <span className="block text-sm font-semibold text-ink">{config.publishLabel ?? 'Visible on website'}</span>
              <span className="block text-[11px] text-muted">Turn off to keep as a draft</span>
            </span>
            <input type="checkbox" checked={Boolean(draft.published)} onChange={(e) => setDraft({ ...draft, published: e.target.checked })} className="w-5 h-5 accent-[#252522]" />
          </label>
        )}
      </Drawer>
    </>
  )
}

function renderFields(
  fields: FieldDef[],
  draft: Record<string, unknown>,
  setDraft: (d: Record<string, unknown>) => void,
) {
  const set = (key: string, value: unknown) => setDraft({ ...draft, [key]: value })
  const rows: React.ReactNode[] = []
  let i = 0
  while (i < fields.length) {
    const f = fields[i]
    if (f.half && fields[i + 1]?.half) {
      rows.push(
        <div key={f.key} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field f={fields[i]} draft={draft} set={set} />
          <Field f={fields[i + 1]} draft={draft} set={set} />
        </div>,
      )
      i += 2
    } else {
      rows.push(<Field key={f.key} f={f} draft={draft} set={set} />)
      i += 1
    }
  }
  return rows
}

function Field({ f, draft, set }: { f: FieldDef; draft: Record<string, unknown>; set: (key: string, value: unknown) => void }) {
  const val = draft[f.key]
  const id = `f-${f.key}`

  if (f.type === 'heading') {
    return (
      <div className="pt-3 first:pt-0">
        <p className="eyebrow">{f.label}</p>
        <div className="h-px bg-line mt-2" />
      </div>
    )
  }

  if (f.type === 'checkbox') {
    return (
      <label className="flex items-center justify-between bg-white border border-line rounded-lg px-4 py-3 cursor-pointer">
        <span>
          <span className="block text-sm font-semibold text-ink">{f.label}</span>
          {f.hint && <span className="block text-[11px] text-muted">{f.hint}</span>}
        </span>
        <input type="checkbox" checked={Boolean(val)} onChange={(e) => set(f.key, e.target.checked)} className="w-5 h-5 accent-[#252522]" />
      </label>
    )
  }

  const label = <label className="label" htmlFor={id}>{f.label}</label>
  const hint = f.hint ? <p className="text-[11px] text-concrete mt-1">{f.hint}</p> : null

  if (f.type === 'image') {
    return (
      <div>
        {label}
        <div className="mt-1.5">
          <ImageUpload value={val as string} folder={f.folder ?? 'studio'} accept={f.accept ?? 'image/*'} onChange={(url) => set(f.key, url)} />
        </div>
        {hint}
      </div>
    )
  }
  if (f.type === 'gallery') {
    return (
      <div>
        {label}
        <div className="mt-1.5">
          <GalleryField value={(val as string[]) ?? []} folder={f.folder ?? 'projects'} onChange={(urls) => set(f.key, urls)} />
        </div>
        {hint}
      </div>
    )
  }
  if (f.type === 'currency') {
    return (
      <div>
        {label}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-[40%] text-sm text-muted">₹</span>
          <input id={id} type="number" min={0} inputMode="numeric" className="input pl-7" placeholder={f.placeholder} value={String(val ?? '')} onChange={(e) => set(f.key, e.target.value)} />
        </div>
        {hint}
      </div>
    )
  }
  return (
    <div>
      {label}
      {f.type === 'textarea' || f.type === 'tags' ? (
        <textarea id={id} rows={f.rows ?? (f.type === 'tags' ? 4 : 3)} className="input resize-y" placeholder={f.placeholder} value={String(val ?? '')} onChange={(e) => set(f.key, e.target.value)} />
      ) : f.type === 'select' ? (
        <select id={id} className="input" value={String(val ?? '')} onChange={(e) => set(f.key, e.target.value)}>
          <option value="">— Select —</option>
          {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : (
        <input
          id={id}
          type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : f.type === 'time' ? 'time' : f.type === 'email' ? 'email' : f.type === 'url' ? 'url' : 'text'}
          className="input"
          placeholder={f.placeholder}
          value={String(val ?? '')}
          onChange={(e) => set(f.key, e.target.value)}
        />
      )}
      {hint ?? (f.type === 'tags' ? <p className="text-[11px] text-concrete mt-1">One per line</p> : null)}
    </div>
  )
}
