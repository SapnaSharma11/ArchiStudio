import type { Metadata } from 'next'
import Image from 'next/image'
import { getStudio } from '@/lib/clinic'
import { pageMeta, SEO } from '@/lib/seo'
import { labelOf, TEAM_DISCIPLINES } from '@/lib/brand'
import { getTeam } from '@/lib/team'
import MemberPortrait from '@/components/shared/MemberPortrait'
import Slider from '@/components/shared/Slider'
import PageHero from '@/components/shared/PageHero'
import SectionHeading from '@/components/shared/SectionHeading'
import FadeIn from '@/components/shared/FadeIn'
import RevealImage from '@/components/shared/RevealImage'
import Philosophy from '@/components/home/Philosophy'
import ProcessSection from '@/components/home/ProcessSection'
import ConsultationCTA from '@/components/home/ConsultationCTA'

export const metadata: Metadata = pageMeta({
  title: SEO.about.title,
  description: SEO.about.description,
  path: '/about',
  image: '/images/arche/studio-drawing-board.jpg',
})

// Live from the DB so dashboard edits to the principal, team and awards appear instantly.
export const dynamic = 'force-dynamic'

export default async function AboutPage() {
  const [studio, team] = await Promise.all([getStudio(), getTeam()])
  const p = studio.principal

  return (
    <>
      <PageHero
        label="About the studio"
        title="Designing spaces."
        accent="Creating experiences."
        intro={`${studio.name} is an architecture and interior design consultancy for people who value clarity, craft and longevity.`}
        image="/images/arche/office-glass-studio.jpg"
        imageAlt="The studio — a glass-walled workspace with long tables and concrete ceilings"
        crumbs={[{ label: 'About' }]}
      />

      {/* Introduction + vision / mission */}
      <section className="py-24 sm:py-32">
        <div className="container-x grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <SectionHeading index="01" label="The studio" title="A small studio with a" accent="long view." />
            <FadeIn delay={0.1} className="mt-8 space-y-5 text-muted leading-relaxed max-w-xl">
              <p>
                We began with a simple conviction: that architecture should make everyday life better — quieter, lighter,
                more generous. Today we work on private homes, workplaces, hospitality and interiors across India.
              </p>
              <p>
                Every commission is led by a senior architect from first conversation to handover, supported by interior
                designers, engineers, visualisers and project managers working as one team.
              </p>
            </FadeIn>
          </div>
          <div className="lg:col-span-6 grid sm:grid-cols-2 gap-10 lg:pt-28">
            <FadeIn className="border-t border-ink pt-6">
              <h3 className="eyebrow">Vision</h3>
              <p className="display text-2xl sm:text-3xl text-ink mt-4 leading-snug">
                Buildings that feel inevitable — rooted in place, honest in material and built to last generations.
              </p>
            </FadeIn>
            <FadeIn delay={0.1} className="border-t border-ink pt-6">
              <h3 className="eyebrow">Mission</h3>
              <p className="display text-2xl sm:text-3xl text-ink mt-4 leading-snug">
                To guide every client through design and construction with clarity, care and uncompromising detail.
              </p>
            </FadeIn>
          </div>
        </div>
      </section>

      <Philosophy index="02" />

      {/* Principal architect */}
      <section className="py-24 sm:py-32">
        <div className="container-x grid gap-14 lg:grid-cols-12 items-start">
          <div className="lg:col-span-5">
            {p.photo ? (
              <RevealImage src={p.photo} alt={`${p.name}, ${p.title}`} sizes="(min-width: 1024px) 40vw, 100vw" className="aspect-[4/5]" />
            ) : (
              <FadeIn className="relative aspect-[4/5] bg-sand overflow-hidden">
                <Image src="/images/arche/studio-drawing-board.jpg" alt="Hand-drafted architectural drawings at the studio" fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
              </FadeIn>
            )}
          </div>
          <div className="lg:col-span-7 lg:pl-8">
            <SectionHeading index="03" label="Principal architect" title={p.name} />
            <FadeIn delay={0.1}>
              <p className="mt-3 text-xs tracking-[0.18em] uppercase text-muted">{p.title}{p.experience ? ` · ${p.experience}+ years of practice` : ''}</p>
              {p.biography && <p className="mt-8 text-lg text-muted leading-relaxed max-w-2xl">{p.biography}</p>}
              <div className="mt-12 grid gap-10 sm:grid-cols-3">
                {[
                  { title: 'Education', items: p.education },
                  { title: 'Expertise', items: p.expertise },
                  { title: 'Registrations', items: p.achievements },
                ]
                  .filter((g) => g.items.length)
                  .map((g) => (
                    <div key={g.title} className="border-t border-line pt-5">
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

      {/* Team */}
      {team.length > 0 && (
        <section id="team" className="scroll-mt-24 py-24 sm:py-32 bg-surface overflow-hidden">
          <div className="container-x">
            <SectionHeading index="04" label="The team" title="Architects, designers" accent="and makers." intro="A multidisciplinary team that stays with every project from concept to completion." />
          </div>
          <div className="mt-16">
            <Slider label="Team" slideClassName="w-[72vw] sm:w-[40vw] lg:w-[24vw] xl:w-[21rem]">
              {team.map((m) => (
                <div key={m.id} className="group">
                  <MemberPortrait name={m.name} role={m.role} photo={m.photo} sizes="(min-width: 1024px) 24vw, (min-width: 640px) 40vw, 72vw" className="aspect-[4/5]" />
                  <p className="mt-5 text-[10px] font-semibold tracking-[0.22em] uppercase text-bronze-deep">{labelOf(TEAM_DISCIPLINES, m.discipline)}</p>
                  <h3 className="display text-3xl text-ink mt-2">{m.name}</h3>
                  <p className="text-sm text-muted mt-1">{m.role}</p>
                  {m.bio && <p className="text-sm text-muted mt-3 leading-relaxed">{m.bio}</p>}
                </div>
              ))}
            </Slider>
          </div>
        </section>
      )}

      {/* Experience & achievements */}
      <section className="py-24 sm:py-32">
        <div className="container-x grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading index="05" label="Experience & recognition" title="Work that has" accent="been noticed." />
            {studio.stats.length > 0 && (
              <dl className="mt-12 grid grid-cols-2 gap-y-10 border-t border-line pt-8">
                {studio.stats.map((s) => (
                  <div key={s.label}>
                    <dt className="sr-only">{s.label}</dt>
                    <dd>
                      <span className="display block text-5xl text-ink">{s.value}</span>
                      <span className="block mt-2 text-xs tracking-[0.14em] uppercase text-muted">{s.label}</span>
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
          <div className="lg:col-span-7">
            {studio.awards.length > 0 ? (
              <ul className="border-t border-ink">
                {studio.awards.map((a, i) => (
                  <FadeIn as="li" key={`${a.name}-${i}`} delay={i * 0.06} className="grid grid-cols-12 gap-4 py-7 border-b border-line">
                    <span className="col-span-3 sm:col-span-2 display text-2xl text-bronze-deep">{a.year ?? '—'}</span>
                    <div className="col-span-9 sm:col-span-10">
                      <h3 className="display text-2xl sm:text-3xl text-ink">{a.name}</h3>
                      <p className="text-sm text-muted mt-1">
                        {[a.organization, a.description].filter(Boolean).join(' — ')}
                      </p>
                    </div>
                  </FadeIn>
                ))}
              </ul>
            ) : (
              <p className="text-muted">Awards and publications will appear here.</p>
            )}
          </div>
        </div>
      </section>

      <ProcessSection index="06" />
      <ConsultationCTA studio={studio} />
    </>
  )
}
