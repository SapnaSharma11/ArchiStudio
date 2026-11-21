'use client'
import { useRef, useState } from 'react'
import { UploadCloud, Loader2, X } from 'lucide-react'
import { uploadFile } from '@/components/dashboard/upload'

export default function ImageUpload({
  value,
  onChange,
  folder = 'studio',
  accept = 'image/*',
  hint = 'JPG / PNG / WebP · auto-optimised · max 50MB',
}: {
  value?: string | null
  onChange: (url: string) => void
  folder?: string
  accept?: string
  hint?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleFile(file: File) {
    setError('')
    setUploading(true)
    try {
      onChange(await uploadFile(file, folder))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) handleFile(f)
        }}
      />
      {value ? (
        <div className="relative rounded-lg overflow-hidden border border-line group bg-sand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Selected upload preview" className="w-full h-44 object-cover" />
          <div className="absolute inset-0 bg-ink/50 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition flex items-center justify-center gap-2">
            <button type="button" onClick={() => inputRef.current?.click()} className="bg-white text-ink text-xs font-semibold px-3 py-1.5 rounded-md">
              {uploading ? 'Uploading…' : 'Replace'}
            </button>
            <button type="button" onClick={() => onChange('')} className="bg-white text-rust text-xs font-semibold px-3 py-1.5 rounded-md flex items-center gap-1">
              <X size={13} /> Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full border border-dashed border-stone rounded-lg h-32 flex flex-col items-center justify-center text-muted hover:bg-sand hover:text-ink transition disabled:opacity-60 bg-white"
        >
          {uploading ? <Loader2 className="animate-spin" size={22} /> : <UploadCloud size={22} strokeWidth={1.5} />}
          <span className="text-xs font-semibold mt-1.5">{uploading ? 'Uploading…' : 'Click to upload'}</span>
          <span className="text-[10px] text-concrete mt-0.5">{hint}</span>
        </button>
      )}
      {error && <p className="text-rust text-xs font-semibold mt-1.5">{error}</p>}
    </div>
  )
}
