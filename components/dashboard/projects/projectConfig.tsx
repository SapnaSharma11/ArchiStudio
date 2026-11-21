import type { FieldDef, Item } from '@/components/dashboard/ResourceManager'
import { PROJECT_CATEGORIES, PROJECT_STATUSES, labelOf } from '@/lib/brand'

/** Field set shared by the Projects (management) and Portfolio (website) views. */
export const PROJECT_FIELDS: FieldDef[] = [
  { key: 'h-overview', label: 'Overview', type: 'heading' },
  { key: 'title', label: 'Project title', type: 'text', placeholder: 'The Courtyard House' },
  { key: 'slug', label: 'URL slug', type: 'text', placeholder: 'auto-generated from title', hint: 'Used in /projects/<slug>. Leave blank to generate.' },
  { key: 'category', label: 'Category', type: 'select', options: PROJECT_CATEGORIES, half: true },
  { key: 'status', label: 'Status', type: 'select', options: PROJECT_STATUSES, half: true },
  { key: 'location', label: 'Location', type: 'text', placeholder: 'Jaipur, Rajasthan', half: true },
  { key: 'year', label: 'Completion year', type: 'number', placeholder: '2025', half: true },
  { key: 'area', label: 'Area', type: 'text', placeholder: '6,800 sq ft' },
  { key: 'summary', label: 'Summary (card & intro)', type: 'textarea' },

  { key: 'h-client', label: 'Client', type: 'heading' },
  { key: 'clientName', label: 'Client name', type: 'text' },
  { key: 'clientEmail', label: 'Email', type: 'email', half: true },
  { key: 'clientPhone', label: 'Phone', type: 'text', half: true },

  { key: 'h-budget', label: 'Budget & timeline', type: 'heading' },
  { key: 'budget', label: 'Project budget', type: 'currency', placeholder: '25000000', half: true },
  { key: 'progress', label: 'Progress (%)', type: 'number', placeholder: '0 – 100', half: true },
  { key: 'startDate', label: 'Start date', type: 'date', half: true },
  { key: 'deadline', label: 'Deadline / handover', type: 'date', half: true },

  { key: 'h-design', label: 'Design', type: 'heading' },
  { key: 'concept', label: 'Design concept', type: 'textarea', rows: 4 },
  { key: 'description', label: 'Project story', type: 'textarea', rows: 6, hint: 'Blank lines start new paragraphs.' },
  { key: 'materials', label: 'Materials & finishes', type: 'tags' },
  { key: 'specs', label: 'Specifications', type: 'tags', hint: 'One per line as “Label: value”, e.g. “Built-up area: 6,800 sq ft”.' },
  { key: 'services', label: 'Services involved', type: 'tags', hint: 'Service slugs, one per line (e.g. interior-design).' },

  { key: 'h-media', label: 'Media', type: 'heading' },
  { key: 'coverImage', label: 'Cover image', type: 'image', folder: 'projects' },
  { key: 'gallery', label: 'Image gallery', type: 'gallery', folder: 'projects' },

  { key: 'h-docs', label: 'Documentation', type: 'heading' },
  { key: 'documents', label: 'Drawings & documents', type: 'textarea', rows: 4, placeholder: 'Links to drawing sets, BOQs, approvals…' },

  { key: 'h-seo', label: 'Portfolio & SEO', type: 'heading' },
  { key: 'featured', label: 'Featured project', type: 'checkbox', hint: 'Highlighted on the homepage.' },
  { key: 'seoTitle', label: 'SEO title', type: 'text', placeholder: 'Defaults to the project title' },
  { key: 'seoDescription', label: 'SEO description', type: 'textarea', placeholder: 'Defaults to the summary' },
]

export const PROJECT_DEFAULTS = { category: 'residential', status: 'concept', progress: 0, published: false, featured: false }

export const categoryLabel = (it: Item) => labelOf(PROJECT_CATEGORIES, String(it.category ?? ''))
