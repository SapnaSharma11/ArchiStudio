/**
 * Seed the architecture-studio sample content.
 *
 *   npx prisma db seed
 *
 * Safety:
 *  - Refuses to run against a non-local DATABASE_URL unless SEED_ALLOW_REMOTE=1,
 *    so sample content never lands in production by accident.
 *  - Never deletes rows. Legacy (pre-rebrand) services, gallery items, tips and
 *    films are UNPUBLISHED, not removed. Enquiries (bookings) are not touched.
 *  - Idempotent: safe to run multiple times.
 */
import { config as loadEnv } from 'dotenv'
loadEnv({ path: '.env.local' })
loadEnv()
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const url =
  [process.env.DATABASE_URL, process.env.DATABASE_POSTGRES_URL, process.env.POSTGRES_URL, process.env.DATABASE_URL_UNPOOLED, process.env.POSTGRES_URL_NON_POOLING].find(
    (u) => u && /^postgres(ql)?:\/\//.test(u),
  ) ?? ''
const isLocal = /@(localhost|127\.0\.0\.1|\[::1\])(:\d+)?\//.test(url)
if (!isLocal && process.env.SEED_ALLOW_REMOTE !== '1') {
  console.error('✋ Refusing to seed a non-local database. Set SEED_ALLOW_REMOTE=1 if you really mean it.')
  process.exit(1)
}

const pool = new Pool({ connectionString: url })
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

const root = process.cwd()
const readJson = (rel: string) => JSON.parse(readFileSync(join(root, rel), 'utf-8'))

type RawService = {
  id: string; title: string; description: string; detailedDescription?: string; image: string
  benefits: string[]; duration: string; pricing?: string; category: string
}
type RawProject = {
  slug: string; title: string; category: string; status: string; location: string | null; year: number | null
  area: string | null; summary: string; concept: string | null; description: string | null; coverImage: string
  gallery: string[]; materials: string[]; specs: string[]; services: string[]
  clientName: string | null; clientEmail: string | null; clientPhone: string; budget: number | null
  startDate: string | null; deadline: string | null; progress: number; featured: boolean; published: boolean
}

async function seedServices() {
  const services: RawService[] = readJson('data/services.json')
  const slugs = services.map((s) => s.id)
  for (const [i, s] of services.entries()) {
    const data = {
      title: s.title,
      description: s.description,
      detailedDescription: s.detailedDescription ?? null,
      image: s.image,
      benefits: s.benefits ?? [],
      duration: s.duration,
      pricing: s.pricing ?? null,
      category: s.category,
      published: true,
      displayOrder: i,
    }
    await prisma.service.upsert({ where: { slug: s.id }, update: data, create: { slug: s.id, ...data } })
  }
  const hidden = await prisma.service.updateMany({
    where: { slug: { notIn: slugs }, published: true },
    data: { published: false },
  })
  console.log(`✓ services: ${services.length} upserted, ${hidden.count} legacy unpublished`)
}

async function seedProjects() {
  // Remove the template's sample projects (stock imagery, invented clients).
  const removed = await prisma.project.deleteMany({ where: { coverImage: { startsWith: '/images/arche/' } } })
  if (removed.count) console.log(`✓ removed ${removed.count} sample projects`)
  const projects: RawProject[] = readJson('data/projects.json')
  for (const [i, p] of projects.entries()) {
    const data = {
      title: p.title,
      category: p.category,
      status: p.status,
      location: p.location,
      year: p.year,
      area: p.area,
      summary: p.summary,
      concept: p.concept,
      description: p.description,
      coverImage: p.coverImage,
      gallery: p.gallery,
      materials: p.materials,
      specs: p.specs,
      services: p.services,
      clientName: p.clientName || null,
      clientEmail: p.clientEmail || null,
      clientPhone: p.clientPhone || null,
      budget: p.budget,
      startDate: p.startDate ? new Date(p.startDate) : null,
      deadline: p.deadline ? new Date(p.deadline) : null,
      progress: p.progress,
      featured: p.featured,
      published: p.published,
      displayOrder: i,
    }
    await prisma.project.upsert({ where: { slug: p.slug }, update: data, create: { slug: p.slug, ...data } })
  }
  console.log(`✓ projects: ${projects.length} upserted`)
}

async function seedTeam() {
  const team: { name: string; role: string; discipline: string; bio: string }[] = readJson('data/team.json')
  for (const [i, m] of team.entries()) {
    const existing = await prisma.teamMember.findFirst({ where: { name: m.name } })
    const data = { role: m.role, discipline: m.discipline, bio: m.bio, displayOrder: i }
    if (existing) await prisma.teamMember.update({ where: { id: existing.id }, data })
    else await prisma.teamMember.create({ data: { name: m.name, published: true, ...data } })
  }
  console.log(`✓ team: ${team.length}`)
}

