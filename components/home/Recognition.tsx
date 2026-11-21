import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import FadeIn from '@/components/shared/FadeIn'
import type { StudioData } from '@/lib/clinic'

/** Awards & recognition band: big count, then ruled award rows (Dashboard → Awards). */
export default function Recognition({ studio, index = '07' }: { studio: StudioData; index?: string }) {
  const awards = studio.awards
  if (!awards.length) return null
  return (
    <section className="bg-surface py-24 sm:py-32 border-y border-line">
      <div className="container-x grid gap-14 lg:grid-cols-12">
        <FadeIn className="lg:col-span-4">
          <p className="eyebrow flex items-center gap-3">{index} <span className="h-px w-8 bg-bronze-deep/50" aria-hidden /> Recognition</p>
          <p className="display mt-6 text-[7rem] sm:text-[9rem] leading-none text-ink [font-variant-numeric:lining-nums]">
            {String(awards.length).padStart(2, '0')}
          </p>
          <p className="mt-6 text-muted leading-relaxed max-w-xs">
            Awards and citations for design quality, workplace interiors and sustainable building.
          </p>
          <Link href="/about" className="mt-8 inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] uppercase text-ink link-draw pb-1">
            About the studio <ArrowUpRight size={13} />
          </Link>
        </FadeIn>
        <ul className="lg:col-span-8 border-t border-ink">
          {awards.map((a, i) => (
            <FadeIn as="li" key={`${a.name}-${i}`} delay={i * 0.06} className="group grid grid-cols-12 gap-4 items-baseline py-8 border-b border-line">
              <span className="col-span-3 sm:col-span-2 display text-3xl text-bronze-deep">{a.year ?? '—'}</span>
              <div className="col-span-9 sm:col-span-7">
                <h3 className="display text-2xl sm:text-[2rem] text-ink leading-tight transition-transform duration-500 group-hover:translate-x-1">{a.name}</h3>
                <p className="mt-1.5 text-sm text-muted">{a.organization}</p>
              </div>
              {a.description && (
                <p className="col-span-12 sm:col-span-3 sm:text-right text-xs tracking-[0.16em] uppercase text-muted">{a.description}</p>
              )}
            </FadeIn>
          ))}
        </ul>
      </div>
    </section>
  )
}
