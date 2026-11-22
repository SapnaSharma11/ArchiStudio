'use client'
import { Star } from 'lucide-react'
import ResourceManager, { type ResourceConfig, type Item } from '@/components/dashboard/ResourceManager'
import { Badge } from '@/components/dashboard/ui'
import { PROJECT_DEFAULTS, PROJECT_FIELDS, categoryLabel } from '@/components/dashboard/projects/projectConfig'

const config: ResourceConfig = {
  resource: 'projects',
  singular: 'Portfolio project',
  plural: 'portfolio projects',
  titleField: 'title',
  imageField: 'coverImage',
  publishable: true,
  publishLabel: 'Published in portfolio',
  layout: 'cards',
  wideDrawer: true,
  defaults: PROJECT_DEFAULTS,
  searchFields: ['location', 'category'],
  badge: (it) => (
    <>
      <Badge tone="bronze">{categoryLabel(it)}</Badge>
      {Boolean(it.featured) && <Badge tone="ink"><Star size={10} /> Featured</Badge>}
      {Array.isArray(it.gallery) && <Badge tone="outline">{(it.gallery as unknown[]).length} mediages</Badge>}
    </>
  ),
  subtitle: (it) => [it.location, it.year].filter(Boolean).join(' · '),
  tabs: [
    { label: 'Published', filter: (it) => Boolean(it.published) },
    { label: 'Drafts', filter: (it) => !it.published },
    { label: 'Featured', filter: (it) => Boolean(it.featured) },
    { label: 'All', filter: () => true },
  ],
  fields: PROJECT_FIELDS,
}

export default function PortfolioManager({ initial }: { initial: Item[] }) {
  return <ResourceManager config={config} initial={initial} />
}
