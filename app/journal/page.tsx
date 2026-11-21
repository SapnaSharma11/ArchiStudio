import type { Metadata } from 'next'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { pageMeta, SEO } from '@/lib/seo'
import PageHero from '@/components/shared/PageHero'
import FadeIn from '@/components/shared/FadeIn'
import SectionHeading from '@/components/shared/SectionHeading'

export const metadata: Metadata = pageMeta({ title: SEO.journal.title, description: SEO.journal.description, path: '/journal' })

// Live from the DB (Events → news, Workshops → talks, Sessions → films).
export const dynamic = 'force-dynamic'

const fmtDate = (d: Date | null) =>
  d ? d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : null

async function getJournal() {
  try {
    const order = [{ displayOrder: 'asc' as const }, { date: 'desc' as const }]
    const [news, talks, films] = await Promise.all([
      prisma.event.findMany({ where: { published: true }, orderBy: order }),
      prisma.workshop.findMany({ where: { published: true }, orderBy: order }),
      prisma.session.findMany({ where: { published: true }, orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }] }),
    ])
    return { news, talks, films }
  } catch {
    return { news: [], talks: [], films: [] }
  }
}

export default async function JournalPage() {
  const { news, talks, films } = await getJournal()
  const empty = !news.length && !talks.length && !films.length

  return (
    <>
      <PageHero
        label="Journal"
        title="News, talks"
        accent="& films."
        intro="News, talks and site visits, and walkthrough films of our work."
        crumbs={[{ label: 'Journal' }]}
      />

      {empty && (
        <section className="container-x pb-32">
          <p className="border-t border-line pt-10 text-muted max-w-xl leading-relaxed">
            The journal is being written. In the meantime, explore our recent projects or book a free consultation.
          </p>
        </section>
      )}

      {news.length > 0 && (
        <section id="news" className="scroll-mt-24 pb-24">
          <div className="container-x">
            <SectionHeading label="News & events" title="From the" accent="studio." />
            <ul className="mt-12 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {news.map((e, i) => (
                <FadeIn as="li" key={e.id} delay={(i % 3) * 0.08}>
                  <article>
                    <div className="relative aspect-[4/3] bg-sand overflow-hidden">
                      {e.bannerImage && <Image src={e.bannerImage} alt={e.name} fill sizes="(min-width: 1024px) 30vw, 100vw" className="object-cover" />}
                    </div>
                    <p className="font-mono mt-5 text-[10px] tracking-[0.22em] uppercase text-bronze-deep font-medium">
                      {[fmtDate(e.date), e.location].filter(Boolean).join(' · ')}
                    </p>
                    <h3 className="display text-3xl text-ink mt-2">{e.name}</h3>
                    {e.description && <p className="mt-3 text-sm text-muted leading-relaxed">{e.description}</p>}
                  </article>
                </FadeIn>
              ))}
            </ul>
          </div>
        </section>
      )}

      {talks.length > 0 && (
        <section id="talks" className="scroll-mt-24 py-24 bg-surface">
          <div className="container-x">
            <SectionHeading label="Talks & site visits" title="Conversations about" accent="architecture." />
            <ul className="mt-12 border-t border-ink">
              {talks.map((w) => (
                <li key={w.id} className="grid gap-4 sm:grid-cols-12 py-8 border-b border-line">
                  <p className="sm:col-span-3 display text-2xl text-bronze-deep">{fmtDate(w.date) ?? 'Date TBC'}</p>
                  <div className="sm:col-span-9">
                    <h3 className="display text-3xl text-ink">{w.name}</h3>
                    <p className="font-mono mt-1 text-xs tracking-[0.14em] uppercase text-muted">
                      {[w.startTime && `${w.startTime}${w.endTime ? ` – ${w.endTime}` : ''}`, w.location, w.capacity && `${w.capacity} places`].filter(Boolean).join(' · ')}
                    </p>
                    {w.description && <p className="mt-3 text-muted leading-relaxed max-w-2xl">{w.description}</p>}
                    {w.registrationInfo && <p className="mt-3 text-sm text-ink">{w.registrationInfo}</p>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {films.length > 0 && (
        <section id="films" className="scroll-mt-24 py-24">
          <div className="container-x">
            <SectionHeading label="Films" title="Walkthroughs &" accent="fly-throughs." />
            <ul className="mt-12 grid gap-8 sm:grid-cols-2">
              {films.map((f) => (
                <li key={f.id}>
                  <div className="relative aspect-video bg-ink overflow-hidden">
                    {f.videoUrl ? (
                      <video src={f.videoUrl} poster={f.image ?? undefined} controls preload="none" className="absolute inset-0 w-full h-full object-cover" />
                    ) : f.image ? (
                      <Image src={f.image} alt={f.title} fill sizes="50vw" className="object-cover" />
                    ) : null}
                  </div>
                  <h3 className="display text-2xl text-ink mt-4">{f.title}</h3>
                  {f.description && <p className="text-sm text-muted mt-1">{f.description}</p>}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  )
}
