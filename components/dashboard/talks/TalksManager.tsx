'use client'
import ResourceManager, { type ResourceConfig, type Item } from '@/components/dashboard/ResourceManager'

function fmt(it: Item): string {
  const parts: string[] = []
  if (it.date) parts.push(new Date(String(it.date)).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }))
  if (it.startTime) parts.push(`${it.startTime}${it.endTime ? `–${it.endTime}` : ''}`)
  if (it.location) parts.push(String(it.location))
  if (it.capacity) parts.push(`${it.capacity} places`)
  return parts.join(' · ')
}

// Backed by the Workshop table / /api/admin/workshops.
const config: ResourceConfig = {
  resource: 'workshops',
  singular: 'Talk',
  plural: 'talks & site visits',
  titleField: 'name',
  imageField: 'bannerImage',
  publishable: true,
  layout: 'rows',
  searchFields: ['location', 'description'],
  subtitle: fmt,
  fields: [
    { key: 'name', label: 'Title', type: 'text', placeholder: 'Site visit — Atrium Tower' },
    { key: 'bannerImage', label: 'Cover image', type: 'image', folder: 'talks' },
    { key: 'description', label: 'Description', type: 'textarea' },
    { key: 'date', label: 'Date', type: 'date', half: true },
    { key: 'location', label: 'Venue', type: 'text', half: true },
    { key: 'startTime', label: 'Start time', type: 'time', half: true },
    { key: 'endTime', label: 'End time', type: 'time', half: true },
    { key: 'capacity', label: 'Places', type: 'number', half: true },
    { key: 'registrationInfo', label: 'Registration / RSVP details', type: 'textarea' },
  ],
}

export default function TalksManager({ initial }: { initial: Item[] }) {
  return <ResourceManager config={config} initial={initial} />
}
