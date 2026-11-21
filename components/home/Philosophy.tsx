import Image from 'next/image'
import SectionHeading from '@/components/shared/SectionHeading'
import FadeIn from '@/components/shared/FadeIn'
import site from '@/data/site.json'

export default function Philosophy({ index = '04' }: { index?: string | null }) {
  return (
    <section className="relative bg-ink text-ivory py-24 sm:py-32 lg:py-40 overflow-hidden">
      <Image
        src="/images/arche/house-black-detail.jpg"
        alt=""
        fill
        sizes="100vw"
        className="object-cover opacity-[0.12]"
        aria-hidden
      />
      <div className="relative container-x grid gap-16 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionHeading
            tone="dark"
            index={index ?? undefined}
            label="Design philosophy"
            title="Fewer gestures,"
            accent="made well."
            intro="Four ideas guide every project we take on — whether a family home, a headquarters or a single room."
          />
        </div>
        <ol className="lg:col-span-7 grid sm:grid-cols-2 gap-x-10">
          {site.philosophy.map((p, i) => (
            <FadeIn as="li" key={p.title} delay={i * 0.08} className="border-t border-white/15 pt-7 pb-10">
              <span className="text-[11px] tracking-[0.22em] text-bronze font-semibold">0{i + 1}</span>
              <h3 className="display text-3xl mt-3">{p.title}</h3>
              <p className="mt-4 text-ivory/65 leading-relaxed text-sm sm:text-base">{p.text}</p>
            </FadeIn>
          ))}
        </ol>
      </div>
    </section>
  )
}
