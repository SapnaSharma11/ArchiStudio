import type { Metadata } from 'next'
import { getStudio } from '@/lib/clinic'
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
  image: '/images/arche/villa-white-pool.jpg',
})

export const dynamic = 'force-dynamic'

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const [{ category }, projects, studio] = await Promise.all([searchParams, getPublishedProjects(), getStudio()])
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
      <ConsultationCTA studio={studio} />
    </>
  )
}
