import { prisma } from '@/lib/prisma'
import { serialize } from '@/lib/crud'
import TeamManager from '@/components/dashboard/team/TeamManager'
import type { Item } from '@/components/dashboard/ResourceManager'

export const dynamic = 'force-dynamic'

export default async function Page() {
  let initial: Item[] = []
  try {
    initial = serialize(
      await prisma.teamMember.findMany({ orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }] }),
    ) as Item[]
  } catch {
    /* DB not ready */
  }
  return <TeamManager initial={initial} />
}
