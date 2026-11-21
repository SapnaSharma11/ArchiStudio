import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminApi } from '@/lib/auth'
import { uniqueProjectSlug } from '@/lib/projects'

export const dynamic = 'force-dynamic'

const TYPE_TO_CATEGORY: [RegExp, string][] = [
  [/interior/i, 'interior'],
  [/renovat|remodel/i, 'renovation'],
  [/landscape/i, 'landscape'],
  [/commercial|workplace|hospitality|retail/i, 'commercial'],
]

/**
 * Convert an enquiry into a Project. Creates an unpublished project in the
 * "concept" stage pre-filled with the client's details, links it back to the
 * enquiry (`projectId`) and marks the enquiry as converted (`completed`).
 * Idempotent: converting twice returns the existing project.
 */
export async function POST(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminApi()
  if (denied) return denied
  const id = Number((await ctx.params).id)
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  try {
    const enquiry = await prisma.booking.findUnique({ where: { id } })
    if (!enquiry) return NextResponse.json({ error: 'Enquiry not found' }, { status: 404 })

    if (enquiry.projectId) {
      const existing = await prisma.project.findUnique({ where: { id: enquiry.projectId } })
      if (existing) return NextResponse.json(existing)
    }

    const category =
      TYPE_TO_CATEGORY.find(([re]) => re.test(enquiry.projectType ?? ''))?.[1] ?? 'residential'
    const title = `${enquiry.fullName} — ${enquiry.projectType ?? 'New project'}`

    const project = await prisma.$transaction(async (tx) => {
      const created = await tx.project.create({
        data: {
          title,
          slug: await uniqueProjectSlug(title),
          category,
          status: 'concept',
          location: enquiry.location,
          summary: enquiry.problem,
          clientName: enquiry.fullName,
          clientEmail: enquiry.email,
          clientPhone: enquiry.phone,
          startDate: new Date(),
          published: false,
          gallery: [],
          materials: [],
          specs: [],
          services: [],
        },
      })
      await tx.booking.update({ where: { id }, data: { status: 'completed', projectId: created.id } })
      return created
    })

    return NextResponse.json(project, { status: 201 })
  } catch (err) {
    console.error('Enquiry convert error:', err)
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 })
  }
}
