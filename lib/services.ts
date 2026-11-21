import { cache } from 'react'
import { prisma } from '@/lib/prisma'
import servicesJson from '@/data/services.json'
import { LEGACY_SERVICE_CATEGORY } from '@/lib/brand'

export type PublicService = {
  slug: string
  title: string
  description: string
  detailedDescription: string | null
  image: string | null
  benefits: string[]
  duration: string | null
  pricing: string | null
  category: string
}

function jsonServices(): PublicService[] {
  return servicesJson.map((s) => ({
    slug: s.id,
    title: s.title,
    description: s.description,
    detailedDescription: s.detailedDescription ?? null,
    image: s.image,
    benefits: s.benefits,
    duration: s.duration ?? null,
    pricing: s.pricing ?? null,
    category: s.category,
  }))
}

/** Published services (DB, falling back to data/services.json). */
export const getPublishedServices = cache(async (): Promise<PublicService[]> => {
  try {
    const rows = await prisma.service.findMany({
      where: { published: true },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
    })
    return rows.map((s) => ({
      slug: s.slug,
      title: s.title,
      description: s.description,
      detailedDescription: s.detailedDescription,
      image: s.image,
      benefits: s.benefits,
      duration: s.duration,
      pricing: s.pricing,
      category: LEGACY_SERVICE_CATEGORY[s.category] ?? s.category,
    }))
  } catch {
    return jsonServices()
  }
})

export async function getServiceBySlug(slug: string): Promise<PublicService | null> {
  const all = await getPublishedServices()
  return all.find((s) => s.slug === slug) ?? null
}
