import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAdminApi } from '@/lib/auth'
import { ProjectInput } from '@/lib/schemas'
import { uniqueProjectSlug } from '@/lib/projects'

export const dynamic = 'force-dynamic'

// List all projects (admin view — includes unpublished / in-progress work).
export async function GET() {
  const denied = await requireAdminApi()
  if (denied) return denied
  const rows = await prisma.project.findMany({
    orderBy: [{ displayOrder: 'asc' }, { updatedAt: 'desc' }],
  })
  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const denied = await requireAdminApi()
  if (denied) return denied
  try {
    const { slug, ...data } = ProjectInput.parse(await req.json())
    const project = await prisma.project.create({
      data: { ...data, slug: await uniqueProjectSlug(slug || data.title) },
    })
    return NextResponse.json(project, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues.map((e) => e.message).join(', ') }, { status: 400 })
    }
    console.error('Project create error:', err)
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 })
  }
}
