import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminApi } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const denied = await requireAdminApi()
  if (denied) return denied
  const bookings = await prisma.booking.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(bookings)
}
