import { prisma } from '@/lib/prisma'
import { listCreate } from '@/lib/crud'
import { CertificationInput } from '@/lib/schemas'

export const dynamic = 'force-dynamic'

const h = listCreate(prisma.certification, CertificationInput)
export const GET = h.GET
export const POST = h.POST
