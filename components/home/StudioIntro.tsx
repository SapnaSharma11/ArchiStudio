import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import FadeIn from '@/components/shared/FadeIn'
import RevealImage from '@/components/shared/RevealImage'
import type { StudioData } from '@/lib/clinic'

export default function StudioIntro({ studio }: { studio: StudioData }) {
  return (
    <section id="studio" className="py-24 sm:py-32 lg:py-40 scroll-mt-20">
      <div className="container-x grid gap-14 lg:grid-cols-12 lg:gap-20 items-start">
        <div className="lg:col-span-5 lg:sticky lg:top-32">
          <FadeIn>
            <p className="eyebrow">The architect</p>
            <h2 className="display mt-5 text-[2.5rem] sm:text-5xl lg:text-[3.6rem] text-ink">
              Architecture shaped by <em className="not-italic text-bronze-deep">light, climate</em> and the way people live.
            </h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="mt-8 space-y-5 text-muted leading-relaxed">
              <p>
                {studio.principal.name} is the architect behind {studio.name}, based in Najafgarh, New Delhi. He leads
                every project personally — building design, structural design and architectural design — from the first
                conversation to the drawings your builder works from.
              </p>
              <p>
                His approach is practical and calm: plans that make the most of your plot and budget, structure that is
                safe and economical, and details resolved with care. The first design consultation is always free.
              </p>
            </div>
            <div className="mt-10 flex items-center gap-4">
              <span aria-hidden className="w-12 h-12 rounded-full bg-sand flex items-center justify-center display text-lg text-bronze-deep">
                {studio.principal.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}
              </span>
              <div>
                <p className="display text-2xl text-ink">{studio.principal.name}</p>
                <p className="text-sm text-muted mt-0.5">{studio.principal.title}</p>
              </div>
            </div>
            <Link href="/about" className="mt-10 inline-flex items-center gap-2 text-[0.95rem] font-medium text-ink link-draw pb-1">
              More about Akash <ArrowRight size={14} />
            </Link>
          </FadeIn>
        </div>

        <div className="lg:col-span-7">
          <div className="grid grid-cols-6 gap-4 sm:gap-6">
            <RevealImage
              src="/images/apn/residential-building-elevation.jpg"
              alt="Residential building designed by APN Enterprises, with brick-tone and grey cladding lit at dusk"
              imgClassName="object-[center_30%]"
              sizes="(min-width: 1024px) 55vw, 100vw"
              className="col-span-6 aspect-[4/3]"
            />
            <RevealImage
              src="/images/apn/hexagon-panel-wall.jpg"
              alt="Hexagonal wood-panel feature wall with warm LED outlines"
              sizes="(min-width: 1024px) 25vw, 50vw"
              className="col-span-3 aspect-[3/4] -mt-16 sm:-mt-24 ml-6 sm:ml-10 border-[6px] sm:border-8 border-ivory"
            />
            <FadeIn delay={0.2} className="col-span-3 self-end">
              <p className="display text-xl sm:text-2xl text-ink leading-snug">
                &ldquo;A building should be as calm to live in as it is to look at.&rdquo;
              </p>
            </FadeIn>
          </div>

          {studio.stats.length > 0 && (
            <dl className="mt-16 grid grid-cols-2 lg:grid-cols-4 border-t border-line">
              {studio.stats.slice(0, 4).map((s, i) => (
                <FadeIn key={s.label} delay={i * 0.08} className="pt-6 pr-4 pb-2 border-b lg:border-b-0 border-line">
                  <dt className="sr-only">{s.label}</dt>
                  <dd>
                    <span className="display block text-5xl sm:text-6xl text-ink">{s.value}</span>
                    <span className="block mt-2 text-sm text-muted">{s.label}</span>
                  </dd>
                </FadeIn>
              ))}
            </dl>
          )}
        </div>
      </div>
    </section>
  )
}
