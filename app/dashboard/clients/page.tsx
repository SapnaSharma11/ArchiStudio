import { prisma } from '@/lib/prisma'
import ClientsView, { type ClientDTO } from '@/components/dashboard/clients/ClientsView'

export const dynamic = 'force-dynamic'

/**
 * Clients are derived — there is no Client table. Enquiries (Booking) and
 * Projects are grouped by lower-cased email (falling back to the name).
 */
async function getClients(): Promise<ClientDTO[]> {
  try {
    const [bookings, projects] = await Promise.all([
      prisma.booking.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.project.findMany({ orderBy: { updatedAt: 'desc' } }),
    ])
    const map = new Map<string, ClientDTO>()
    const keyOf = (email: string | null, name: string | null) =>
      (email?.trim().toLowerCase() || `name:${(name ?? 'unknown').trim().toLowerCase()}`)
    const touch = (c: ClientDTO, d: Date) => {
      if (!c.lastActivity || d.toISOString() > c.lastActivity) c.lastActivity = d.toISOString()
    }
    const get = (key: string, name: string, email: string | null, phone: string | null) => {
      let c = map.get(key)
      if (!c) {
        c = { key, name, email, phone, location: null, enquiries: [], projects: [], totalBudget: 0, lastActivity: null }
        map.set(key, c)
      }
      if (!c.phone && phone) c.phone = phone
      if (!c.email && email) c.email = email
      return c
    }

    for (const b of bookings) {
      const c = get(keyOf(b.email, b.fullName), b.fullName, b.email, b.phone)
      if (!c.location && b.location) c.location = b.location
      c.enquiries.push({
        id: b.id,
        createdAt: b.createdAt.toISOString(),
        status: b.status,
        projectType: b.projectType,
        budget: b.budget,
        brief: b.problem,
        notes: b.notes,
        followUpDate: b.followUpDate?.toISOString() ?? null,
        preferredDate: b.preferredDate.toISOString(),
        preferredTime: b.preferredTime,
        assignedTo: b.assignedTo,
      })
      touch(c, b.updatedAt)
    }
    for (const p of projects) {
      if (!p.clientName && !p.clientEmail) continue
      const c = get(keyOf(p.clientEmail, p.clientName), p.clientName ?? p.clientEmail ?? 'Client', p.clientEmail, p.clientPhone)
      if (!c.location && p.location) c.location = p.location
      c.projects.push({ id: p.id, title: p.title, status: p.status, budget: p.budget, progress: p.progress, slug: p.slug, published: p.published })
      c.totalBudget += p.budget ?? 0
      touch(c, p.updatedAt)
    }
    return [...map.values()].sort((a, b) => (b.lastActivity ?? '').localeCompare(a.lastActivity ?? ''))
  } catch {
    return []
  }
}

export default async function Page() {
  return <ClientsView clients={await getClients()} />
}
