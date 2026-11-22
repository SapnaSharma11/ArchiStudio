import { cache } from 'react'
import { prisma } from '@/lib/prisma'
import studioJson from '@/data/studio.json'
import { BRAND } from '@/lib/brand'

/**
 * Site-wide studio data. (File keeps its original name — `lib/clinic.ts` — so
 * existing imports keep working; the DB table is still `ClinicSettings`.)
 */

export type HoursEntry = {
  day: string
  morningOpen?: string
  morningClose?: string
  eveningOpen?: string
  eveningClose?: string
  byAppointment?: boolean
  closed?: boolean
}
export type Stat = { value: string; label: string }
export type Award = { name: string; organization: string | null; year: number | null; image: string | null; description: string | null }

export type StudioData = {
  name: string
  fullName: string
  tagline: string
  phone: string
  whatsapp: string
  email: string
  address: { line1: string; line2: string; state: string; pincode: string; full: string }
  stats: Stat[]
  hours: HoursEntry[]
  mapsEmbedUrl: string
  heroVideoUrl: string
  /** Poster frame for the hero video (first frame of the clip). */
  heroVideoPoster: string
  heroImageUrl: string
  principal: {
    name: string
    title: string
    photo: string
    biography: string
    experience: string
    education: string[]
    expertise: string[]
    achievements: string[]
  }
  awards: Award[]
  socials: Record<string, string>
}

/** @deprecated use StudioData */
export type ClinicData = StudioData

const j = studioJson
/** Poster for a bundled /videos/apn/<name>.mp4 clip; uploaded videos fall back to the hero image. */
export function videoPoster(url: string): string {
  const m = url.match(/^\/videos\/apn\/([a-z0-9-]+)\.mp4$/)
  return m ? `/images/apn/films/${m[1]}.jpg` : ''
}

const DEFAULT_HERO = '/images/apn/apartment-building-elevation.jpg'
const DEFAULT_MAP = 'https://maps.google.com/maps?q=203A%20New%20Roshanpura%20Najafgarh%20New%20Delhi&output=embed'

function jsonFallback(): StudioData {
  return {
    name: j.name || BRAND.name,
    fullName: j.fullName,
    tagline: j.tagline || BRAND.tagline,
    phone: j.phone,
    whatsapp: j.whatsapp,
    email: j.email,
    address: j.address,
    stats: j.stats,
    hours: j.hours,
    mapsEmbedUrl: process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL || DEFAULT_MAP,
    heroVideoUrl: '/videos/apn/arched-wall-panel.mp4',
    heroVideoPoster: videoPoster('/videos/apn/arched-wall-panel.mp4'),
    heroImageUrl: DEFAULT_HERO,
    principal: { ...j.principal },
    awards: [],
    socials: j.socials,
  }
}

/**
 * Single source of truth for site-wide studio data. Merges the ClinicSettings
 * (studio settings) + Profile (principal architect) + Certification (awards)
 * DB records over the static `data/studio.json` fallback. React-cached per request.
 */
export const getStudio = cache(async (): Promise<StudioData> => {
  const fb = jsonFallback()
  try {
    const [s, profile, awards] = await Promise.all([
      prisma.clinicSettings.findUnique({ where: { id: 1 } }),
      prisma.profile.findUnique({ where: { id: 1 } }),
      prisma.certification.findMany({ orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }] }),
    ])
    return {
      name: s?.name || fb.name,
      fullName: s?.fullName ?? fb.fullName,
      tagline: s?.tagline ?? fb.tagline,
      phone: s?.phone ?? fb.phone,
      whatsapp: s?.whatsapp ?? fb.whatsapp,
      email: s?.email ?? fb.email,
      address: {
        line1: s?.addressLine1 ?? fb.address.line1,
        line2: s?.addressLine2 ?? fb.address.line2,
        state: s?.state ?? fb.address.state,
        pincode: s?.pincode ?? fb.address.pincode,
        full: s?.addressFull ?? fb.address.full,
      },
      stats: ((s?.stats as Stat[] | null) ?? fb.stats) || [],
      hours: ((s?.hours as HoursEntry[] | null) ?? fb.hours) || [],
      mapsEmbedUrl: s?.mapsEmbedUrl || fb.mapsEmbedUrl,
      heroVideoUrl: s?.heroVideoUrl ?? '',
      heroVideoPoster: videoPoster(s?.heroVideoUrl ?? ''),
      heroImageUrl: s?.heroImageUrl || fb.heroImageUrl,
      principal: profile
        ? {
            name: profile.name,
            title: profile.designation ?? fb.principal.title,
            photo: profile.photo ?? '',
            biography: profile.biography ?? '',
            experience: (profile.experience ?? '').replace(/\s*\+?\s*years?\s*$/i, ''),
            education: profile.education,
            expertise: profile.specializations,
            achievements: profile.achievements,
          }
        : fb.principal,
      // Rows prefixed "[Legacy]" are pre-rebrand records kept (not deleted) by the seed.
      awards: awards.filter((a) => !a.name.startsWith('[Legacy]')).map((a) => ({
        name: a.name,
        organization: a.organization,
        year: a.issueDate ? a.issueDate.getFullYear() : null,
        image: a.image,
        description: a.description,
      })),
      socials: (s?.socials as Record<string, string> | null) ?? fb.socials,
    }
  } catch {
    return fb
  }
})

/** @deprecated kept for backward compatibility — use getStudio */
export const getClinic = getStudio
