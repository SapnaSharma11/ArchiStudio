import { prisma } from '@/lib/prisma'
import { listCreate } from '@/lib/crud'
import { TipInput } from '@/lib/schemas'

export const dynamic = 'force-dynamic'

const h = listCreate(prisma.tip, TipInput, { publishable: true })
export const GET = h.GET
export const POST = h.POST
