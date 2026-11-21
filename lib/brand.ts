/**
 * Brand identity — the single place to rename the studio.
 *
 * Everything public-facing (site name, emails, metadata, JSON-LD) reads from
 * here or from the Studio Settings row in the DB (which overrides name/contact
 * on the website). Override via env without touching code:
 *   NEXT_PUBLIC_BRAND_NAME, NEXT_PUBLIC_BRAND_TAGLINE, SITE_URL
 */
export const BRAND = {
  name: process.env.NEXT_PUBLIC_BRAND_NAME || 'ARCHÉ Studio',
  /** Wordmark shown in the navbar / sidebar. */
  wordmark: process.env.NEXT_PUBLIC_BRAND_WORDMARK || 'ARCHÉ',
  descriptor: 'Architecture & Interiors',
  tagline: process.env.NEXT_PUBLIC_BRAND_TAGLINE || 'Designing Spaces. Creating Experiences.',
  siteUrl: (process.env.SITE_URL || 'http://localhost:3000').replace(/\/$/, ''),
  locale: 'en_IN',
} as const

export const PROJECT_CATEGORIES = [
  { value: 'residential', label: 'Residential' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'interior', label: 'Interior' },
  { value: 'renovation', label: 'Renovation' },
  { value: 'landscape', label: 'Landscape' },
] as const

export const PROJECT_STATUSES = [
  { value: 'enquiry', label: 'Enquiry' },
  { value: 'concept', label: 'Concept' },
  { value: 'design', label: 'Design & Planning' },
  { value: 'documentation', label: 'Documentation' },
  { value: 'construction', label: 'On Site' },
  { value: 'completed', label: 'Completed' },
  { value: 'on-hold', label: 'On Hold' },
] as const

/** Statuses that count as "active" work in the studio. */
export const ACTIVE_PROJECT_STATUSES = ['concept', 'design', 'documentation', 'construction']

export const SERVICE_CATEGORIES = [
  { value: 'architecture', label: 'Architecture' },
  { value: 'interiors', label: 'Interiors' },
  { value: 'delivery', label: 'Documentation & Delivery' },
] as const

/** Legacy service categories (pre-rebrand rows) mapped onto the new ones. */
export const LEGACY_SERVICE_CATEGORY: Record<string, string> = {
  speciality: 'architecture',
  conditions: 'interiors',
  rehabilitation: 'delivery',
}

export const TEAM_DISCIPLINES = [
  { value: 'architect', label: 'Architect' },
  { value: 'interior', label: 'Interior Designer' },
  { value: 'engineer', label: 'Engineer' },
  { value: 'project-manager', label: 'Project Manager' },
  { value: 'studio', label: 'Studio' },
] as const

export const ENQUIRY_PROJECT_TYPES = [
  'Residential — new build',
  'Residential — interiors',
  'Commercial / workplace',
  'Hospitality / retail',
  'Renovation & remodeling',
  'Landscape',
  'Consultancy / drawings only',
] as const

export const ENQUIRY_BUDGETS = [
  'Under ₹25 lakh',
  '₹25 – 75 lakh',
  '₹75 lakh – 2 crore',
  '₹2 – 5 crore',
  'Above ₹5 crore',
  'Not sure yet',
] as const

/** Booking.status values (kept from the original schema) with studio labels. */
export const ENQUIRY_STATUSES = ['pending', 'contacted', 'confirmed', 'completed', 'cancelled'] as const
export const ENQUIRY_STATUS_LABEL: Record<string, string> = {
  pending: 'New',
  contacted: 'Contacted',
  confirmed: 'Consultation booked',
  completed: 'Converted',
  cancelled: 'Closed',
  missed: 'Awaiting reply',
}

export function labelOf(list: readonly { value: string; label: string }[], value: string | null | undefined): string {
  if (!value) return ''
  return list.find((x) => x.value === value)?.label ?? value
}

export function formatINR(value: number | null | undefined): string {
  if (value == null) return '—'
  if (value >= 1_00_00_000) return `₹${(value / 1_00_00_000).toFixed(value % 1_00_00_000 ? 1 : 0)} Cr`
  if (value >= 1_00_000) return `₹${(value / 1_00_000).toFixed(value % 1_00_000 ? 1 : 0)} L`
  return `₹${value.toLocaleString('en-IN')}`
}
