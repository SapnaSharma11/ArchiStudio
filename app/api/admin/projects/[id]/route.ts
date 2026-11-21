import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAdminApi } from '@/lib/auth'
import { item } from '@/lib/crud'
import { ProjectInput } from '@/lib/schemas'
import { uniqueProjectSlug } from '@/lib/projects'

export const dynamic = 'force-dynamic'

// PATCH (publish toggle) + DELETE come from the shared CRUD helpers.
const h = item(prisma.project, ProjectInput, { publishable: true })
export const PATCH = h.PATCH
export const DELETE = h.DELETE

function parseId(idParam: string): number | null {
  const id = Number(idParam)
  return Number.isInteger(id) && id > 0 ? id : null
}

// PUT is custom so the slug can be edited without colliding with another project.
export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminApi()
  if (denied) return denied
  const id = parseId((await ctx.params).id)
  if (!id) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  try {
    const { slug, ...data } = ProjectInput.parse(await req.json())
    const current = await prisma.project.findUnique({ where: { id } })
    if (!current) return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    const nextSlug = slug && slug !== current.slug ? await uniqueProjectSlug(slug, id) : current.slug
    const project = await prisma.project.update({ where: { id }, data: { ...data, slug: nextSlug } })
    return NextResponse.json(project)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues.map((e) => e.message).join(', ') }, { status: 400 })
    }
    console.error('Project update error:', err)
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 })
  }
}
