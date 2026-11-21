import { prisma } from '@/lib/prisma'
import { serialize } from '@/lib/crud'
import NewsManager from '@/components/dashboard/news/NewsManager'
import type { Item } from '@/components/dashboard/ResourceManager'

export const dynamic = 'force-dynamic'

export default async function Page() {
  let initial: Item[] = []
  try {
    initial = serialize(
      await prisma.event.findMany({ orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }] }),
    ) as Item[]
  } catch {
    /* DB not ready */
  }
  return <NewsManager initial={initial} />
}
