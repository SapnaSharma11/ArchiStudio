import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAdminApi } from '@/lib/auth'

export const dynamic = 'force-dynamic'

function parseId(idParam: string): number | null {
  const id = Number(idParam)
  return Number.isInteger(id) && id > 0 ? id : null
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminApi()
  if (denied) return denied
  const id = parseId((await ctx.params).id)
  if (!id) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  try {
    const { approved } = z.object({ approved: z.boolean() }).parse(await req.json())
    const t = await prisma.testimonial.update({ where: { id }, data: { approved } })
    return NextResponse.json(t)
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    console.error('Testimonial update error:', err)
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminApi()
  if (denied) return denied
  const id = parseId((await ctx.params).id)
  if (!id) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  try {
    await prisma.testimonial.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Testimonial delete error:', err)
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}
