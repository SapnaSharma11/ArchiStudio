import type { Metadata } from 'next'
import { BRAND } from '@/lib/brand'
import seo from '@/data/seo.json'

const DEFAULT_OG = '/images/apn/residential-building-elevation.jpg'

/**
 * Page-level metadata with canonical URL, Open Graph and Twitter cards.
 * `title` is rendered through the root layout's template ("%s | <brand>").
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
      images: [{ url: img, alt: title }],
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
