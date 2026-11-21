import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { getStudio } from '@/lib/clinic'
import { getProjectBySlug, getPublishedProjects } from '@/lib/projects'
import { getPublishedServices } from '@/lib/services'
import { pageMeta } from '@/lib/seo'
import { BRAND, labelOf, PROJECT_CATEGORIES, PROJECT_STATUSES } from '@/lib/brand'
import Breadcrumbs from '@/components/shared/Breadcrumbs'
import FadeIn from '@/components/shared/FadeIn'
import SectionHeading from '@/components/shared/SectionHeading'
import ProjectCard from '@/components/shared/ProjectCard'
import ProjectGallery from '@/components/projects/ProjectGallery'
import ConsultationCTA from '@/components/home/ConsultationCTA'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const p = await getProjectBySlug(slug)
  if (!p) return { title: 'Project not found', robots: { index: false } }
  return pageMeta({
    title: p.seoTitle || `${p.title} — ${labelOf(PROJECT_CATEGORIES, p.category)} project in ${p.location ?? 'India'}`,
    description: p.seoDescription || p.summary || `${p.title} by ${BRAND.name}.`,
    path: `/projects/${p.slug}`,
    image: p.coverImage,
    type: 'article',
  })
}

function splitSpec(line: string): [string, string] {
  const i = line.indexOf(':')
  return i === -1 ? [line, ''] : [line.slice(0, i).trim(), line.slice(i + 1).trim()]
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params
  const [project, all, services, studio] = await Promise.all([
    getProjectBySlug(slug),
    getPublishedProjects(),
    getPublishedServices(),
    getStudio(),
  ])
  if (!project) notFound()

  const sameCategory = all.filter((p) => p.slug !== project.slug && p.category === project.category)
  const related = [...sameCategory, ...all.filter((p) => p.slug !== project.slug && p.category !== project.category)].slice(0, 3)
  const idx = all.findIndex((p) => p.slug === project.slug)
  const next = all.length > 1 ? all[(idx + 1) % all.length] : null
  const usedServices = services.filter((s) => project.services.includes(s.slug))
  const paragraphs = (project.description ?? '').split(/\n{2,}/).filter(Boolean)

  const facts = [
    { k: 'Category', v: labelOf(PROJECT_CATEGORIES, project.category) },
    { k: 'Location', v: project.location },
    { k: 'Year', v: project.year ? String(project.year) : null },
    { k: 'Area', v: project.area },
    { k: 'Status', v: labelOf(PROJECT_STATUSES, project.status) },
  ].filter((f) => f.v)

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    headline: project.title,
    description: project.summary ?? undefined,
    genre: labelOf(PROJECT_CATEGORIES, project.category),
    dateCreated: project.year ? String(project.year) : undefined,
    locationCreated: project.location ? { '@type': 'Place', name: project.location } : undefined,
    image: [project.coverImage, ...project.gallery].filter(Boolean).map((src) => `${BRAND.siteUrl}${src}`),
    creator: { '@id': `${BRAND.siteUrl}/#studio` },
    url: `${BRAND.siteUrl}/projects/${project.slug}`,
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      {/* Full-width hero */}
      <section className="relative h-[88svh] min-h-[560px] bg-ink text-white overflow-hidden">
        {project.coverImage && (
          <Image
            src={project.coverImage}
            alt={`${project.title} — ${project.location ?? ''}`}
            fill
            preload
            fetchPriority="high"
            sizes="100vw"
            quality={85}
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-ink/40" aria-hidden />
        <div className="relative h-full container-x flex flex-col justify-end pb-14 sm:pb-20">
          <Breadcrumbs tone="dark" items={[{ label: 'Projects', href: '/projects' }, { label: project.title }]} />
          <FadeIn>
            <p className="eyebrow !text-bronze-soft">
              {labelOf(PROJECT_CATEGORIES, project.category)}
              {project.year ? ` · ${project.year}` : ''}
            </p>
            <h1 className="display mt-4 text-[3rem] sm:text-7xl lg:text-8xl max-w-5xl">{project.title}</h1>
            {project.location && <p className="font-mono mt-5 text-white/75 text-sm tracking-[0.14em] uppercase">{project.location}</p>}
          </FadeIn>
        </div>
      </section>

      {/* Overview */}
      <section className="py-20 sm:py-28">
        <div className="container-x grid gap-14 lg:grid-cols-12">
          <dl className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-1 gap-x-6 border-t border-ink self-start">
            {facts.map((f) => (
              <div key={f.k} className="py-4 border-b border-line">
                <dt className="font-mono text-[10px] tracking-[0.22em] uppercase text-muted">{f.k}</dt>
                <dd className="mt-1.5 text-ink">{f.v}</dd>
              </div>
            ))}
          </dl>
          <div className="lg:col-span-8 lg:pl-10">
            <p className="eyebrow">Project overview</p>
            {project.summary && <p className="display mt-5 text-3xl sm:text-4xl lg:text-[2.75rem] leading-[1.15] text-ink">{project.summary}</p>}
            {paragraphs.length > 0 && (
              <div className="mt-10 grid gap-6 sm:grid-cols-2 text-muted leading-relaxed">
                {paragraphs.map((para) => <p key={para.slice(0, 24)}>{para}</p>)}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Concept */}
      {project.concept && (
        <section className="bg-ink text-ivory py-20 sm:py-28">
          <div className="container-x grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <p className="eyebrow !text-bronze">Design concept</p>
            </div>
            <FadeIn className="lg:col-span-8">
              <p className="display text-3xl sm:text-4xl lg:text-5xl leading-[1.15]">{project.concept}</p>
            </FadeIn>
          </div>
        </section>
      )}

      {/* Gallery */}
      {project.gallery.length > 0 && (
        <section className="py-20 sm:py-28" aria-label="Project gallery">
          <div className="container-x">
            <ProjectGallery images={project.gallery} title={project.title} />
          </div>
        </section>
      )}

      {/* Materials + specifications */}
      {(project.materials.length > 0 || project.specs.length > 0) && (
        <section className="pb-20 sm:pb-28">
          <div className="container-x grid gap-14 lg:grid-cols-2">
            {project.materials.length > 0 && (
              <div>
                <SectionHeading label="Materials & finishes" title="A restrained" accent="palette." />
                <ul className="mt-10 flex flex-wrap gap-3">
                  {project.materials.map((m) => (
                    <li key={m} className="px-4 py-2.5 border border-stone text-sm text-ink bg-surface">{m}</li>
                  ))}
                </ul>
              </div>
            )}
            {project.specs.length > 0 && (
              <div>
                <SectionHeading label="Specifications" title="Project" accent="details." />
                <dl className="mt-10 border-t border-ink">
                  {project.specs.map((line) => {
                    const [k, v] = splitSpec(line)
                    return (
                      <div key={line} className="grid grid-cols-2 gap-4 py-4 border-b border-line text-sm">
                        <dt className="text-muted">{k}</dt>
                        <dd className="text-ink">{v || '—'}</dd>
                      </div>
                    )
                  })}
                </dl>
                {usedServices.length > 0 && (
                  <p className="mt-8 text-sm text-muted">
                    Services:{' '}
                    {usedServices.map((s, i) => (
                      <span key={s.slug}>
                        <Link href={`/services/${s.slug}`} className="text-ink link-draw">{s.title}</Link>
                        {i < usedServices.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </p>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Next project + related */}
      {next && (
        <section className="border-y border-line">
          <Link href={`/projects/${next.slug}`} className="group container-x flex items-center justify-between gap-6 py-10 sm:py-14">
            <span>
              <span className="eyebrow">Next project</span>
              <span className="display block mt-2 text-4xl sm:text-6xl text-ink group-hover:text-bronze-deep transition-colors">{next.title}</span>
            </span>
            <ArrowRight size={28} className="shrink-0 text-ink transition-transform duration-500 group-hover:translate-x-2" />
          </Link>
        </section>
      )}

      {related.length > 0 && (
        <section className="py-20 sm:py-28 bg-surface">
          <div className="container-x">
            <div className="flex items-end justify-between gap-6">
              <SectionHeading label="Related projects" title="You may" accent="also like." />
              <Link href="/projects" className="hidden sm:inline-flex items-center gap-2 text-[0.95rem] font-medium text-ink link-draw pb-1">
                <ArrowLeft size={14} /> All projects
              </Link>
            </div>
            <div className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p, i) => (
                <FadeIn key={p.slug} delay={i * 0.08}>
                  <ProjectCard project={p} aspect="aspect-[4/5]" />
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      )}

      <ConsultationCTA studio={studio} />
    </>
  )
}
