import { z } from 'zod'

/** Shared validation for Service create/update (dashboard + API). */
export const ServiceInput = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().min(5, 'Short description must be at least 5 characters'),
  detailedDescription: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  benefits: z.array(z.string().min(1)).default([]),
  duration: z.string().optional().nullable(),
  pricing: z.string().optional().nullable(),
  // New studio categories; legacy values are still accepted for old rows.
  category: z
    .enum(['architecture', 'interiors', 'delivery', 'speciality', 'conditions', 'rehabilitation'])
    .default('architecture'),
  published: z.boolean().default(true),
  displayOrder: z.coerce.number().int().min(0).default(0),
})

export type ServiceInputType = z.infer<typeof ServiceInput>

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// ── Shared field helpers ─────────────────────────────────────────────────
/** Optional string: empty string / undefined → null. */
const optStr = z.preprocess(
  (v) => (v === '' || v === undefined ? null : v),
  z.string().nullable(),
)
/** Optional date from an ISO/date string: empty → null. */
const optDate = z.preprocess(
  (v) => (v === '' || v === undefined || v === null ? null : new Date(v as string)),
  z.date().nullable(),
)
/** Optional integer: empty → null. */
const optInt = z.preprocess(
  (v) => (v === '' || v === undefined || v === null ? null : Number(v)),
  z.number().int().nullable(),
)
const tags = z.array(z.string().min(1)).default([])
const published = z.boolean().default(true)
const displayOrder = z.coerce.number().int().min(0).default(0)

// ── Sessions ─────────────────────────────────────────────────────────────
export const SessionInput = z.object({
  title: z.string().min(2, 'Title is required'),
  image: optStr,
  description: optStr,
  videoUrl: optStr,
  sessionType: optStr,
  duration: optStr,
  date: optDate,
  time: optStr,
  published,
  displayOrder,
})

// ── Videos ───────────────────────────────────────────────────────────────
export const VideoInput = z.object({
  title: z.string().min(2, 'Title is required'),
  thumbnail: optStr,
  videoUrl: optStr,
  description: optStr,
  category: optStr,
  published,
  displayOrder,
})

// ── Workshops ────────────────────────────────────────────────────────────
export const WorkshopInput = z.object({
  name: z.string().min(2, 'Name is required'),
  bannerImage: optStr,
  description: optStr,
  date: optDate,
  startTime: optStr,
  endTime: optStr,
  location: optStr,
  capacity: optInt,
  registrationInfo: optStr,
  published,
  displayOrder,
})

// ── Events ───────────────────────────────────────────────────────────────
export const EventInput = z.object({
  name: z.string().min(2, 'Name is required'),
  bannerImage: optStr,
  description: optStr,
  date: optDate,
  location: optStr,
  details: optStr,
  published,
  displayOrder,
})

// ── Gallery ──────────────────────────────────────────────────────────────
export const GalleryInput = z.object({
  image: z.string().min(1, 'Image is required'),
  caption: optStr,
  category: optStr,
  published,
  displayOrder,
})

// ── Certifications ───────────────────────────────────────────────────────
export const CertificationInput = z.object({
  name: z.string().min(2, 'Name is required'),
  organization: optStr,
  issueDate: optDate,
  image: optStr,
  description: optStr,
  displayOrder,
})

// ── Tips ─────────────────────────────────────────────────────────────────
export const TipInput = z.object({
  emoji: optStr,
  title: z.string().min(1, 'Title is required'),
  published,
  displayOrder,
})

// ── Studio Settings (ClinicSettings table, singleton) ──────────────────────────────────────────
export const ClinicInput = z.object({
  name: z.string().min(1, 'Studio name is required'),
  fullName: optStr,
  tagline: optStr,
  phone: optStr,
  whatsapp: optStr,
  email: optStr,
  addressLine1: optStr,
  addressLine2: optStr,
  state: optStr,
  pincode: optStr,
  addressFull: optStr,
  mapsEmbedUrl: optStr,
  heroVideoUrl: optStr,
  heroImageUrl: optStr,
  hours: z
    .array(
      z.object({
        day: z.string(),
        morningOpen: z.string().optional().nullable(),
        morningClose: z.string().optional().nullable(),
        eveningOpen: z.string().optional().nullable(),
        eveningClose: z.string().optional().nullable(),
        byAppointment: z.boolean().optional(),
      }),
    )
    .default([]),
  stats: z.array(z.object({ value: z.string(), label: z.string() })).default([]),
  socials: z.record(z.string(), z.string()).nullable().optional(),
})

