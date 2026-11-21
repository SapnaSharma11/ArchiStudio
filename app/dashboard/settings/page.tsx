import { prisma } from '@/lib/prisma'
import studioJson from '@/data/studio.json'
import { BRAND } from '@/lib/brand'
import { mailStatus } from '@/lib/email'
import StudioSettingsForm, { type StudioSettingsDTO } from '@/components/dashboard/settings/StudioSettingsForm'

export const dynamic = 'force-dynamic'

function defaults(): StudioSettingsDTO {
  const j = studioJson
  return {
    name: j.name,
    fullName: j.fullName,
    tagline: j.tagline,
    phone: j.phone,
    whatsapp: j.whatsapp,
    email: j.email,
    addressLine1: j.address.line1,
    addressLine2: j.address.line2,
    state: j.address.state,
    pincode: j.address.pincode,
    addressFull: j.address.full,
    mapsEmbedUrl: process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL ?? '',
    heroVideoUrl: '',
    heroImageUrl: '/images/arche/hero-dusk-residence.jpg',
    hours: j.hours,
    stats: j.stats,
    socials: j.socials,
  }
}

export default async function Page() {
  let initial = defaults()
  try {
    const s = await prisma.clinicSettings.findUnique({ where: { id: 1 } })
    if (s) {
      initial = {
        name: s.name,
        fullName: s.fullName,
        tagline: s.tagline,
        phone: s.phone,
        whatsapp: s.whatsapp,
        email: s.email,
        addressLine1: s.addressLine1,
        addressLine2: s.addressLine2,
        state: s.state,
        pincode: s.pincode,
        addressFull: s.addressFull,
        mapsEmbedUrl: s.mapsEmbedUrl,
        heroVideoUrl: s.heroVideoUrl,
        heroImageUrl: s.heroImageUrl,
        hours: (s.hours as StudioSettingsDTO['hours']) ?? [],
        stats: (s.stats as StudioSettingsDTO['stats']) ?? [],
        socials: (s.socials as Record<string, string> | null) ?? null,
      }
    }
  } catch {
    /* DB not ready — use JSON defaults */
  }
  return (
    <StudioSettingsForm
      initial={initial}
      brand={{
        name: BRAND.name,
        wordmark: BRAND.wordmark,
        descriptor: BRAND.descriptor,
        tagline: BRAND.tagline,
        siteUrl: BRAND.siteUrl,
      }}
      mail={mailStatus()}
    />
  )
}
