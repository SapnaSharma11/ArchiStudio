'use client'
import ResourceManager, { type ResourceConfig, type Item } from '@/components/dashboard/ResourceManager'
import { Badge } from '@/components/dashboard/ui'

// Backed by the Session table / /api/admin/sessions.
const config: ResourceConfig = {
  resource: 'sessions',
  singular: 'Film',
  plural: 'films',
  titleField: 'title',
  imageField: 'image',
  badge: (it) => (it.sessionType ? <Badge tone="bronze">{String(it.sessionType)}</Badge> : null),
  publishable: true,
  cardAspect: 'aspect-video',
  searchFields: ['description', 'sessionType'],
  subtitle: (it) => [it.duration, it.description].filter(Boolean).join(' · '),
  fields: [
    { key: 'title', label: 'Title', type: 'text', placeholder: 'The Courtyard House — walkthrough' },
    { key: 'image', label: 'Poster frame', type: 'image', folder: 'films' },
    { key: 'videoUrl', label: 'Video URL', type: 'text', placeholder: 'https://… or /videos/…', hint: 'Upload via Cloudinary or paste a hosted video link.' },
    { key: 'description', label: 'Description', type: 'textarea' },
    { key: 'sessionType', label: 'Type', type: 'text', placeholder: '3D walkthrough / Site film / Talk', half: true },
    { key: 'duration', label: 'Duration', type: 'text', placeholder: '2 min', half: true },
  ],
}

export default function FilmsManager({ initial }: { initial: Item[] }) {
  return <ResourceManager config={config} initial={initial} />
}
