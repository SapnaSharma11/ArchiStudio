'use client'
import { useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { ArrowLeft, ArrowRight, ImagePlus, Loader2, Star, X } from 'lucide-react'
import { uploadFile } from '@/components/dashboard/upload'

/** Ordered list of image URLs with multi-upload, remove and reorder. */
export default function GalleryField({
  value,
  onChange,
  folder = 'projects',
}: {
  value: string[]
  onChange: (urls: string[]) => void
  folder?: string
}) {
  const ref = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [url, setUrl] = useState('')

  async function onFiles(files: FileList) {
    setUploading(true)
    const added: string[] = []
    try {
      for (const f of Array.from(files)) {
        try {
          added.push(await uploadFile(f, folder))
        } catch (e) {
          toast.error(e instanceof Error ? `${f.name}: ${e.message}` : `Upload failed for ${f.name}`)
        }
      }
      if (added.length) onChange([...value, ...added])
    } finally {
      setUploading(false)
      if (ref.current) ref.current.value = ''
    }
  }

  function move(i: number, dir: -1 | 1) {
    const t = i + dir
    if (t < 0 || t >= value.length) return
    const next = [...value]
    const [m] = next.splice(i, 1)
    next.splice(t, 0, m)
    onChange(next)
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-2">
        {value.map((src, i) => (
          <div key={`${src}-${i}`} className="group relative aspect-[4/3] rounded-md overflow-hidden bg-sand border border-line">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={`Gallery image ${i + 1}`} className="w-full h-full object-cover" />
            {i === 0 && (
              <span className="absolute top-1 left-1 bg-ink/80 text-ivory text-[9px] px-1.5 py-0.5 rounded flex items-center gap-1">
                <Star size={9} /> First
              </span>
            )}
            <div className="absolute inset-0 bg-ink/55 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition flex items-center justify-center gap-1">
              <button type="button" onClick={() => move(i, -1)} className="bg-white p-1 rounded text-ink" aria-label="Move earlier"><ArrowLeft size={13} /></button>
              <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="bg-white p-1 rounded text-rust" aria-label="Remove image"><X size={13} /></button>
              <button type="button" onClick={() => move(i, 1)} className="bg-white p-1 rounded text-ink" aria-label="Move later"><ArrowRight size={13} /></button>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => ref.current?.click()}
          disabled={uploading}
          className="aspect-[4/3] border border-dashed border-stone rounded-md flex flex-col items-center justify-center text-muted hover:bg-sand hover:text-ink bg-white disabled:opacity-60"
        >
          {uploading ? <Loader2 className="animate-spin" size={18} /> : <ImagePlus size={18} strokeWidth={1.5} />}
          <span className="text-[10px] font-semibold mt-1">{uploading ? 'Uploading…' : 'Add images'}</span>
        </button>
      </div>
      <input ref={ref} type="file" accept="image/*" multiple className="hidden" onChange={(e) => e.target.files && onFiles(e.target.files)} />
      <div className="flex gap-2">
        <input className="input !mt-0" placeholder="…or paste an image URL / path" value={url} onChange={(e) => setUrl(e.target.value)} />
        <button
          type="button"
          onClick={() => {
            if (url.trim()) onChange([...value, url.trim()])
            setUrl('')
          }}
          className="shrink-0 px-3 rounded-lg border border-line bg-white text-xs font-semibold text-ink hover:bg-sand"
        >
          Add
        </button>
      </div>
    </div>
  )
}
