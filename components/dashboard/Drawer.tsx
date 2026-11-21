'use client'
import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Drawer({
  open,
  title,
  subtitle,
  onClose,
  children,
  footer,
  wide,
}: {
  open: boolean
  title: string
  subtitle?: string
  onClose: () => void
  children: React.ReactNode
  footer?: React.ReactNode
  wide?: boolean
}) {
  // Close on Escape.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]" onClick={onClose} />
      <div
        className={`absolute right-0 top-0 h-full w-full ${wide ? 'sm:max-w-[640px]' : 'sm:max-w-[480px]'} bg-ivory shadow-[0_0_60px_rgba(37,37,34,0.18)] flex flex-col`}
      >
        <div className="px-5 sm:px-7 h-[72px] flex items-center justify-between border-b border-line bg-white shrink-0">
          <div className="min-w-0">
            <h3 className="font-display text-2xl text-ink leading-none truncate">{title}</h3>
            {subtitle && <p className="text-[11px] text-muted mt-1 truncate">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md text-muted hover:text-ink hover:bg-sand" aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-6 space-y-5">{children}</div>
        {footer && <div className="px-5 sm:px-7 py-4 border-t border-line bg-white flex gap-3 shrink-0">{footer}</div>}
      </div>
    </div>
  )
}
