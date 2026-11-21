import { prisma } from '@/lib/prisma'
import { item } from '@/lib/crud'
import { CertificationInput } from '@/lib/schemas'

export const dynamic = 'force-dynamic'

const h = item(prisma.certification, CertificationInput)
export const PUT = h.PUT
export const DELETE = h.DELETE
