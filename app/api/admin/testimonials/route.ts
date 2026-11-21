import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminApi } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// All testimonials (admin view — includes unapproved).
export async function GET() {
  const denied = await requireAdminApi()
  if (denied) return denied
  const testimonials = await prisma.testimonial.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(testimonials)
}
