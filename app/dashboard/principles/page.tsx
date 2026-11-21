import { prisma } from '@/lib/prisma'
import { serialize } from '@/lib/crud'
import PrinciplesManager from '@/components/dashboard/principles/PrinciplesManager'
import type { Item } from '@/components/dashboard/ResourceManager'

export const dynamic = 'force-dynamic'

export default async function Page() {
  let initial: Item[] = []
  try {
    initial = serialize(
      await prisma.tip.findMany({ orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }] }),
    ) as Item[]
  } catch {
    /* DB not ready */
  }
  return <PrinciplesManager initial={initial} />
}
