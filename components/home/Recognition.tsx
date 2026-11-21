import { ArrowUpRight, CalendarCheck, Compass, Ruler, Star } from 'lucide-react'
import FadeIn from '@/components/shared/FadeIn'
import { BRAND } from '@/lib/brand'
import type { StudioData } from '@/lib/clinic'

/**
 * Client trust band: the practice's public Google rating (lib/brand.ts → BRAND.rating)
 * and what clients can expect when working with the architect.
 */
export default function Recognition({ studio }: { studio: StudioData; index?: string }) {
  const { value, count, source } = BRAND.rating
  const reviewsUrl = `https://www.google.com/search?q=${encodeURIComponent(`${studio.name} ${studio.address.line2} reviews`)}`
  const promises = [
    { icon: CalendarCheck, title: 'Free initial design consultation', text: 'Talk through your plot, needs and budget with the architect before you commit to anything.' },
    { icon: Compass, title: `${studio.principal.name} leads every project`, text: 'The same architect from first sketch to site — no hand-offs to juniors.' },
    { icon: Ruler, title: 'Drawings your builder can follow', text: 'Clear building and structural drawings, coordinated so construction runs smoothly.' },
  ]

  return (
    <section className="bg-surface py-24 sm:py-32">
      <div className="container-x grid gap-14 lg:grid-cols-12 items-center">
        <FadeIn className="lg:col-span-5">
          <p className="eyebrow">What clients say</p>
          <div className="mt-6 flex items-end gap-5">
            <p className="display text-[6.5rem] sm:text-[8rem] leading-none text-ink">{value}</p>
            <div className="pb-4">
              <div className="flex gap-1 text-[#e0a93a]" aria-hidden>
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} size={20} fill="currentColor" strokeWidth={0} />
                ))}
              </div>
              <p className="mt-2 text-sm text-muted">
                on {source} · {count} reviews
              </p>
            </div>
          </div>
          <p className="mt-6 text-muted leading-relaxed max-w-sm">
            Homeowners and businesses across Delhi rate {studio.name} {value} out of 5 for design quality, clear
            communication and care on site.
          </p>
          <a
            href={reviewsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline text-ink mt-8"
          >
            Read reviews on Google <ArrowUpRight size={15} />
          </a>
        </FadeIn>

        <ul className="lg:col-span-7 grid gap-3">
          {promises.map((p, i) => {
            const Icon = p.icon
            return (
              <FadeIn as="li" key={p.title} delay={i * 0.08} className="flex gap-5 items-start rounded-[24px] bg-ivory p-6">
                <span aria-hidden className="w-12 h-12 shrink-0 rounded-full bg-surface text-bronze-deep flex items-center justify-center">
                  <Icon size={20} strokeWidth={1.5} />
                </span>
                <span>
                  <span className="block display text-2xl text-ink">{p.title}</span>
                  <span className="block mt-1.5 text-muted leading-relaxed">{p.text}</span>
                </span>
              </FadeIn>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
