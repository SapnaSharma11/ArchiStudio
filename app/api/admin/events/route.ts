import { prisma } from '@/lib/prisma'
import { listCreate } from '@/lib/crud'
import { EventInput } from '@/lib/schemas'

export const dynamic = 'force-dynamic'

const h = listCreate(prisma.event, EventInput, { publishable: true })
export const GET = h.GET
export const POST = h.POST
