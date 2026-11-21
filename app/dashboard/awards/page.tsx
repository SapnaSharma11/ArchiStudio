import { prisma } from '@/lib/prisma'
import { serialize } from '@/lib/crud'
import AwardsManager from '@/components/dashboard/awards/AwardsManager'
import type { Item } from '@/components/dashboard/ResourceManager'

export const dynamic = 'force-dynamic'

export default async function Page() {
  let initial: Item[] = []
  try {
    initial = serialize(
      await prisma.certification.findMany({ orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }] }),
    ) as Item[]
  } catch {
    /* DB not ready */
  }
  return <AwardsManager initial={initial} />
}
