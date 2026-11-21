import type { Metadata } from 'next'
import Image from 'next/image'
import { getStudio } from '@/lib/clinic'
import { pageMeta, SEO } from '@/lib/seo'
import PageHero from '@/components/shared/PageHero'
import SectionHeading from '@/components/shared/SectionHeading'
import FadeIn from '@/components/shared/FadeIn'
import RevealImage from '@/components/shared/RevealImage'
import Philosophy from '@/components/home/Philosophy'
import ProcessSection from '@/components/home/ProcessSection'
import ConsultationCTA from '@/components/home/ConsultationCTA'
import Recognition from '@/components/home/Recognition'

export const metadata: Metadata = pageMeta({
  title: SEO.about.title,
  description: SEO.about.description,
  path: '/about',
  image: '/images/arche/studio-drawing-board.jpg',
})

// Live from the DB so dashboard edits to the architect's profile appear instantly.
export const dynamic = 'force-dynamic'

export default async function AboutPage() {
  const studio = await getStudio()
  const p = studio.principal

  return (
    <>
      <PageHero
        label="About"
        title={`${p.name},`}
        accent="Architect."
        intro={`The architect behind ${studio.name} in Najafgarh, New Delhi — building design, structural design and architectural design for homes and businesses.`}
        image="/images/arche/studio-drawing-board.jpg"
        imageAlt="Architect drafting a building plan by hand"
        crumbs={[{ label: 'About' }]}
      />

      {/* The architect */}
      <section className="py-24 sm:py-32">
        <div className="container-x grid gap-14 lg:grid-cols-12 items-start">
          <div className="lg:col-span-5">
            {p.photo ? (
              <RevealImage src={p.photo} alt={`${p.name}, ${p.title}`} sizes="(min-width: 1024px) 40vw, 100vw" className="aspect-[4/5]" />
            ) : (
              <FadeIn className="relative aspect-[4/5] bg-sand overflow-hidden rounded-media">
                <Image src="/images/arche/house-white-terrace.jpg" alt="Contemporary white house with terraces" fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
              </FadeIn>
            )}
          </div>
          <div className="lg:col-span-7 lg:pl-8">
            <SectionHeading label="The architect" title={p.name} />
            <FadeIn delay={0.1}>
              <p className="mt-3 text-muted">{p.title}</p>
              {p.biography && <p className="mt-8 text-lg text-muted leading-relaxed max-w-2xl">{p.biography}</p>}
              <div className="mt-12 grid gap-4 sm:grid-cols-3">
                {[
                  { title: 'Education', items: p.education },
                  { title: 'Expertise', items: p.expertise },
                  { title: 'Recognition', items: p.achievements },
                ]
                  .filter((g) => g.items.length)
                  .map((g) => (
                    <div key={g.title} className="rounded-[22px] bg-surface p-5">
                      <h3 className="eyebrow">{g.title}</h3>
                      <ul className="mt-4 space-y-2 text-sm text-ink leading-relaxed">
                        {g.items.map((x) => <li key={x}>{x}</li>)}
                      </ul>
                    </div>
                  ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* The practice: approach, vision, mission */}
      <section className="pb-24 sm:pb-32">
        <div className="container-x grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <SectionHeading label={studio.name} title="A personal practice with a" accent="long view." />
            <FadeIn delay={0.1} className="mt-8 space-y-5 text-muted leading-relaxed max-w-xl">
              <p>
                {studio.name} is {p.name.split(' ')[0]}&rsquo;s architecture practice. Because it is personal, you work
                directly with the architect at every stage — from the free first consultation and site visit to the final
                drawings and visits on site.
              </p>
              <p>
                The work covers building design, structural design and architectural design for homes, rental buildings and
                small commercial projects across Delhi NCR.
              </p>
            </FadeIn>
          </div>
          <div className="lg:col-span-6 grid sm:grid-cols-2 gap-4 lg:pt-24">
            <FadeIn className="rounded-[24px] bg-surface p-6">
              <h3 className="eyebrow">Vision</h3>
              <p className="display text-2xl text-ink mt-4 leading-snug">
                Buildings that feel right for their site — practical, safe and built to last generations.
              </p>
            </FadeIn>
            <FadeIn delay={0.1} className="rounded-[24px] bg-surface p-6">
              <h3 className="eyebrow">Mission</h3>
              <p className="display text-2xl text-ink mt-4 leading-snug">
                To guide every client through design and construction with clarity, honesty and care.
              </p>
            </FadeIn>
          </div>
        </div>
      </section>

      <Philosophy />
      <Recognition studio={studio} />

      <ProcessSection />
      <ConsultationCTA studio={studio} />
    </>
  )
}
