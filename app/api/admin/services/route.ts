import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAdminApi } from '@/lib/auth'
import { ServiceInput, slugify } from '@/lib/schemas'

export const dynamic = 'force-dynamic'

async function uniqueSlug(title: string): Promise<string> {
  const base = slugify(title) || 'service'
  let slug = base
  let n = 1
  while (await prisma.service.findUnique({ where: { slug } })) {
    n += 1
    slug = `${base}-${n}`
  }
  return slug
}

// List all services (admin view — includes unpublished).
export async function GET() {
  const denied = await requireAdminApi()
  if (denied) return denied

  const services = await prisma.service.findMany({
    orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
  })
  return NextResponse.json(services)
}

// Create a service.
export async function POST(req: NextRequest) {
  const denied = await requireAdminApi()
  if (denied) return denied

  try {
    const data = ServiceInput.parse(await req.json())
    const service = await prisma.service.create({
      data: { ...data, slug: await uniqueSlug(data.title) },
    })
    return NextResponse.json(service, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.issues.map((e) => e.message).join(', ') },
        { status: 400 },
      )
    }
    console.error('Service create error:', err)
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 })
  }
}
