import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAdminApi } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const Body = z.object({
  order: z.array(z.object({ id: z.number().int(), displayOrder: z.number().int() })),
})

export async function POST(req: NextRequest) {
  const denied = await requireAdminApi()
  if (denied) return denied
  try {
    const { order } = Body.parse(await req.json())
    await prisma.$transaction(
      order.map((o) => prisma.galleryItem.update({ where: { id: o.id }, data: { displayOrder: o.displayOrder } })),
    )
    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    console.error('Gallery reorder error:', err)
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}
