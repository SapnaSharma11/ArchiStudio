'use client'
import ResourceManager, { type ResourceConfig, type Item } from '@/components/dashboard/ResourceManager'

// Backed by the Event table / /api/admin/events.
const config: ResourceConfig = {
  resource: 'events',
  singular: 'News item',
  plural: 'news & events',
  titleField: 'name',
  imageField: 'bannerImage',
  publishable: true,
  searchFields: ['location', 'description'],
  subtitle: (it) =>
    [
      it.date ? new Date(String(it.date)).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : null,
      it.location,
    ]
      .filter(Boolean)
      .join(' · '),
  fields: [
    { key: 'name', label: 'Headline', type: 'text', placeholder: 'Exhibition — Material Matters' },
    { key: 'bannerImage', label: 'Image', type: 'image', folder: 'news' },
    { key: 'description', label: 'Summary', type: 'textarea' },
    { key: 'date', label: 'Date', type: 'date', half: true },
    { key: 'location', label: 'Location / publication', type: 'text', half: true },
    { key: 'details', label: 'Full story / details', type: 'textarea', rows: 6 },
  ],
}

export default function NewsManager({ initial }: { initial: Item[] }) {
  return <ResourceManager config={config} initial={initial} />
}
