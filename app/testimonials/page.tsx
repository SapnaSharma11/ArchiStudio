import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { pageMeta, SEO } from '@/lib/seo'
import PageHero from '@/components/shared/PageHero'
import FadeIn from '@/components/shared/FadeIn'
import StarRating from '@/components/shared/StarRating'
import FeedbackForm from '@/components/shared/FeedbackForm'

export const metadata: Metadata = pageMeta({ title: SEO.testimonials.title, description: SEO.testimonials.description, path: '/testimonials' })

// Reads approved testimonials live from the DB at request time.
export const dynamic = 'force-dynamic'

async function getTestimonials() {
  try {
    return await prisma.testimonial.findMany({ where: { approved: true }, orderBy: { createdAt: 'desc' } })
  } catch {
    return []
  }
}

export default async function TestimonialsPage() {
  const testimonials = await getTestimonials()
  return (
    <>
      <PageHero
        label="Client stories"
        title="In our clients'"
        accent="words."
        intro="Homeowners, developers and business owners on what it was like to design and build with the studio."
        crumbs={[{ label: 'Client stories' }]}
      />
      <section className="pb-24 sm:pb-32">
        <div className="container-x grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-7">
            {testimonials.length === 0 ? (
              <p className="text-muted border-t border-line pt-10">Client stories will appear here soon.</p>
            ) : (
              <ul className="border-t border-ink">
                {testimonials.map((t, i) => {
                  const [name, project] = t.name.split(/\s+[—–-]\s+/)
                  return (
                    <FadeIn as="li" key={t.id} delay={Math.min(i, 4) * 0.05} className="py-10 border-b border-line">
                      <figure>
                        <StarRating rating={t.rating} size={14} />
                        <blockquote className="display text-2xl sm:text-3xl text-ink leading-snug mt-5">&ldquo;{t.message}&rdquo;</blockquote>
                        <figcaption className="mt-5 text-sm">
                          <span className="font-semibold text-ink">{name}</span>
                          {project && <span className="text-muted"> — {project}</span>}
                        </figcaption>
                      </figure>
                    </FadeIn>
                  )
                })}
              </ul>
            )}
          </div>
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <FeedbackForm />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
