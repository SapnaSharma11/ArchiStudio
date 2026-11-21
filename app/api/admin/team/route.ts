import { prisma } from '@/lib/prisma'
import { listCreate } from '@/lib/crud'
import { TeamMemberInput } from '@/lib/schemas'

export const dynamic = 'force-dynamic'

const h = listCreate(prisma.teamMember, TeamMemberInput, { publishable: true })
export const GET = h.GET
export const POST = h.POST
