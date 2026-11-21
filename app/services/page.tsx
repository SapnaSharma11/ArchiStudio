import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getStudio } from '@/lib/clinic'
import { getPublishedServices } from '@/lib/services'
import { pageMeta, SEO } from '@/lib/seo'
import { SERVICE_CATEGORIES } from '@/lib/brand'
import PageHero from '@/components/shared/PageHero'
import FadeIn from '@/components/shared/FadeIn'
import ProcessSection from '@/components/home/ProcessSection'
import ConsultationCTA from '@/components/home/ConsultationCTA'

export const metadata: Metadata = pageMeta({
  title: SEO.services.title,
  description: SEO.services.description,
  path: '/services',
  image: '/images/arche/house-timber-facade.jpg',
})

// Read live from the DB so dashboard edits appear without a redeploy.
export const dynamic = 'force-dynamic'

export default async function ServicesPage() {
  const [studio, services] = await Promise.all([getStudio(), getPublishedServices()])
  type Group = { value: string; label: string; items: typeof services }
  const groups: Group[] = SERVICE_CATEGORIES.map((c) => ({
    value: c.value as string,
    label: c.label as string,
    items: services.filter((s) => s.category === c.value),
  })).filter((g) => g.items.length)
  const ungrouped = services.filter((s) => !SERVICE_CATEGORIES.some((c) => c.value === s.category))
  if (ungrouped.length) groups.push({ value: 'more', label: 'More services', items: ungrouped })
  let n = 0

  return (
    <>
      <PageHero
        label="Services"
        title="A complete practice,"
        accent="one team."
        intro="Architecture, interiors, drawings, visualisation and on-site supervision — engaged individually or as a single end-to-end commission."
        crumbs={[{ label: 'Services' }]}
      />

      <nav aria-label="Service categories" className="container-x pb-4">
        <ul className="flex flex-wrap gap-x-8 gap-y-3 border-t border-line pt-6 text-[11px] font-semibold tracking-[0.2em] uppercase">
          {groups.map((g) => (
            <li key={g.label}>
              <a href={`#${g.value}`} className="link-draw pb-1 text-ink">{g.label} <span className="text-muted">({g.items.length})</span></a>
            </li>
          ))}
        </ul>
      </nav>

      {groups.map((g) => (
        <section key={g.label} id={g.value} className="scroll-mt-24 py-16 sm:py-24">
          <div className="container-x">
            <FadeIn>
              <h2 className="eyebrow flex items-center gap-3"><span className="h-px w-8 bg-bronze-deep/50" aria-hidden /> {g.label}</h2>
            </FadeIn>
            <div className="mt-12 space-y-20 sm:space-y-28">
              {g.items.map((s) => {
                const i = n++
                const flip = i % 2 === 1
                return (
                  <article key={s.slug} className="grid gap-10 lg:grid-cols-12 items-center">
                    <FadeIn className={`lg:col-span-7 ${flip ? 'lg:order-2' : ''}`}>
                      <Link href={`/services/${s.slug}`} className="group block img-zoom relative aspect-[16/10] overflow-hidden bg-sand" tabIndex={-1} aria-hidden>
                        {s.image && <Image src={s.image} alt="" fill sizes="(min-width: 1024px) 58vw, 100vw" className="object-cover" />}
                      </Link>
                    </FadeIn>
                    <FadeIn delay={0.1} className={`lg:col-span-5 ${flip ? 'lg:order-1 lg:pr-8' : 'lg:pl-8'}`}>
                      <span className="text-[11px] tracking-[0.22em] text-bronze-deep font-semibold">{String(i + 1).padStart(2, '0')}</span>
                      <h3 className="display text-4xl sm:text-5xl text-ink mt-3">
                        <Link href={`/services/${s.slug}`} className="hover:text-bronze-deep transition-colors">{s.title}</Link>
                      </h3>
                      <p className="mt-5 text-muted leading-relaxed">{s.description}</p>
                      {s.benefits.length > 0 && (
                        <ul className="mt-6 border-t border-line">
                          {s.benefits.slice(0, 4).map((b) => (
                            <li key={b} className="py-3 border-b border-line text-sm text-ink flex items-center gap-3">
                              <span className="w-1.5 h-1.5 rotate-45 bg-bronze shrink-0" aria-hidden /> {b}
                            </li>
                          ))}
                        </ul>
                      )}
                      <Link href={`/services/${s.slug}`} className="btn btn-outline text-ink mt-8">
                        Explore service <ArrowRight size={15} className="btn-arrow" />
                      </Link>
                    </FadeIn>
                  </article>
                )
              })}
            </div>
          </div>
        </section>
      ))}

      <ProcessSection index={null} />
      <ConsultationCTA studio={studio} />
    </>
  )
}
