import { cache } from 'react'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/schemas'
import projectsJson from '@/data/projects.json'

/** Public-facing project shape (portfolio). Dates are ISO strings. */
export type PortfolioProject = {
  id: number
  slug: string
  title: string
  category: string
  status: string
  location: string | null
  year: number | null
  area: string | null
  summary: string | null
  concept: string | null
  description: string | null
  coverImage: string | null
  gallery: string[]
  materials: string[]
  specs: string[]
  services: string[]
  featured: boolean
  seoTitle: string | null
  seoDescription: string | null
}

type Row = Awaited<ReturnType<typeof prisma.project.findFirst>>

function fromRow(p: NonNullable<Row>): PortfolioProject {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    category: p.category,
    status: p.status,
    location: p.location,
    year: p.year,
    area: p.area,
    summary: p.summary,
    concept: p.concept,
    description: p.description,
    coverImage: p.coverImage,
    gallery: p.gallery,
    materials: p.materials,
    specs: p.specs,
    services: p.services,
    featured: p.featured,
    seoTitle: p.seoTitle,
    seoDescription: p.seoDescription,
  }
}

/** Static fallback so the portfolio renders before the DB is provisioned. */
function jsonProjects(): PortfolioProject[] {
  return projectsJson
    .filter((p) => p.published)
    .map((p, i) => ({
      id: -(i + 1),
      slug: p.slug,
      title: p.title,
      category: p.category,
      status: p.status,
      location: p.location,
      year: p.year,
      area: p.area,
      summary: p.summary,
      concept: p.concept,
      description: p.description,
      coverImage: p.coverImage,
      gallery: p.gallery,
      materials: p.materials,
      specs: p.specs,
      services: p.services,
      featured: p.featured,
      seoTitle: null,
      seoDescription: null,
    }))
}

/** All published projects, featured first then by display order / year. */
export const getPublishedProjects = cache(async (): Promise<PortfolioProject[]> => {
  try {
    const rows = await prisma.project.findMany({
      where: { published: true },
      orderBy: [{ displayOrder: 'asc' }, { year: 'desc' }, { createdAt: 'desc' }],
    })
    return rows.map(fromRow)
  } catch {
    return jsonProjects()
  }
})

export const getProjectBySlug = cache(async (slug: string): Promise<PortfolioProject | null> => {
  try {
    const row = await prisma.project.findFirst({ where: { slug, published: true } })
    return row ? fromRow(row) : null
  } catch {
    return jsonProjects().find((p) => p.slug === slug) ?? null
  }
})

/** Generate a slug that doesn't collide with an existing project. */
export async function uniqueProjectSlug(source: string, ignoreId?: number): Promise<string> {
  const base = slugify(source) || 'project'
  let slug = base
  let n = 1
  while (true) {
    const hit = await prisma.project.findUnique({ where: { slug } })
    if (!hit || hit.id === ignoreId) return slug
    n += 1
    slug = `${base}-${n}`
  }
}
