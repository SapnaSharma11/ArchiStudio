import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAdminApi } from '@/lib/auth'
import { ServiceInput } from '@/lib/schemas'

export const dynamic = 'force-dynamic'

function parseId(idParam: string): number | null {
  const id = Number(idParam)
  return Number.isInteger(id) && id > 0 ? id : null
}

// Update a service.
export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminApi()
  if (denied) return denied

  const id = parseId((await ctx.params).id)
  if (!id) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  try {
    const data = ServiceInput.parse(await req.json())
    const service = await prisma.service.update({ where: { id }, data })
    return NextResponse.json(service)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.issues.map((e) => e.message).join(', ') },
        { status: 400 },
      )
    }
    console.error('Service update error:', err)
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 })
  }
}

// Toggle visibility (publish/unpublish).
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminApi()
  if (denied) return denied

  const id = parseId((await ctx.params).id)
  if (!id) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  try {
    const { published } = z.object({ published: z.boolean() }).parse(await req.json())
    const service = await prisma.service.update({ where: { id }, data: { published } })
    return NextResponse.json(service)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
    console.error('Service toggle error:', err)
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}

// Delete a service.
export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminApi()
  if (denied) return denied

  const id = parseId((await ctx.params).id)
  if (!id) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  try {
    await prisma.service.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Service delete error:', err)
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}
