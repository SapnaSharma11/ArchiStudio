import { prisma } from '@/lib/prisma'
import { serialize } from '@/lib/crud'
import GalleryManager, { type GalleryDTO } from '@/components/dashboard/gallery/GalleryManager'

export const dynamic = 'force-dynamic'

export default async function Page() {
  let initial: GalleryDTO[] = []
  try {
    initial = serialize(
      await prisma.galleryItem.findMany({ orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }] }),
    ) as unknown as GalleryDTO[]
  } catch {
    /* DB not ready */
  }
  return <GalleryManager initial={initial} />
}
