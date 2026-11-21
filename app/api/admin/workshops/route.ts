import { prisma } from '@/lib/prisma'
import { listCreate } from '@/lib/crud'
import { WorkshopInput } from '@/lib/schemas'

export const dynamic = 'force-dynamic'

const h = listCreate(prisma.workshop, WorkshopInput, { publishable: true })
export const GET = h.GET
export const POST = h.POST
