'use client'
import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, X } from 'lucide-react'
import { cn } from '@/utils/cn'

/** Asymmetric image gallery with a keyboard-accessible lightbox. */
export default function ProjectGallery({ images, title }: { images: string[]; title: string }) {
  const [open, setOpen] = useState<number | null>(null)
  const close = useCallback(() => setOpen(null), [])
  const step = useCallback((d: number) => setOpen((i) => (i === null ? i : (i + d + images.length) % images.length)), [images.length])

  useEffect(() => {
    if (open === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowRight') step(1)
      if (e.key === 'ArrowLeft') step(-1)
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open, close, step])

  if (!images.length) return null
  // Layout rhythm: wide, then two side-by-side, repeat.
  const span = (i: number) => (i % 3 === 0 ? 'sm:col-span-2 aspect-[16/9]' : 'aspect-[4/5]')

  return (
    <>
      <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
        {images.map((src, i) => (
          <button
            key={src + i}
            type="button"
            onClick={() => setOpen(i)}
            className={cn('img-zoom relative overflow-hidden bg-sand cursor-zoom-in', span(i))}
            aria-label={`Open image ${i + 1} of ${images.length}`}
          >
            <Image
              src={src}
              alt={`${title} — view ${i + 1}`}
              fill
              sizes={i % 3 === 0 ? '(min-width: 1024px) 80vw, 100vw' : '(min-width: 640px) 40vw, 100vw'}
              className="object-cover"
            />
          </button>
        ))}
      </div>

      <AnimatePresence>
        {open !== null && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`${title} gallery`}
            className="fixed inset-0 z-[60] bg-ink/95 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          >
            <motion.div
              key={open}
              className="relative w-[92vw] h-[78vh]"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Image src={images[open]} alt={`${title} — view ${open + 1}`} fill sizes="92vw" className="object-contain" />
            </motion.div>
            <button type="button" onClick={close} autoFocus aria-label="Close gallery" className="absolute top-5 right-5 w-11 h-11 rounded-full border border-white/30 text-white flex items-center justify-center hover:bg-white hover:text-ink">
              <X size={18} />
            </button>
            {images.length > 1 && (
              <>
                <button type="button" onClick={(e) => { e.stopPropagation(); step(-1) }} aria-label="Previous image" className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full border border-white/30 text-white flex items-center justify-center hover:bg-white hover:text-ink">
                  <ArrowLeft size={18} />
                </button>
                <button type="button" onClick={(e) => { e.stopPropagation(); step(1) }} aria-label="Next image" className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full border border-white/30 text-white flex items-center justify-center hover:bg-white hover:text-ink">
                  <ArrowRight size={18} />
                </button>
                <p className="absolute bottom-6 inset-x-0 text-center text-xs tracking-[0.2em] text-white/70 tabular-nums">
                  {String(open + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
                </p>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
