'use client'
import Image from 'next/image'
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

export type ArchiveItem = { id: number; image: string; caption: string | null }

/** Masonry image archive with a simple lightbox. */
export default function ArchiveGrid({ items }: { items: ArchiveItem[] }) {
  const [open, setOpen] = useState<ArchiveItem | null>(null)
  const aspects = ['aspect-[4/5]', 'aspect-[4/3]', 'aspect-[1/1]', 'aspect-[3/4]']
  return (
    <>
      <div className="columns-2 lg:columns-3 xl:columns-4 gap-4 sm:gap-6">
        {items.map((g, i) => (
          <button
            key={g.id}
            type="button"
            onClick={() => setOpen(g)}
            className={`img-zoom relative block w-full mb-4 sm:mb-6 break-inside-avoid overflow-hidden bg-sand cursor-zoom-in ${aspects[i % aspects.length]}`}
            aria-label={g.caption ? `Open: ${g.caption}` : 'Open image'}
          >
            <Image src={g.image} alt={g.caption ?? 'Project archive image'} fill sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, 50vw" className="object-cover" />
          </button>
        ))}
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={open.caption ?? 'Image'}
            className="fixed inset-0 z-[60] bg-ink/95 flex flex-col items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
            onKeyDown={(e) => e.key === 'Escape' && setOpen(null)}
          >
            <div className="relative w-[92vw] h-[76vh]">
              <Image src={open.image} alt={open.caption ?? ''} fill sizes="92vw" className="object-contain" />
            </div>
            {open.caption && <p className="mt-5 text-sm text-ivory/75 tracking-wide">{open.caption}</p>}
            <button type="button" autoFocus onClick={() => setOpen(null)} aria-label="Close" className="absolute top-5 right-5 w-11 h-11 rounded-full border border-white/30 text-white flex items-center justify-center hover:bg-white hover:text-ink">
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
