'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion'
import { ArrowRight, Compass, FileText, HardHat, Layers, Mouse, PencilRuler, type LucideIcon } from 'lucide-react'
import SectionHeading from '@/components/shared/SectionHeading'
import FadeIn from '@/components/shared/FadeIn'
import site from '@/data/site.json'
import { cn } from '@/utils/cn'

const ease = [0.22, 1, 0.36, 1] as const
/** Scroll distance (in viewport heights) spent on each stage while pinned. */
const VH_PER_STEP = 70

const ICONS: Record<string, LucideIcon> = {
  compass: Compass,
  pencil: PencilRuler,
  layers: Layers,
  file: FileText,
  hardhat: HardHat,
}

type Step = (typeof site.process)[number]

function StageIcon({ name, active, size = 'md' }: { name: string; active: boolean; size?: 'md' | 'lg' }) {
  const Icon = ICONS[name] ?? Compass
  return (
    <span
      aria-hidden
      className={cn(
        'rounded-full flex items-center justify-center shrink-0 transition-colors duration-500',
        size === 'lg' ? 'w-14 h-14' : 'w-12 h-12',
        active ? 'bg-bronze text-ink' : 'bg-surface text-muted',
      )}
    >
      <Icon size={size === 'lg' ? 22 : 20} strokeWidth={1.5} />
    </span>
  )
}

function Deliverables({ items }: { items: string[] }) {
  return (
    <span className="mt-4 flex flex-wrap gap-2">
      {items.map((d) => (
        <span key={d} className="px-3.5 py-1.5 rounded-full border border-stone text-[0.82rem] text-ink">
          {d}
        </span>
      ))}
    </span>
  )
}

/**
 * Desktop: the section pins and scrolling moves through the stages. A soft
 * timeline of round icons on the left (the active stage opens into a rounded
 * card); a rounded photograph with a frosted caption on the right.
 */
