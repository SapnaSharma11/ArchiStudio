import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { getStudio } from '@/lib/clinic'
import { getPublishedServices, getServiceBySlug } from '@/lib/services'
import { getPublishedProjects } from '@/lib/projects'
import { pageMeta } from '@/lib/seo'
import { BRAND, labelOf, SERVICE_CATEGORIES } from '@/lib/brand'
import Breadcrumbs from '@/components/shared/Breadcrumbs'
import FadeIn from '@/components/shared/FadeIn'
import SectionHeading from '@/components/shared/SectionHeading'
import ProjectCard from '@/components/shared/ProjectCard'
import ConsultationCTA from '@/components/home/ConsultationCTA'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const s = await getServiceBySlug(slug)
  if (!s) return { title: 'Service not found', robots: { index: false } }
  return pageMeta({ title: s.title, description: s.description, path: `/services/${s.slug}`, image: s.image })
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params
  const [service, services, projects, studio] = await Promise.all([
    getServiceBySlug(slug),
    getPublishedServices(),
    getPublishedProjects(),
    getStudio(),
  ])
  if (!service) notFound()

  const examples = projects.filter((p) => p.services.includes(service.slug)).slice(0, 3)
  const others = services.filter((s) => s.slug !== service.slug).slice(0, 5)
  const approach = (service.detailedDescription ?? '').split(/\n{2,}/).filter(Boolean)

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.title,
    description: service.description,
    serviceType: labelOf(SERVICE_CATEGORIES, service.category),
    provider: { '@id': `${BRAND.siteUrl}/#studio` },
    areaServed: 'IN',
    url: `${BRAND.siteUrl}/services/${service.slug}`,
    image: service.image ? `${BRAND.siteUrl}${service.image}` : undefined,
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <section className="pt-32 sm:pt-40">
        <div className="container-x">
          <Breadcrumbs items={[{ label: 'Services', href: '/services' }, { label: service.title }]} />
          <div className="grid gap-8 lg:grid-cols-12 items-end pb-12">
            <FadeIn className="lg:col-span-8">
              <p className="eyebrow">{labelOf(SERVICE_CATEGORIES, service.category)}</p>
              <h1 className="display mt-5 text-[2.75rem] sm:text-6xl lg:text-[5.25rem] text-ink">{service.title}</h1>
            </FadeIn>
            <FadeIn delay={0.15} className="lg:col-span-4">
              <p className="text-muted text-lg leading-relaxed">{service.description}</p>
            </FadeIn>
          </div>
        </div>
        {service.image && (
          <div className="relative w-full aspect-[4/3] sm:aspect-[21/9] bg-sand overflow-hidden">
            <Image src={service.image} alt={`${service.title} — studio project`} fill preload sizes="100vw" className="object-cover" />
          </div>
        )}
      </section>

      <section className="py-24 sm:py-32">
        <div className="container-x grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <SectionHeading label="Design approach" title="How we" accent="work." />
            <FadeIn delay={0.1} className="mt-8 space-y-5 text-muted text-lg leading-relaxed max-w-2xl">
              {approach.length ? approach.map((para) => <p key={para.slice(0, 24)}>{para}</p>) : <p>{service.description}</p>}
            </FadeIn>
          </div>
          <aside className="lg:col-span-5 lg:pl-8">
            <FadeIn className="bg-surface border border-line p-8 sm:p-10">
              <h2 className="eyebrow">What we offer</h2>
              <ul className="mt-6">
                {service.benefits.map((b) => (
                  <li key={b} className="py-3.5 border-b border-line last:border-0 text-ink flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rotate-45 bg-bronze shrink-0" aria-hidden /> {b}
                  </li>
                ))}
              </ul>
              <dl className="mt-8 grid grid-cols-2 gap-6 border-t border-ink pt-6">
                {service.duration && (
                  <div>
                    <dt className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted">Typical timeline</dt>
                    <dd className="mt-2 text-sm text-ink">{service.duration}</dd>
                  </div>
                )}
                {service.pricing && (
                  <div>
                    <dt className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted">Engagement</dt>
                    <dd className="mt-2 text-sm text-ink">{service.pricing}</dd>
                  </div>
                )}
              </dl>
              <Link href="/contact#consultation" className="btn btn-dark w-full mt-8">
                Book a consultation <ArrowRight size={15} className="btn-arrow" />
              </Link>
            </FadeIn>
          </aside>
        </div>
      </section>

      {examples.length > 0 && (
        <section className="py-24 sm:py-32 bg-surface">
          <div className="container-x">
            <SectionHeading label="Project examples" title="Where we've" accent="applied it." />
            <div className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {examples.map((p, i) => (
                <FadeIn key={p.slug} delay={i * 0.08}>
                  <ProjectCard project={p} aspect={i === 1 ? 'aspect-[4/5]' : 'aspect-[4/4.4]'} />
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-20 sm:py-24">
        <div className="container-x">
          <h2 className="eyebrow">Other services</h2>
          <ul className="mt-6 border-t border-line">
            {others.map((s) => (
              <li key={s.slug} className="border-b border-line">
                <Link href={`/services/${s.slug}`} className="group flex items-center justify-between py-6 gap-6">
                  <span className="display text-3xl sm:text-4xl text-ink group-hover:text-bronze-deep transition-colors">{s.title}</span>
                  <ArrowRight size={20} className="shrink-0 text-muted transition-transform duration-500 group-hover:translate-x-2 group-hover:text-ink" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <ConsultationCTA studio={studio} />
    </>
  )
}