// ── Projects (portfolio + project management) ────────────────────────────
const optUrlList = z.array(z.string().min(1)).default([])
export const ProjectInput = z.object({
  title: z.string().min(2, 'Project title is required'),
  slug: optStr.optional(),
  category: z.enum(['residential', 'commercial', 'interior', 'renovation', 'landscape']).default('residential'),
  status: z
    .enum(['enquiry', 'concept', 'design', 'documentation', 'construction', 'completed', 'on-hold'])
    .default('concept'),
  location: optStr,
  year: optInt,
  area: optStr,
  summary: optStr,
  concept: optStr,
  description: optStr,
  coverImage: optStr,
  gallery: optUrlList,
  materials: tags,
  specs: tags,
  services: tags,
  clientName: optStr,
  clientEmail: optStr,
  clientPhone: optStr,
  budget: optInt,
  startDate: optDate,
  deadline: optDate,
  progress: z.coerce.number().int().min(0).max(100).default(0),
  documents: optStr,
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
  seoTitle: optStr,
  seoDescription: optStr,
  displayOrder,
})

// ── Team ─────────────────────────────────────────────────────────────────
export const TeamMemberInput = z.object({
  name: z.string().min(2, 'Name is required'),
  role: z.string().min(2, 'Role is required'),
  discipline: z.enum(['architect', 'interior', 'engineer', 'project-manager', 'studio']).default('architect'),
  photo: optStr,
  bio: optStr,
  email: optStr,
  linkedin: optStr,
  published,
  displayOrder,
})

// ── Public enquiry / consultation request ────────────────────────────────
export const EnquiryInput = z.object({
  fullName: z.string({ error: 'Please enter your name' }).trim().min(2, 'Please enter your name'),
  phone: z
    .string({ error: 'Please enter your phone number' })
    .trim()
    .min(10, 'Phone must be at least 10 digits')
    .max(20, 'Phone number looks too long'),
  email: z.string({ error: 'Please enter your email' }).trim().email('Please enter a valid email address'),
  // Optional at the API level so older clients (pre-rebrand payloads) keep working;
  // the website form requires them.
  projectType: z.string().trim().max(120).optional().nullable(),
  budget: z.string().trim().max(120).optional().nullable(),
  location: z.string().trim().max(200).optional().nullable(),
  problem: z
    .string({ error: 'Please describe your project' })
    .trim()
    .min(10, 'Please describe your project in a few words (10+ characters)')
    .max(4000, 'Project description is too long'),
  preferredDate: z
    .string({ error: 'Please choose a preferred consultation date' })
    .min(1, 'Please choose a preferred consultation date')
    .refine((v) => !Number.isNaN(Date.parse(v)), 'Please choose a valid date'),
  preferredTime: z.string({ error: 'Please choose a preferred time' }).min(1, 'Please choose a preferred time'),
  notes: z.string().max(2000).optional(),
  // Legacy fields — accepted (and ignored when absent) for old clients of the API.
  age: z.coerce.number().int().min(1).max(120).optional(),
  gender: z.string().optional(),
})

// ── Admin enquiry update ─────────────────────────────────────────────────
export const EnquiryUpdate = z.object({
  status: z.enum(['pending', 'contacted', 'confirmed', 'completed', 'cancelled', 'missed']).optional(),
  assignedTo: optStr.optional(),
  followUpDate: optDate.optional(),
  notes: optStr.optional(),
})

// ── Profile (singleton) ──────────────────────────────────────────────────
export const ProfileInput = z.object({
  photo: optStr,
  name: z.string().min(2, 'Name is required'),
  designation: optStr,
  biography: optStr,
  experience: optStr,
  education: tags,
  specializations: tags,
  achievements: tags,
  phone: optStr,
  email: optStr,
  socials: z.record(z.string(), z.string()).nullable().optional(),
})
