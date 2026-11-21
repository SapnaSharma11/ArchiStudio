import Link from 'next/link'
import { BRAND } from '@/lib/brand'

export type Crumb = { label: string; href?: string }

/** Visible breadcrumb trail + BreadcrumbList structured data. */
export default function Breadcrumbs({ items, tone = 'light' }: { items: Crumb[]; tone?: 'light' | 'dark' }) {
  const all: Crumb[] = [{ label: 'Home', href: '/' }, ...items]
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: all.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.label,
      ...(c.href ? { item: `${BRAND.siteUrl}${c.href}` } : {}),
    })),
  }
  const base = tone === 'dark' ? 'text-ivory/60' : 'text-muted'
  return (
    <nav aria-label="Breadcrumb" className={`font-mono mb-8 text-[11px] tracking-[0.18em] uppercase ${base}`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <ol className="flex flex-wrap items-center gap-2">
        {all.map((c, i) => (
          <li key={i} className="flex items-center gap-2">
            {c.href && i < all.length - 1 ? (
              <Link href={c.href} className={tone === 'dark' ? 'hover:text-ivory' : 'hover:text-ink'}>
                {c.label}
              </Link>
            ) : (
              <span aria-current="page" className={tone === 'dark' ? 'text-ivory' : 'text-ink'}>
                {c.label}
              </span>
            )}
            {i < all.length - 1 && <span aria-hidden>/</span>}
          </li>
        ))}
      </ol>
    </nav>
  )
}
