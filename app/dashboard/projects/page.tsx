import { prisma } from '@/lib/prisma'
import { serialize } from '@/lib/crud'
import ProjectsManager from '@/components/dashboard/projects/ProjectsManager'
import type { Item } from '@/components/dashboard/ResourceManager'

export const dynamic = 'force-dynamic'

export default async function Page() {
  let initial: Item[] = []
  try {
    initial = serialize(
      await prisma.project.findMany({ orderBy: [{ displayOrder: 'asc' }, { updatedAt: 'desc' }] }),
    ) as Item[]
  } catch {
    /* DB not ready */
  }
  return <ProjectsManager initial={initial} />
}
