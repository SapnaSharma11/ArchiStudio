'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowDown, ArrowRight, ArrowUpRight } from 'lucide-react'
import type { StudioData } from '@/lib/clinic'
import { BRAND } from '@/lib/brand'
import BackgroundVideo from '@/components/shared/BackgroundVideo'

type Featured = { slug: string; title: string; location: string | null; year: number | null } | null

const ease = [0.22, 1, 0.36, 1] as const

export default function HeroSection({ studio, featured }: { studio: StudioData; featured: Featured }) {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  // Subtle parallax: the photograph drifts slower than the page.
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '18%'])
  // Wide screens: sharp photo behind, the site film at native size in a card.
  // Phones/tablets (portrait, like the film): the film fills the background.
  const [wide, setWide] = useState<boolean | null>(null)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1280px)')
    const on = () => setWide(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  const film = studio.heroVideoUrl

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
          <Image
            src={studio.heroImageUrl}
            alt="Apartment building designed by APN Enterprises, with grey cladding, timber accents and warm façade lighting"
            fill
            preload
            fetchPriority="high"
            sizes="100vw"
            quality={85}
            className="object-cover object-[center_40%]"
          />
          {film && wide === false && (
            <BackgroundVideo src={film} poster={studio.heroVideoPoster || undefined} eager />
          )}
        </motion.div>
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/25 to-ink/35" aria-hidden />

      <div className="relative h-full container-x flex items-end gap-14 pb-24 sm:pb-28">
        <div className="flex-1 min-w-0">
        <motion.p
          className="eyebrow !text-white/80"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.9, ease }}
        >
          {studio.principal.name}, Architect · {studio.name}
        </motion.p>
        <h1 className="display mt-6 font-extralight text-[2.9rem] leading-[1.02] sm:text-6xl lg:text-[5.4rem] xl:text-[5.2rem] 2xl:text-[6rem] max-w-6xl">
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
            Building, structural and architectural design for homes and businesses across Delhi — calm, practical
            spaces that work beautifully and age with grace.
            <span className="mt-4 flex items-center gap-2 text-sm text-white/90">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur px-3 py-1">
                <span aria-hidden className="text-[#f1c96b]">★</span> {BRAND.rating.value} on {BRAND.rating.source} · {BRAND.rating.count} reviews
              </span>
            </span>
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/projects" className="btn btn-light">
              Explore Projects <ArrowRight size={15} className="btn-arrow" />
            </Link>
            <Link href="/contact#consultation" className="btn btn-outline-light">
              Free Consultation
            </Link>
          </div>
        </motion.div>
        </div>

        {film && wide && (
          <motion.figure
            className="shrink-0 w-[250px] 2xl:w-[290px]"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: 1.1, ease }}
          >
            <div className="relative aspect-[9/16] overflow-hidden rounded-[28px] ring-1 ring-white/25 shadow-2xl shadow-black/40 bg-ink">
              <BackgroundVideo src={film} poster={studio.heroVideoPoster || undefined} eager />
            </div>
            <figcaption className="mt-3 flex items-center gap-2 text-xs text-white/75">
              <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-[#e0605a] motion-safe:animate-pulse" />
              On site · recent APN Enterprises work
            </figcaption>
          </motion.figure>
        )}
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