function PinnedProcess({ steps }: { steps: Step[] }) {
  const section = useRef<HTMLElement>(null)
  const [active, setActive] = useState(0)
  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end end'] })

  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    const i = Math.min(steps.length - 1, Math.max(0, Math.floor(p * steps.length)))
    if (i !== active) setActive(i)
  })

  const jump = (i: number) => {
    const el = section.current
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY
    const range = el.offsetHeight - window.innerHeight
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: top + ((i + 0.5) / steps.length) * range, behavior: reduce ? 'auto' : 'smooth' })
  }

  const step = steps[active]

  return (
    <section
      ref={section}
      className="relative hidden lg:block bg-sand/60"
      style={{ height: `${100 + steps.length * VH_PER_STEP}vh` }}
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="container-x h-full pt-28 pb-10 grid grid-cols-12 gap-14 items-center">
          {/* Left: heading + soft timeline */}
          <div className="col-span-5 flex flex-col justify-center h-full">
            <SectionHeading label="Our process" title="A clear path from" accent="idea to handover." />

            <ol className="relative mt-9" aria-label="Project stages">
              {/* soft rail behind the icons, filling with scroll */}
              <span aria-hidden className="absolute left-[22px] top-6 bottom-6 w-[3px] rounded-full bg-stone/70" />
              <motion.span
                aria-hidden
                className="absolute left-[22px] top-6 bottom-6 w-[3px] rounded-full bg-bronze origin-top"
                style={{ scaleY: scrollYProgress }}
              />
              {steps.map((s, i) => {
                const isActive = i === active
                return (
                  <li key={s.title} className="relative">
                    <button
                      type="button"
                      onClick={() => jump(i)}
                      aria-current={isActive ? 'step' : undefined}
                      className={cn('w-full text-left flex gap-4 transition-all duration-500', isActive ? 'py-3' : 'py-1.5')}
                    >
                      <span className="rounded-full ring-[6px] ring-[#efece6]">
                        <StageIcon name={s.icon} active={isActive || i < active} />
                      </span>
                      <span className="min-w-0 pt-2.5">
                        <span
                          className={cn(
                            'block display transition-colors duration-500',
                            isActive ? 'text-ink text-[1.65rem] xl:text-3xl' : 'text-ink/45 text-xl xl:text-[1.4rem]',
                          )}
                        >
                          {s.title}
                        </span>
                        <AnimatePresence initial={false}>
                          {isActive && (
                            <motion.span
                              key="body"
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.5, ease }}
                              className="block overflow-hidden"
                            >
                              <span className="block mt-2 text-muted leading-relaxed text-[0.95rem]">{s.text}</span>
                              <Deliverables items={s.deliverables} />
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ol>

            <div className="mt-7 flex flex-wrap items-center gap-3 text-sm text-muted">
              <span className="inline-flex items-center gap-2">
                <Mouse size={16} strokeWidth={1.5} /> Scroll to move through the stages
              </span>
              <span className="px-3 py-1 rounded-full bg-surface text-ink text-[0.82rem]">Typical house · 14 – 24 months</span>
            </div>
          </div>

          {/* Right: rounded photograph with a frosted caption */}
          <div className="col-span-7 h-full max-h-[78vh] self-center">
            <div className="relative h-full overflow-hidden rounded-[32px] bg-ink">
              <AnimatePresence initial={false}>
                <motion.div
                  key={active}
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1, ease }}
                >
                  <Image src={step.image} alt={step.alt} fill sizes="58vw" className="object-cover" />
                </motion.div>
              </AnimatePresence>
              <div className="absolute inset-x-5 bottom-5 rounded-[24px] bg-white/80 backdrop-blur-md p-3 pl-4 flex items-center justify-between gap-6">
                <div className="flex items-center gap-4 min-w-0">
                  <StageIcon name={step.icon} active size="lg" />
                  <div className="min-w-0">
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={active}
                        className="display text-2xl text-ink truncate"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.4, ease }}
                      >
                        {step.title}
                      </motion.p>
                    </AnimatePresence>
                    <p className="text-sm text-muted">{step.duration}</p>
                  </div>
                </div>
                <Link href="/contact#consultation" className="btn btn-dark shrink-0">
                  Start a project <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/** Mobile / tablet: soft stacked cards — normal scrolling reveals them. */
function StackedProcess({ steps }: { steps: Step[] }) {
  return (
    <section className="lg:hidden py-24 sm:py-32 bg-sand/60">
      <div className="container-x">
        <SectionHeading
          label="Our process"
          title="A clear path from"
          accent="idea to handover."
          intro="Five stages, each with clear deliverables and sign-off — so you always know what happens next, and why."
        />
        <ol className="mt-12 space-y-5">
          {steps.map((s) => (
            <FadeIn as="li" key={s.title} className="bg-surface rounded-[26px] p-3 pb-6">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[20px]">
                <Image src={s.image} alt={s.alt} fill sizes="(min-width: 640px) 90vw, 100vw" className="object-cover" />
                <span className="absolute left-3 bottom-3 px-3 py-1.5 rounded-full bg-white/85 backdrop-blur text-[0.8rem] text-ink">
                  {s.duration}
                </span>
              </div>
              <div className="px-3 pt-5 flex items-center gap-4">
                <StageIcon name={s.icon} active />
                <h3 className="display text-2xl sm:text-3xl text-ink">{s.title}</h3>
              </div>
              <p className="px-3 mt-3 text-muted leading-relaxed">{s.text}</p>
              <div className="px-3">
                <Deliverables items={s.deliverables} />
              </div>
            </FadeIn>
          ))}
        </ol>
        <Link href="/contact#consultation" className="btn btn-dark mt-10">
          Start with a discovery call <ArrowRight size={15} />
        </Link>
      </div>
    </section>
  )
}

export default function ProcessSection(props: { index?: string | null }) {
  void props
  const steps = site.process
  return (
    <>
      {/* anchor target for "/#process" that works at every breakpoint */}
      <span id="process" aria-hidden className="block" />
      <PinnedProcess steps={steps} />
      <StackedProcess steps={steps} />
    </>
  )
}
