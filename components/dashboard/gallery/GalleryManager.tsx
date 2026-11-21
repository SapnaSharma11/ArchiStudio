'use client'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Upload, Trash2, Pencil, ArrowLeft, ArrowRight, Loader2, Save, ImagePlus, Eye, EyeOff } from 'lucide-react'
import Drawer from '@/components/dashboard/Drawer'
import ImageUpload from '@/components/dashboard/ImageUpload'
import { Chip, btnPrimary, btnSecondary } from '@/components/dashboard/ui'
import { PROJECT_CATEGORIES, labelOf } from '@/lib/brand'

export type GalleryDTO = {
  id: number
  image: string
  caption: string | null
  category: string | null
  displayOrder: number
  published: boolean
}


export default function GalleryManager({ initial }: { initial: GalleryDTO[] }) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [editing, setEditing] = useState<GalleryDTO | null>(null)
  const [draft, setDraft] = useState<{ image: string; caption: string; category: string; published: boolean }>({
    image: '', caption: '', category: '', published: true,
  })
  const [saving, setSaving] = useState(false)
  const [cat, setCat] = useState('all')

  const items = [...initial].sort((a, b) => a.displayOrder - b.displayOrder)
  const cats = [...new Set(items.map((i) => i.category).filter(Boolean))] as string[]

  async function onFiles(files: FileList) {
    setUploading(true)
    let nextOrder = items.length ? Math.max(...items.map((i) => i.displayOrder)) + 1 : 0
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData()
        fd.append('file', file)
        fd.append('folder', 'gallery')
        const up = await fetch('/api/admin/upload', { method: 'POST', body: fd })
        const upData = await up.json().catch(() => ({}))
        if (!up.ok || !upData.url) {
          toast.error(upData.error ?? `Upload failed for ${file.name}`)
          continue
        }
        await fetch('/api/admin/gallery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: upData.url, displayOrder: nextOrder }),
        })
        nextOrder += 1
      }
      toast.success('Uploaded')
      router.refresh()
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  function openEdit(g: GalleryDTO) {
    setEditing(g)
    setDraft({ image: g.image, caption: g.caption ?? '', category: g.category ?? '', published: g.published })
  }

  async function saveEdit() {
    if (!editing) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/gallery/${editing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: draft.image,
          caption: draft.caption || null,
          category: draft.category || null,
          published: draft.published,
          displayOrder: editing.displayOrder,
        }),
      })
      if (res.ok) {
        toast.success('Gallery item updated')
        setEditing(null)
        router.refresh()
      } else {
        const d = await res.json().catch(() => ({}))
        toast.error(d.error ?? 'Could not save')
      }
    } finally {
      setSaving(false)
    }
  }

  async function remove(g: GalleryDTO) {
    if (!confirm('Delete this image?')) return
    const res = await fetch(`/api/admin/gallery/${g.id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Deleted')
      router.refresh()
    } else toast.error('Could not delete')
  }

  async function move(index: number, dir: -1 | 1) {
    const target = index + dir
    if (target < 0 || target >= items.length) return
    const reordered = [...items]
    const [m] = reordered.splice(index, 1)
    reordered.splice(target, 0, m)
    const order = reordered.map((it, i) => ({ id: it.id, displayOrder: i }))
    const res = await fetch('/api/admin/gallery/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order }),
    })
    if (res.ok) router.refresh()
    else toast.error('Could not reorder')
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <p className="text-sm text-muted">{items.length} image{items.length === 1 ? '' : 's'} · {items.filter((i) => i.published).length} live on the Studio Archive page</p>
        <button onClick={() => fileRef.current?.click()} disabled={uploading} className={btnPrimary}>
          {uploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />} Upload images
        </button>
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => e.target.files && onFiles(e.target.files)} />
      </div>

      {cats.length > 1 && (
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          <Chip active={cat === 'all'} onClick={() => setCat('all')}>All</Chip>
          {cats.map((c) => (
            <Chip key={c} active={cat === c} onClick={() => setCat(c)}>{labelOf(PROJECT_CATEGORIES, c)}</Chip>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        <button
          onClick={() => fileRef.current?.click()}
          className="border border-dashed border-stone rounded-lg aspect-[4/3] flex flex-col items-center justify-center text-muted hover:bg-sand hover:text-ink bg-white transition"
        >
          <ImagePlus size={22} strokeWidth={1.5} />
          <span className="text-xs font-semibold mt-1">Add images</span>
        </button>

        {items.map((g, i) => (cat !== 'all' && g.category !== cat) ? null : (
          <div key={g.id} className="group relative aspect-[4/3] bg-sand rounded-lg overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={g.image} alt={g.caption ?? ''} className={`w-full h-full object-cover ${g.published ? '' : 'opacity-40'}`} />
            <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/55 focus-within:bg-ink/55 transition flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100">
              <div className="flex gap-2">
                <button onClick={() => move(i, -1)} title="Move left" className="bg-white p-1.5 rounded-md text-ink"><ArrowLeft size={15} /></button>
                <button onClick={() => move(i, 1)} title="Move right" className="bg-white p-1.5 rounded-md text-ink"><ArrowRight size={15} /></button>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(g)} title="Edit" className="bg-white p-1.5 rounded-md text-ink"><Pencil size={15} /></button>
                <button onClick={() => remove(g)} title="Delete" className="bg-white p-1.5 rounded-md text-rust"><Trash2 size={15} /></button>
              </div>
            </div>
            {!g.published && <span className="absolute top-2 left-2 bg-ink/80 text-ivory text-[9px] font-semibold px-1.5 py-0.5 rounded">Hidden</span>}
            {g.caption && <span className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-ink/70 to-transparent text-ivory text-[10px] px-2 pt-4 pb-1.5 truncate">{g.caption}</span>}
          </div>
        ))}
      </div>

      <Drawer
        open={!!editing}
        title="Edit archive image"
        onClose={() => setEditing(null)}
        footer={
          <>
            <button onClick={() => setEditing(null)} className={`${btnSecondary} flex-1`}>Cancel</button>
            <button onClick={saveEdit} disabled={saving} className={`${btnPrimary} flex-1`}>
              {saving ? <Loader2 className="animate-spin" size={15} /> : <Save size={15} />} Save
            </button>
          </>
        }
      >
        <div>
          <label className="label">Image</label>
          <div className="mt-1"><ImageUpload value={draft.image} folder="archive" onChange={(url) => setDraft({ ...draft, image: url })} /></div>
        </div>
        <div>
          <label className="label" htmlFor="g-caption">Caption / alt text</label>
          <input id="g-caption" className="input" placeholder="The Courtyard House — Jaipur" value={draft.caption} onChange={(e) => setDraft({ ...draft, caption: e.target.value })} />
        </div>
        <div>
          <label className="label" htmlFor="g-cat">Category</label>
          <select id="g-cat" className="input" value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })}>
            <option value="">— None —</option>
            {PROJECT_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <label className="flex items-center justify-between bg-white border border-line rounded-lg px-4 py-3 cursor-pointer">
          <span className="flex items-center gap-2 text-sm font-semibold text-ink">
            {draft.published ? <Eye size={15} /> : <EyeOff size={15} />} Visible on website
          </span>
          <input type="checkbox" checked={draft.published} onChange={(e) => setDraft({ ...draft, published: e.target.checked })} className="w-5 h-5 accent-[#252522]" />
        </label>
      </Drawer>
    </>
  )
}
