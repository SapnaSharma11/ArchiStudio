import { prisma } from '@/lib/prisma'
import { serialize } from '@/lib/crud'
import FilmsManager from '@/components/dashboard/films/FilmsManager'
import type { Item } from '@/components/dashboard/ResourceManager'

export const dynamic = 'force-dynamic'

export default async function Page() {
  let initial: Item[] = []
  try {
    initial = serialize(
      await prisma.session.findMany({ orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }] }),
    ) as Item[]
  } catch {
    /* DB not ready */
  }
  return <FilmsManager initial={initial} />
}
