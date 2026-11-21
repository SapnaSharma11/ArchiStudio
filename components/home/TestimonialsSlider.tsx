'use client'
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import FadeIn from '@/components/shared/FadeIn'

export type Testimonial = { id: number; name: string; message: string; rating: number }

/** Large editorial quote carousel of approved client testimonials. */
export default function TestimonialsSlider({ items, index = '06' }: { items: Testimonial[]; index?: string }) {
  const [i, setI] = useState(0)
  if (!items.length) return null
  const t = items[i]
  const [name, project] = t.name.split(/\s+[—–-]\s+/)
  const go = (d: number) => setI((x) => (x + d + items.length) % items.length)

  return (
    <section className="py-24 sm:py-32 lg:py-40 bg-surface" aria-roledescription="carousel" aria-label="Client testimonials">
      <div className="container-x grid gap-12 lg:grid-cols-12">
        <FadeIn className="lg:col-span-3">
          <p className="eyebrow flex items-center gap-3">{index} <span className="h-px w-8 bg-bronze-deep/50" aria-hidden /> Client stories</p>
          <p className="mt-6 text-muted text-sm leading-relaxed max-w-xs">
            The truest measure of our work is how it feels to the people who live and work in it.
          </p>
        </FadeIn>
        <div className="lg:col-span-9">
          <span aria-hidden className="display block text-[7rem] leading-none text-bronze h-16 -mt-4">&ldquo;</span>
          <div className="min-h-[15rem] sm:min-h-[13rem]" aria-live="polite">
            <AnimatePresence mode="wait">
              <motion.figure
                key={t.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <blockquote className="display text-[1.9rem] sm:text-[2.6rem] lg:text-5xl leading-[1.15] text-ink">
                  {t.message}
                </blockquote>
                <figcaption className="mt-8 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <span className="text-sm font-semibold text-ink">{name}</span>
                  {project && <span className="text-xs tracking-[0.16em] uppercase text-muted">{project}</span>}
                </figcaption>
              </motion.figure>
            </AnimatePresence>
          </div>
          {items.length > 1 && (
            <div className="mt-12 flex items-center gap-6">
              <button type="button" onClick={() => go(-1)} aria-label="Previous testimonial" className="w-12 h-12 rounded-full border border-stone flex items-center justify-center hover:bg-ink hover:text-ivory hover:border-ink transition-colors">
                <ArrowLeft size={16} />
              </button>
              <button type="button" onClick={() => go(1)} aria-label="Next testimonial" className="w-12 h-12 rounded-full border border-stone flex items-center justify-center hover:bg-ink hover:text-ivory hover:border-ink transition-colors">
                <ArrowRight size={16} />
              </button>
              <span className="text-xs tracking-[0.2em] text-muted tabular-nums">
                {String(i + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
