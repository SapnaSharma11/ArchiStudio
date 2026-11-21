import Link from 'next/link'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import SectionHeading from '@/components/shared/SectionHeading'
import FadeIn from '@/components/shared/FadeIn'
import site from '@/data/site.json'

/**
 * "In-house disciplines" — drafting-sheet tiles (grid paper, border inset,
 * large serif symbol like an element on a periodic table), staggered grid.
 */
export default function Disciplines({ index = '06' }: { index?: string }) {
  const items = site.disciplines
  return (
    <section className="py-24 sm:py-32 lg:py-40">
      <div className="container-x grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-32">
            <SectionHeading index={index} label="Disciplines" title="Every discipline," accent="under one roof." />
            <FadeIn delay={0.1}>
              <p className="mt-6 text-muted leading-relaxed">
                Architecture, interiors, structure, visualisation and site supervision are coordinated in-house — one
                team, one set of drawings, one point of responsibility.
              </p>
              <blockquote className="mt-10 border-l border-bronze pl-6">
                <p className="display text-2xl text-ink leading-snug">&ldquo;Good architecture is quiet, precise and built to age well.&rdquo;</p>
                <footer className="mt-4 text-xs tracking-[0.16em] uppercase text-muted">Studio philosophy</footer>
              </blockquote>
              <Link href="/services" className="btn btn-outline text-ink mt-10">
                Explore services <ArrowRight size={15} className="btn-arrow" />
              </Link>
            </FadeIn>
          </div>
        </div>

        <ul className="lg:col-span-8 grid grid-cols-2 lg:grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-10">
          {items.map((d, i) => (
            <FadeIn as="li" key={d.name} delay={(i % 3) * 0.08} className={i % 3 === 1 ? 'lg:mt-16' : ''}>
              <Link href={d.href} className="group block" aria-label={`${d.name} — ${d.text}`}>
                <div className="relative aspect-[3/4] overflow-hidden bg-sand transition-colors duration-700 group-hover:bg-ink">
                  <div
                    aria-hidden
                    className="absolute inset-0 opacity-70 transition-opacity duration-700 group-hover:opacity-10 [background-image:linear-gradient(var(--color-stone)_1px,transparent_1px),linear-gradient(90deg,var(--color-stone)_1px,transparent_1px)] [background-size:28px_28px]"
                  />
                  <div aria-hidden className="absolute inset-5 border border-stone transition-colors duration-700 group-hover:border-white/20" />
                  <span aria-hidden className="absolute left-7 top-7 text-[10px] tracking-[0.22em] text-bronze-deep font-semibold transition-colors duration-700 group-hover:text-bronze">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span aria-hidden className="absolute right-7 top-7 text-[10px] tracking-[0.22em] uppercase text-muted transition-colors duration-700 group-hover:text-ivory/60">
                    {d.label}
                  </span>
                  <span
                    aria-hidden
                    className="absolute inset-0 flex items-center justify-center display text-[5.5rem] sm:text-8xl text-ink/80 transition-all duration-700 group-hover:text-ivory group-hover:scale-105"
                  >
                    {d.glyph}
                  </span>
                  <span aria-hidden className="absolute right-7 bottom-7 w-9 h-9 rounded-full border border-ivory/40 text-ivory flex items-center justify-center opacity-0 translate-y-1 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0">
                    <ArrowUpRight size={15} />
                  </span>
                </div>
                <h3 className="display text-2xl sm:text-[1.7rem] text-ink mt-4">{d.name}</h3>
                <p className="text-sm text-muted mt-1 leading-relaxed">{d.text}</p>
              </Link>
            </FadeIn>
          ))}
        </ul>
      </div>
    </section>
  )
}
