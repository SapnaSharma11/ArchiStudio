import type { Metadata } from 'next'
import { BRAND } from '@/lib/brand'
import seo from '@/data/seo.json'

const DEFAULT_OG = '/images/arche/hero-dusk-residence.jpg'

/**
 * Page-level metadata with canonical URL, Open Graph and Twitter cards.
 * `title` is rendered through the root layout's template ("%s | ARCHÉ Studio").
 */
export function pageMeta({
  title,
  description,
  path,
  image,
  type = 'website',
}: {
  title: string
  description: string
  path: string
  image?: string | null
  type?: 'website' | 'article'
}): Metadata {
  const img = image || DEFAULT_OG
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} | ${BRAND.name}`,
      description,
      url: path,
      siteName: BRAND.name,
      locale: BRAND.locale,
      type,
      images: [{ url: img, width: 1600, height: 1067, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${BRAND.name}`,
      description,
      images: [img],
    },
  }
}

export const SEO = seo
