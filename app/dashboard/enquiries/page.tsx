import { prisma } from '@/lib/prisma'
import EnquiriesManager, { type EnquiryDTO } from '@/components/dashboard/enquiries/EnquiriesManager'

export const dynamic = 'force-dynamic'

export default async function Page() {
  let initial: EnquiryDTO[] = []
  let team: string[] = []
  try {
    const [rows, members, projects] = await Promise.all([
      prisma.booking.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.teamMember.findMany({ orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }], select: { name: true, role: true } }),
      prisma.project.findMany({ select: { id: true, title: true } }),
    ])
    const titles = new Map(projects.map((p) => [p.id, p.title]))
    team = members.map((m) => m.name)
    initial = rows.map((b) => ({
      id: b.id,
      fullName: b.fullName,
      phone: b.phone,
      email: b.email,
      problem: b.problem,
      notes: b.notes,
      projectType: b.projectType,
      budget: b.budget,
      location: b.location,
      assignedTo: b.assignedTo,
      followUpDate: b.followUpDate?.toISOString() ?? null,
      projectId: b.projectId,
      projectTitle: b.projectId ? titles.get(b.projectId) ?? null : null,
      preferredDate: b.preferredDate.toISOString(),
      preferredTime: b.preferredTime,
      status: b.status,
      createdAt: b.createdAt.toISOString(),
    }))
  } catch {
    /* DB not ready */
  }
  return <EnquiriesManager initial={initial} team={team} />
}
