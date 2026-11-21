'use client'
import ResourceManager, { type ResourceConfig, type Item } from '@/components/dashboard/ResourceManager'
import { Badge } from '@/components/dashboard/ui'
import { TEAM_DISCIPLINES, labelOf } from '@/lib/brand'

const config: ResourceConfig = {
  resource: 'team',
  singular: 'Team member',
  plural: 'team members',
  titleField: 'name',
  imageField: 'photo',
  monogram: true,
  cardAspect: 'aspect-[4/3]',
  publishable: true,
  publishLabel: 'Show on About page',
  searchFields: ['role', 'discipline', 'email'],
  badge: (it) => <Badge tone="bronze">{labelOf(TEAM_DISCIPLINES, String(it.discipline ?? ''))}</Badge>,
  subtitle: (it) => [it.role, it.email].filter(Boolean).join(' · '),
  defaults: { discipline: 'architect' },
  tabs: [
    { label: 'All', filter: () => true },
    ...TEAM_DISCIPLINES.map((d) => ({ label: d.value === 'studio' ? 'Studio' : `${d.label}s`, filter: (it: Item) => it.discipline === d.value })),
  ],
  fields: [
    { key: 'name', label: 'Full name', type: 'text' },
    { key: 'role', label: 'Role / title', type: 'text', placeholder: 'Associate Architect', half: true },
    { key: 'discipline', label: 'Discipline', type: 'select', options: TEAM_DISCIPLINES, half: true },
    { key: 'photo', label: 'Portrait', type: 'image', folder: 'team', hint: 'Portrait 4:5 works best. Initials are shown until a photo is added.' },
    { key: 'bio', label: 'Short bio', type: 'textarea' },
    { key: 'email', label: 'Email', type: 'email', half: true },
    { key: 'linkedin', label: 'LinkedIn URL', type: 'url', half: true },
  ],
}

export default function TeamManager({ initial }: { initial: Item[] }) {
  return <ResourceManager config={config} initial={initial} />
}
