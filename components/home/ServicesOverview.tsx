import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import SectionHeading from '@/components/shared/SectionHeading'
import ServiceCard from '@/components/shared/ServiceCard'
import FadeIn from '@/components/shared/FadeIn'
import Slider from '@/components/shared/Slider'
import type { PublicService } from '@/lib/services'

export default function ServicesOverview({ services }: { services: PublicService[] }) {
  if (!services.length) return null
  return (
    <section className="py-24 sm:py-32 bg-surface overflow-hidden">
      <div className="container-x flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
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
      <FadeIn className="mt-14">
        <Slider label="Services" slideClassName="w-[80vw] sm:w-[44vw] lg:w-[29vw] xl:w-[26rem]">
          {services.map((s, i) => (
            <ServiceCard key={s.slug} service={s} index={i} />
          ))}
        </Slider>
      </FadeIn>
    </section>
  )
}
