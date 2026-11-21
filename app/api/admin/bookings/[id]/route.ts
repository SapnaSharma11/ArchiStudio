import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAdminApi } from '@/lib/auth'
import { EnquiryUpdate } from '@/lib/schemas'

export const dynamic = 'force-dynamic'

// Booking rows are studio enquiries / consultation requests. Status values are
// unchanged from the original schema (see ENQUIRY_STATUS_LABEL in lib/brand.ts).
export const BOOKING_STATUSES = ['pending', 'contacted', 'confirmed', 'completed', 'cancelled'] as const

function parseId(idParam: string): number | null {
  const id = Number(idParam)
  return Number.isInteger(id) && id > 0 ? id : null
}

/**
 * Update an enquiry. Backward compatible: `{ status }` alone still works; the
 * studio dashboard can also send `assignedTo`, `followUpDate` and `notes`.
 */
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminApi()
  if (denied) return denied
  const id = parseId((await ctx.params).id)
  if (!id) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  try {
    const data = EnquiryUpdate.parse(await req.json())
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
    }
    const booking = await prisma.booking.update({ where: { id }, data })
    return NextResponse.json(booking)
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    console.error('Booking update error:', err)
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminApi()
  if (denied) return denied
  const id = parseId((await ctx.params).id)
  if (!id) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  try {
    await prisma.booking.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Booking delete error:', err)
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}
