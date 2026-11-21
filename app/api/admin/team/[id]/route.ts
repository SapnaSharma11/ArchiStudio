import { prisma } from '@/lib/prisma'
import { item } from '@/lib/crud'
import { TeamMemberInput } from '@/lib/schemas'

export const dynamic = 'force-dynamic'

const h = item(prisma.teamMember, TeamMemberInput, { publishable: true })
export const PUT = h.PUT
export const PATCH = h.PATCH
export const DELETE = h.DELETE
