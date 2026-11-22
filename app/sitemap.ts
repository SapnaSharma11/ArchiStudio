import type { MetadataRoute } from 'next'
import { BRAND } from '@/lib/brand'
import { getPublishedProjects } from '@/lib/projects'
import { getPublishedServices } from '@/lib/services'

// Regenerate hourly so new projects / services are picked up without a redeploy.
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = BRAND.siteUrl
  const now = new Date()
  const [projects, services] = await Promise.all([getPublishedProjects(), getPublishedServices()])
  const statics: [string, number, MetadataRoute.Sitemap[number]['changeFrequency']][] = [
    ['', 1, 'weekly'],
    ['/projects', 0.9, 'weekly'],
    ['/services', 0.9, 'monthly'],
    ['/about', 0.8, 'monthly'],
    ['/contact', 0.8, 'yearly'],
    ['/journal', 0.6, 'weekly'],
    ['/testimonials', 0.5, 'monthly'],
    ['/gallery', 0.5, 'monthly'],
    ['/privacy-policy', 0.2, 'yearly'],
    ['/terms', 0.2, 'yearly'],
  ]
  return [
    ...statics.map(([path, priority, changeFrequency]) => ({ url: `${base}${path}`, lastModified: now, changeFrequency, priority })),
    ...services.map((s) => ({ url: `${base}/services/${s.slug}`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.8 })),
    ...projects.map((p) => ({
      url: `${base}/projects/${p.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
      images: [p.coverImage, ...p.gallery].filter((x): x is string => Boolean(x) && !/\.(mp4|webm|mov)$/i.test(x as string)).map((src) => `${base}${src}`),
    })),
  ]
}
