'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import SectionHeading from '@/components/shared/SectionHeading'
import ProjectCard from '@/components/shared/ProjectCard'
import Slider from '@/components/shared/Slider'
import { labelOf, PROJECT_CATEGORIES } from '@/lib/brand'
import type { PortfolioProject } from '@/lib/projects'

// useLayoutEffect warns during SSR; fall back to useEffect on the server.
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

/** Panel widths for the pinned gallery — alternating wide / narrow rhythm. */
const WIDTHS = ['w-[46vw]', 'w-[30vw]', 'w-[38vw]', 'w-[30vw]', 'w-[46vw]', 'w-[34vw]']

function Intro() {
  return (
    <SectionHeading
      index="03"
      label="Selected work"
      title="Residences, workplaces and"
      accent="interiors."
      intro="A selection of recent projects across India — each shaped by its site, its climate and the people it is built for."
    />
  )
}

/** Desktop: the section pins while vertical scroll drives a horizontal track. */
function PinnedGallery({ projects }: { projects: PortfolioProject[] }) {
  const section = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const [distance, setDistance] = useState(0)

  useIsoLayoutEffect(() => {
    const measure = () => {
      if (track.current) setDistance(Math.max(0, track.current.scrollWidth - window.innerWidth))
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (track.current) ro.observe(track.current)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [])

  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end end'] })
  const smooth = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 })
  const x = useTransform(smooth, [0, 1], [0, -distance])

  return (
    <section ref={section} aria-label="Selected work" className="relative" style={{ height: `calc(100vh + ${distance}px)` }}>
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col justify-center pt-20">
        <motion.div ref={track} style={{ x }} className="slider-pad flex items-center gap-10 w-max will-change-transform">
          <div className="w-[30vw] max-w-[30rem] shrink-0 pr-6">
            <Intro />
            <p className="mt-10 text-[11px] tracking-[0.22em] uppercase text-muted flex items-center gap-3">
              Scroll to explore <ArrowRight size={14} />
            </p>
          </div>

          {projects.map((p, i) => (
            <Link key={p.slug} href={`/projects/${p.slug}`} className={`group shrink-0 ${WIDTHS[i % WIDTHS.length]}`}>
              <div className={`img-zoom relative overflow-hidden bg-sand ${i % 2 === 0 ? 'h-[56vh]' : 'h-[64vh]'}`}>
                {p.coverImage && (
                  <Image
                    src={p.coverImage}
                    alt={`${p.title}, ${labelOf(PROJECT_CATEGORIES, p.category).toLowerCase()} project in ${p.location ?? 'India'}`}
                    fill
                    sizes="46vw"
                    className="object-cover"
                  />
                )}
                <span className="absolute right-5 top-5 w-11 h-11 rounded-full bg-ivory text-ink flex items-center justify-center opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                  <ArrowUpRight size={16} />
                </span>
                <span aria-hidden className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink/45 to-transparent" />
                <span className="absolute left-5 bottom-5 display text-7xl text-white leading-none">{String(i + 1).padStart(2, '0')}</span>
              </div>
              <div className="mt-5 flex items-start justify-between gap-6">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.22em] uppercase text-bronze-deep">
                    {labelOf(PROJECT_CATEGORIES, p.category)}{p.year ? ` · ${p.year}` : ''}
                  </p>
                  <h3 className="display text-3xl xl:text-4xl text-ink mt-2 group-hover:text-bronze-deep transition-colors">{p.title}</h3>
                </div>
                {p.location && <p className="text-xs text-muted text-right pt-1 shrink-0">{p.location}</p>}
              </div>
            </Link>
          ))}

          <Link href="/projects" className="group shrink-0 w-[24vw] h-[56vh] bg-ink text-ivory flex flex-col justify-between p-10">
            <span className="eyebrow !text-bronze">Portfolio</span>
            <span>
              <span className="display block text-5xl leading-tight">View all<br /><em className="italic text-bronze">projects</em></span>
              <span className="mt-8 w-12 h-12 rounded-full border border-white/30 flex items-center justify-center transition-colors group-hover:bg-ivory group-hover:text-ink">
                <ArrowRight size={18} />
              </span>
            </span>
          </Link>
        </motion.div>

        <div className="container-x mt-10">
          <div className="relative h-px bg-stone" aria-hidden>
            <motion.div className="absolute inset-y-0 left-0 right-0 bg-ink origin-left" style={{ scaleX: smooth }} />
          </div>
        </div>
      </div>
    </section>
  )
}

/** Mobile / tablet / reduced motion: native swipe slider. */
function SlideGallery({ projects }: { projects: PortfolioProject[] }) {
  return (
    <section className="py-24 sm:py-32 overflow-hidden">
      <div className="container-x flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
        <Intro />
        <Link href="/projects" className="btn btn-dark shrink-0 self-start lg:self-auto">
          View all projects <ArrowRight size={15} className="btn-arrow" />
        </Link>
      </div>
      <div className="mt-14">
        <Slider label="Selected projects" slideClassName="w-[84vw] sm:w-[60vw] lg:w-[44vw]">
          {projects.map((p, i) => (
            <ProjectCard
              key={p.slug}
              project={p}
              aspect={i % 2 === 0 ? 'aspect-[4/3]' : 'aspect-[4/5]'}
              sizes="(min-width: 1024px) 44vw, (min-width: 640px) 60vw, 84vw"
            />
          ))}
        </Slider>
      </div>
    </section>
  )
}

export default function FeaturedProjects({ projects }: { projects: PortfolioProject[] }) {
  const reduce = useReducedMotion()
  const [desktop, setDesktop] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px) and (min-height: 640px)')
    const on = () => setDesktop(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])

  if (!projects.length) return null
  return desktop && !reduce ? <PinnedGallery projects={projects} /> : <SlideGallery projects={projects} />
}
