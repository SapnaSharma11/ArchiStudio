import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAdminApi } from '@/lib/auth'
import { ProfileInput } from '@/lib/schemas'

export const dynamic = 'force-dynamic'

export async function GET() {
  const denied = await requireAdminApi()
  if (denied) return denied
  const profile = await prisma.profile.findUnique({ where: { id: 1 } })
  return NextResponse.json(profile)
}

export async function PUT(req: NextRequest) {
  const denied = await requireAdminApi()
  if (denied) return denied
  try {
    const { socials, ...rest } = ProfileInput.parse(await req.json())
    // Prisma needs Prisma.JsonNull (not JS null) to clear a nullable Json column.
    const socialsValue = socials ?? Prisma.JsonNull
    const profile = await prisma.profile.upsert({
      where: { id: 1 },
      update: { ...rest, socials: socialsValue },
      create: { id: 1, ...rest, socials: socialsValue },
    })
    return NextResponse.json(profile)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues.map((e) => e.message).join(', ') }, { status: 400 })
    }
    console.error('Profile update error:', err)
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 })
  }
}
