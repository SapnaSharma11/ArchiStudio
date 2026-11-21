'use client'
import ResourceManager, { type ResourceConfig, type Item } from '@/components/dashboard/ResourceManager'

// Backed by the Tip table / /api/admin/tips. Shown as a ticker on the homepage.
const config: ResourceConfig = {
  resource: 'tips',
  singular: 'Principle',
  plural: 'principles',
  titleField: 'title',
  publishable: true,
  layout: 'rows',
  subtitle: (it) => (it.emoji ? `Marker: ${String(it.emoji)}` : 'Shown in the homepage principles ticker'),
  fields: [
    { key: 'title', label: 'Principle', type: 'text', placeholder: 'Light before form' },
    { key: 'emoji', label: 'Marker (optional)', type: 'text', placeholder: '—', hint: 'A short symbol shown before the principle. Leave blank for the default.' },
  ],
}

export default function PrinciplesManager({ initial }: { initial: Item[] }) {
  return <ResourceManager config={config} initial={initial} />
}
