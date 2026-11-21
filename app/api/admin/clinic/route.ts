import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAdminApi } from '@/lib/auth'
import { ClinicInput } from '@/lib/schemas'

export const dynamic = 'force-dynamic'

export async function GET() {
  const denied = await requireAdminApi()
  if (denied) return denied
  const settings = await prisma.clinicSettings.findUnique({ where: { id: 1 } })
  return NextResponse.json(settings)
}

export async function PUT(req: NextRequest) {
  const denied = await requireAdminApi()
  if (denied) return denied
  try {
    const { socials, hours, stats, ...rest } = ClinicInput.parse(await req.json())
    const payload = {
      ...rest,
      hours: hours as unknown as Prisma.InputJsonValue,
      stats: stats as unknown as Prisma.InputJsonValue,
      socials: socials ?? Prisma.JsonNull,
    }
    const settings = await prisma.clinicSettings.upsert({
      where: { id: 1 },
      update: payload,
      create: { id: 1, ...payload },
    })
    return NextResponse.json(settings)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues.map((e) => e.message).join(', ') }, { status: 400 })
    }
    console.error('Clinic settings update error:', err)
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 })
  }
}