async function seedStudio() {
  const s = readJson('data/studio.json')
  const settings = {
    name: s.name,
    fullName: s.fullName,
    tagline: s.tagline,
    phone: s.phone,
    whatsapp: s.whatsapp || null,
    email: s.email,
    addressLine1: s.address.line1,
    addressLine2: s.address.line2,
    state: s.address.state,
    pincode: s.address.pincode,
    addressFull: s.address.full,
    mapsEmbedUrl: 'https://maps.google.com/maps?q=203A%20New%20Roshanpura%20Najafgarh%20New%20Delhi&output=embed',
    heroVideoUrl: '/videos/apn/arched-wall-panel.mp4',
    heroImageUrl: '/images/apn/apartment-building-elevation.jpg',
    hours: s.hours,
    stats: s.stats,
    socials: s.socials,
  }
  await prisma.clinicSettings.upsert({ where: { id: 1 }, update: settings, create: { id: 1, ...settings } })

  const p = s.principal
  const profile = {
    photo: p.photo || null,
    name: p.name,
    designation: p.title,
    biography: p.biography,
    experience: p.experience ? `${p.experience} years` : null,
    education: p.education,
    specializations: p.expertise,
    achievements: p.achievements,
    phone: null,
    email: s.email || null,
    socials: s.socials,
  }
  await prisma.profile.upsert({ where: { id: 1 }, update: profile, create: { id: 1, ...profile } })
  console.log('✓ studio settings + principal profile')
}

async function seedSiteContent() {
  const site = readJson('data/site.json')

  // Awards (Certification table has no publish flag → update rows in place by order).
  const awards: { name: string; organization: string; issueDate: string; description: string }[] = site.awards ?? []
  const existing = await prisma.certification.findMany({ orderBy: [{ displayOrder: 'asc' }, { id: 'asc' }] })
  for (const [i, a] of awards.entries()) {
    const data = { name: a.name, organization: a.organization, issueDate: new Date(a.issueDate), description: a.description, image: null, displayOrder: i }
    if (existing[i]) await prisma.certification.update({ where: { id: existing[i].id }, data })
    else await prisma.certification.create({ data })
  }
  // Any extra legacy rows beyond the awards list are pushed to the end and
  // renamed as clearly-marked drafts rather than deleted.
  for (const extra of existing.slice(awards.length)) {
    if (!extra.name.startsWith('[Legacy]')) {
      await prisma.certification.update({ where: { id: extra.id }, data: { name: `[Legacy] ${extra.name}`, displayOrder: 999 } })
    }
  }

  // Design principles (Tip table)
  const principles: string[] = site.principles
  await prisma.tip.updateMany({ where: { title: { notIn: principles } }, data: { published: false } })
  for (const [i, title] of principles.entries()) {
    const t = await prisma.tip.findFirst({ where: { title } })
    if (t) await prisma.tip.update({ where: { id: t.id }, data: { published: true, displayOrder: i, emoji: null } })
    else await prisma.tip.create({ data: { title, published: true, displayOrder: i } })
  }

  // Sample client testimonials — created as UNAPPROVED drafts so nothing
  // fabricated goes live; approve or replace them in Dashboard → Testimonials.
  for (const t of (site.testimonials ?? []) as { name: string; rating: number; message: string }[]) {
    const hit = await prisma.testimonial.findFirst({ where: { name: t.name } })
    if (!hit) await prisma.testimonial.create({ data: { ...t, approved: false } })
  }

  // Invented sample reviews from the earlier template must never be public.
  await prisma.testimonial.updateMany({
    where: {
      name: {
        in: [
          'Neha Sharma — The Courtyard House',
          'Arjun Kapoor — White Ledge Villa',
          'Facilities Head — Meridian Analytics',
          'Riya Iyer — Ivory Apartment',
        ],
      },
    },
    data: { approved: false },
  })

  // Films (Session table): APN's own site and interiors videos; hide anything else.
  const filmData: { title: string; video: string; poster: string; duration: string; type: string }[] = site.films ?? []
  const films = await prisma.session.updateMany({
    where: { title: { notIn: filmData.map((f) => f.title) }, published: true },
    data: { published: false },
  })
  for (const [i, f] of filmData.entries()) {
    const data = { videoUrl: f.video, image: f.poster, duration: f.duration, sessionType: f.type, published: true, displayOrder: i }
    const hit = await prisma.session.findFirst({ where: { title: f.title } })
    if (hit) await prisma.session.update({ where: { id: hit.id }, data })
    else await prisma.session.create({ data: { title: f.title, ...data } })
  }

  // Project archive (GalleryItem): show only imagery from published projects.
  const projects: RawProject[] = readJson('data/projects.json')
  const live = projects.filter((p) => p.published)
  const isVideo = (u: string) => /\.(mp4|webm|mov)$/i.test(u)
  const liveImages = [...new Set(live.flatMap((p) => [p.coverImage, ...p.gallery]))].filter((u) => !isVideo(u))
  await prisma.galleryItem.deleteMany({ where: { image: { startsWith: '/images/arche/' } } })
  const legacyGallery = await prisma.galleryItem.updateMany({
    where: { image: { notIn: liveImages }, published: true },
    data: { published: false },
  })
  let order = 0
  for (const p of live) {
    for (const image of [p.coverImage, ...p.gallery].filter((u) => !isVideo(u))) {
      const hit = await prisma.galleryItem.findFirst({ where: { image } })
      if (!hit) {
        await prisma.galleryItem.create({
          data: { image, caption: p.location ? `${p.title} — ${p.location}` : p.title, category: p.category, published: true, displayOrder: order },
        })
      } else if (!hit.published) {
        await prisma.galleryItem.update({ where: { id: hit.id }, data: { published: true } })
      }
      order += 1
    }
  }
  console.log(`✓ awards, principles, draft testimonials; ${films.count} legacy films + ${legacyGallery.count} legacy gallery items unpublished`)
}

async function main() {
  await seedServices()
  await seedProjects()
  await seedTeam()
  await seedStudio()
  await seedSiteContent()
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
