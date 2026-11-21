import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import SectionHeading from '@/components/shared/SectionHeading'
import ServiceCard from '@/components/shared/ServiceCard'
import FadeIn from '@/components/shared/FadeIn'
import type { PublicService } from '@/lib/services'

export default function ServicesOverview({ services }: { services: PublicService[] }) {
  if (!services.length) return null
  return (
    <section className="py-24 sm:py-32 bg-surface">
      <div className="container-x">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
          <SectionHeading
            index="02"
            label="Services"
            title="From first sketch to"
            accent="final detail."
            intro="A complete architecture and interiors practice — design, drawings, visualisation and supervision under one roof."
          />
          <FadeIn>
            <Link href="/services" className="btn btn-outline text-ink shrink-0">
              All services <ArrowRight size={15} className="btn-arrow" />
            </Link>
          </FadeIn>
        </div>
        <div className="mt-16 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <FadeIn key={s.slug} delay={(i % 3) * 0.08}>
              <ServiceCard service={s} index={i} />
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
