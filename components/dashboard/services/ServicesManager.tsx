'use client'
import ResourceManager, { type ResourceConfig, type Item } from '@/components/dashboard/ResourceManager'
import { Badge } from '@/components/dashboard/ui'
import { SERVICE_CATEGORIES, labelOf } from '@/lib/brand'

const config: ResourceConfig = {
  resource: 'services',
  singular: 'Service',
  plural: 'services',
  titleField: 'title',
  imageField: 'image',
  publishable: true,
  wideDrawer: true,
  defaults: { category: 'architecture' },
  searchFields: ['description', 'category'],
  badge: (it) => <Badge tone="bronze">{labelOf(SERVICE_CATEGORIES, String(it.category ?? ''))}</Badge>,
  subtitle: (it) => String(it.description ?? ''),
  tabs: [
    { label: 'All', filter: () => true },
    ...SERVICE_CATEGORIES.map((c) => ({ label: c.label, filter: (it: Item) => it.category === c.value })),
  ],
  fields: [
    { key: 'title', label: 'Service name', type: 'text', placeholder: 'Interior Design' },
    { key: 'category', label: 'Category', type: 'select', options: SERVICE_CATEGORIES },
    { key: 'image', label: 'Service image', type: 'image', folder: 'services' },
    { key: 'description', label: 'Introduction (short)', type: 'textarea', hint: 'Shown on cards and at the top of the service page.' },
    { key: 'detailedDescription', label: 'Design approach (long description)', type: 'textarea', rows: 6, hint: 'Blank lines start new paragraphs.' },
    { key: 'benefits', label: 'What we offer (one per line)', type: 'tags' },
    { key: 'duration', label: 'Typical timeline', type: 'text', placeholder: '8 – 16 weeks', half: true },
    { key: 'pricing', label: 'Engagement / fees', type: 'text', placeholder: 'Fee on % of construction cost', half: true },
  ],
}

export default function ServicesManager({ initial }: { initial: Item[] }) {
  return <ResourceManager config={config} initial={initial} />
}
