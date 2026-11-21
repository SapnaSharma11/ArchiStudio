import { prisma } from '@/lib/prisma'
import { serialize } from '@/lib/crud'
import TalksManager from '@/components/dashboard/talks/TalksManager'
import type { Item } from '@/components/dashboard/ResourceManager'

export const dynamic = 'force-dynamic'

export default async function Page() {
  let initial: Item[] = []
  try {
    initial = serialize(
      await prisma.workshop.findMany({ orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }] }),
    ) as Item[]
  } catch {
    /* DB not ready */
  }
  return <TalksManager initial={initial} />
}
