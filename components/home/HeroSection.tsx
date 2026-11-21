'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowDown, ArrowRight, ArrowUpRight } from 'lucide-react'
import type { StudioData } from '@/lib/clinic'

type Featured = { slug: string; title: string; location: string | null; year: number | null } | null

const ease = [0.22, 1, 0.36, 1] as const

export default function HeroSection({ studio, featured }: { studio: StudioData; featured: Featured }) {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  // Subtle parallax: the photograph drifts slower than the page.
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '18%'])

  return (
    <section ref={ref} className="relative h-[100svh] min-h-[620px] overflow-hidden bg-ink text-white">
      <motion.div
        className="absolute inset-0"
        style={{ y }}
        initial={{ clipPath: 'inset(0 0 100% 0)' }}
        animate={{ clipPath: 'inset(0 0 0% 0)' }}
        transition={{ duration: 1.4, ease }}
      >
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.15 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2.4, ease }}
        >
          {studio.heroVideoUrl ? (
            <video
              className="absolute inset-0 w-full h-full object-cover"
              src={studio.heroVideoUrl}
              poster={studio.heroImageUrl}
              autoPlay
              muted
              loop
              playsInline
              aria-hidden
            />
          ) : (
            <Image
              src={studio.heroImageUrl}
              alt="Contemporary residence at dusk with timber cladding and full-height glazing opening onto a lawn"
              fill
              preload
              fetchPriority="high"
              sizes="100vw"
              quality={85}
              className="object-cover"
            />
          )}
        </motion.div>
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/25 to-ink/35" aria-hidden />

      <div className="relative h-full container-x flex flex-col justify-end pb-24 sm:pb-28">
        <motion.p
          className="eyebrow !text-white/80"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.9, ease }}
        >
          {studio.name} — {studio.fullName}
        </motion.p>
        <h1 className="display mt-6 uppercase text-[2.1rem] leading-[1.08] tracking-[0.03em] sm:text-[3.2rem] lg:text-[4rem] xl:text-[4.4rem]">
          {['Spaces That Inspire.', 'Architecture That Lasts.'].map((line, i) => (
            <span key={line} className="block overflow-hidden pb-[0.08em]">
              <motion.span
                className="block"
                initial={{ y: '105%' }}
                animate={{ y: 0 }}
                transition={{ delay: 1 + i * 0.15, duration: 1.1, ease }}
              >
                {i === 1 ? (
                  <>
                    <em className="not-italic text-bronze-soft">Architecture</em> That Lasts.
                  </>
                ) : (
                  line
                )}
              </motion.span>
            </span>
          ))}
        </h1>
        <motion.div
          className="mt-8 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.45, duration: 0.9, ease }}
        >
          <p className="max-w-lg text-base sm:text-lg text-white/80 leading-relaxed">
            We design homes, workplaces and interiors that feel calm, work beautifully and age with grace — from first
            sketch to the final detail on site.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/projects" className="btn btn-light">
              Explore Projects <ArrowRight size={15} className="btn-arrow" />
            </Link>
            <Link href="/contact#consultation" className="btn btn-outline-light">
              Book a Consultation
            </Link>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-0 inset-x-0 border-t border-white/15">
        <div className="font-mono container-x h-14 flex items-center justify-between text-[10px] tracking-[0.22em] uppercase text-white/70">
          <a href="#studio" className="flex items-center gap-2 hover:text-white">
            <ArrowDown size={13} className="motion-safe:animate-bounce" /> Scroll
          </a>
          {featured && (
            <Link href={`/projects/${featured.slug}`} className="hidden sm:flex items-center gap-2 hover:text-white">
              Featured — {featured.title}
              {featured.location ? ` · ${featured.location.split(',')[0]}` : ''}
              {featured.year ? ` · ${featured.year}` : ''}
              <ArrowUpRight size={13} />
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}
