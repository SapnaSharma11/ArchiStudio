import { prisma } from '@/lib/prisma'
import TestimonialsManager, { type TestimonialDTO } from '@/components/dashboard/testimonials/TestimonialsManager'

export const dynamic = 'force-dynamic'

export default async function Page() {
  let initial: TestimonialDTO[] = []
  try {
    const rows = await prisma.testimonial.findMany({ orderBy: { createdAt: 'desc' } })
    initial = rows.map((t) => ({
      id: t.id,
      name: t.name,
      rating: t.rating,
      message: t.message,
      approved: t.approved,
      createdAt: t.createdAt.toISOString(),
    }))
  } catch {
    /* DB not ready */
  }
  return <TestimonialsManager initial={initial} />
}
