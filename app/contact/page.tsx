import type { Metadata } from 'next'
import { ArrowUpRight } from 'lucide-react'
import { getStudio, type HoursEntry } from '@/lib/clinic'
import { pageMeta, SEO } from '@/lib/seo'
import PageHero from '@/components/shared/PageHero'
import FadeIn from '@/components/shared/FadeIn'
import ConsultationForm from '@/components/shared/ConsultationForm'
import SectionHeading from '@/components/shared/SectionHeading'
import FAQSection from '@/components/home/FAQSection'

export const metadata: Metadata = pageMeta({
  title: SEO.contact.title,
  description: SEO.contact.description,
  path: '/contact',
})

export const dynamic = 'force-dynamic'

function formatHours(h: HoursEntry): string {
  if (h.byAppointment) return 'By appointment'
  if (h.closed) return 'Closed'
  const slots: string[] = []
  if (h.morningOpen && h.morningClose) slots.push(`${h.morningOpen} – ${h.morningClose}`)
  if (h.eveningOpen && h.eveningClose) slots.push(`${h.eveningOpen} – ${h.eveningClose}`)
  return slots.length ? slots.join(', ') : 'Closed'
}

export default async function ContactPage() {
  const studio = await getStudio()
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(studio.address.full)}`

  return (
    <>
      <PageHero
        label="Contact"
        title="Let's talk about"
        accent="your project."
        intro="Whether you have a site, a set of drawings or just an idea, the first conversation is where good projects begin."
        crumbs={[{ label: 'Contact' }]}
      />

      <section id="consultation" className="scroll-mt-24 pb-24 sm:pb-32">
        <div className="container-x grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <FadeIn className="bg-surface border border-line p-6 sm:p-10 lg:p-12">
              <h2 className="display text-4xl text-ink">Request a consultation</h2>
              <p className="mt-3 text-muted leading-relaxed max-w-xl">
                Share a few details and a preferred time. Your first design consultation is free and takes around 45 minutes — at the office, on site
                or online.
              </p>
              <div className="mt-10">
                <ConsultationForm />
              </div>
            </FadeIn>
          </div>

          <aside className="lg:col-span-5 space-y-12">
            <FadeIn delay={0.1}>
              <h2 className="eyebrow">The office</h2>
              <address className="not-italic mt-5 display text-3xl text-ink leading-snug">{studio.address.full}</address>
              <a href={mapsLink} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 text-[0.95rem] font-medium text-ink link-draw pb-1">
                Get directions <ArrowUpRight size={13} />
              </a>
            </FadeIn>
            <FadeIn delay={0.15} className="grid sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-8 border-t border-line pt-8">
              {studio.email && (
                <div>
                  <h3 className="font-mono text-[10px] tracking-[0.22em] uppercase text-muted">Email</h3>
                  <a href={`mailto:${studio.email}`} className="mt-2 block text-ink break-all link-draw">{studio.email}</a>
                </div>
              )}
              {studio.phone && (
                <div>
                  <h3 className="font-mono text-[10px] tracking-[0.22em] uppercase text-muted">Phone</h3>
                  <a href={`tel:${studio.phone.replace(/\s/g, '')}`} className="mt-2 block text-ink link-draw">{studio.phone}</a>
                </div>
              )}
            </FadeIn>
            {studio.hours.length > 0 && (
              <FadeIn delay={0.2} className="border-t border-line pt-8">
                <h3 className="font-mono text-[10px] tracking-[0.22em] uppercase text-muted">Office hours</h3>
                <dl className="mt-4 text-sm">
                  {studio.hours.map((h) => (
                    <div key={h.day} className="flex justify-between gap-6 py-2 border-b border-line/70">
                      <dt className="text-ink">{h.day}</dt>
                      <dd className="text-muted text-right">{formatHours(h)}</dd>
                    </div>
                  ))}
                </dl>
              </FadeIn>
            )}
          </aside>
        </div>
      </section>

      {studio.mapsEmbedUrl && (
        <section aria-label="Office location map" className="container-x pb-24 sm:pb-32">
          <div className="relative aspect-[4/3] sm:aspect-[21/9] bg-sand overflow-hidden border border-line">
            <iframe
              src={studio.mapsEmbedUrl}
              title={`Map showing ${studio.name}`}
              className="absolute inset-0 w-full h-full grayscale contrast-[0.95]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </section>
      )}

      <section className="py-24 sm:py-32 bg-surface">
        <div className="container-x grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHeading label="Before we meet" title="Frequently" accent="asked." />
          </div>
          <div className="lg:col-span-8">
            <FAQSection />
          </div>
        </div>
      </section>
    </>
  )
}
