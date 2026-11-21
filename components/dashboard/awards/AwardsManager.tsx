'use client'
import ResourceManager, { type ResourceConfig, type Item } from '@/components/dashboard/ResourceManager'

// Backed by the Certification table / /api/admin/certifications.
const config: ResourceConfig = {
  resource: 'certifications',
  singular: 'Award',
  plural: 'awards',
  titleField: 'name',
  imageField: 'image',
  layout: 'rows',
  searchFields: ['organization', 'description'],
  subtitle: (it) =>
    [it.organization, it.issueDate ? new Date(String(it.issueDate)).getFullYear() : null, it.description]
      .filter(Boolean)
      .join(' · '),
  fields: [
    { key: 'name', label: 'Award / recognition', type: 'text', placeholder: 'Residential Project of the Year' },
    { key: 'organization', label: 'Awarding body', type: 'text', half: true },
    { key: 'issueDate', label: 'Date', type: 'date', half: true },
    { key: 'description', label: 'Project / notes', type: 'textarea', placeholder: 'The Courtyard House' },
    { key: 'image', label: 'Image (certificate, trophy or project)', type: 'image', folder: 'awards' },
  ],
}

export default function AwardsManager({ initial }: { initial: Item[] }) {
  return <ResourceManager config={config} initial={initial} />
}
