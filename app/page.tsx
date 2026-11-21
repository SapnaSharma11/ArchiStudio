import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { getStudio } from '@/lib/clinic'
import { getPublishedProjects } from '@/lib/projects'
import { getPublishedServices } from '@/lib/services'
import { pageMeta, SEO } from '@/lib/seo'
import { BRAND } from '@/lib/brand'
import HeroSection from '@/components/home/HeroSection'
import StudioIntro from '@/components/home/StudioIntro'
import ServicesOverview from '@/components/home/ServicesOverview'
import FeaturedProjects from '@/components/home/FeaturedProjects'
import Philosophy from '@/components/home/Philosophy'
import ProcessSection from '@/components/home/ProcessSection'
import TestimonialsSlider, { type Testimonial } from '@/components/home/TestimonialsSlider'
import Recognition from '@/components/home/Recognition'
import ConsultationCTA from '@/components/home/ConsultationCTA'

export const metadata: Metadata = {
  ...pageMeta({ title: SEO.home.title, description: SEO.home.description, path: '/' }),
  title: { absolute: `${BRAND.name} — ${SEO.home.title}` },
}

// Live from the DB so dashboard edits appear without a redeploy.
export const dynamic = 'force-dynamic'

/** The six services highlighted on the homepage (falls back to the first six). */
const HOME_SERVICES = [
  'architectural-design',
  'interior-design',
  'structural-drawings',
  '3d-visualization',
  'renovation-remodeling',
  'project-supervision',
]

async function getHomeContent() {
  try {
    const testimonials = await prisma.testimonial.findMany({ where: { approved: true }, orderBy: { createdAt: 'desc' }, take: 8 })
    return {
      testimonials: testimonials.map<Testimonial>((t) => ({ id: t.id, name: t.name, message: t.message, rating: t.rating })),
    }
  } catch {
    return { testimonials: [] as Testimonial[] }
  }
}

export default async function HomePage() {
  const [studio, projects, services, { testimonials }] = await Promise.all([
    getStudio(),
    getPublishedProjects(),
    getPublishedServices(),
    getHomeContent(),
  ])

  const featured = projects.filter((p) => p.featured)
  // Featured first, then the rest — the horizontal gallery holds up to seven.
  const showcase = [...featured, ...projects.filter((p) => !p.featured)].slice(0, 7)
  const picked = HOME_SERVICES.map((slug) => services.find((s) => s.slug === slug)).filter((s) => s !== undefined)
  const homeServices = picked.length >= 3 ? picked : services.slice(0, 6)
  const lead = showcase[0]

  return (
    <>
      <HeroSection
        studio={studio}
        featured={lead ? { slug: lead.slug, title: lead.title, location: lead.location, year: lead.year } : null}
      />
      <StudioIntro studio={studio} />
      <ServicesOverview services={homeServices} />
      <FeaturedProjects projects={showcase} />
      <Philosophy />
      <ProcessSection />
      <Recognition studio={studio} index="06" />
      <TestimonialsSlider items={testimonials} index="07" />
      <ConsultationCTA studio={studio} />
    </>
  )
}
