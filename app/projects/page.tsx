import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { getStudio } from '@/lib/clinic'
import { isVideo, videoPoster } from '@/lib/video'
import SectionHeading from '@/components/shared/SectionHeading'
import { getPublishedProjects } from '@/lib/projects'
import { pageMeta, SEO } from '@/lib/seo'
import { PROJECT_CATEGORIES } from '@/lib/brand'
import PageHero from '@/components/shared/PageHero'
import PortfolioGrid from '@/components/projects/PortfolioGrid'
import ConsultationCTA from '@/components/home/ConsultationCTA'

export const metadata: Metadata = pageMeta({
  title: SEO.projects.title,
  description: SEO.projects.description,
  path: '/projects',
  image: '/images/apn/hexagon-panel-wall.jpg',
})

export const dynamic = 'force-dynamic'

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const [{ category }, projects, studio] = await Promise.all([searchParams, getPublishedProjects(), getStudio()])
  const films = projects.flatMap((p) => p.gallery.filter(isVideo).map((src) => ({ src, slug: p.slug, title: p.title })))
  const initial = PROJECT_CATEGORIES.some((c) => c.value === category) ? (category as string) : 'all'

  return (
    <>
      <PageHero
        label="Projects"
        title="Selected"
        accent="work."
        intro="Residential, commercial, interior, renovation and landscape projects — each a response to a particular place, climate and client."
        crumbs={[{ label: 'Projects' }]}
      />
      <section className="pb-24 sm:pb-32">
        <div className="container-x">
          {projects.length ? (
            <PortfolioGrid projects={projects} initial={initial} />
          ) : (
            <p className="text-muted py-20 border-t border-line">New projects are being photographed — check back soon.</p>
          )}
        </div>
      </section>
      {films.length > 0 && (
        <section id="films" className="scroll-mt-24 pb-24 sm:pb-32">
          <div className="container-x">
            <SectionHeading label="Films" title="Projects," accent="on video." intro="Walkthroughs of finished rooms and clips from APN Enterprises sites — tap to play." />
            <ul className="mt-12 grid gap-x-5 gap-y-10 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
              {films.map((f, i) => (
                <li key={f.src}>
                  <div className="relative aspect-[9/16] overflow-hidden rounded-media bg-ink">
                    <video
                      src={f.src}
                      poster={videoPoster(f.src) || undefined}
                      controls
                      playsInline
                      preload="none"
                      aria-label={`${f.title} — film ${i + 1}`}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                  <Link href={`/projects/${f.slug}`} className="mt-3 inline-flex items-center gap-1.5 text-sm text-ink link-draw">
                    {f.title} <ArrowUpRight size={13} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
      <ConsultationCTA studio={studio} />
    </>
  )
}
