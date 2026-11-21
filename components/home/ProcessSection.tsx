'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import SectionHeading from '@/components/shared/SectionHeading'
import site from '@/data/site.json'
import { cn } from '@/utils/cn'

const STEP_MS = 6500
const ease = [0.22, 1, 0.36, 1] as const

/**
 * Interactive process: a large photograph for the active stage on the left,
 * an expanding stage list on the right. Auto-advances while in view (paused on
 * hover/focus, disabled for reduced motion); click any stage to jump to it.
 */
export default function ProcessSection({ index = '05' }: { index?: string | null }) {
  const steps = site.process
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const [touched, setTouched] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { margin: '-20% 0px' })
  const reduce = useReducedMotion()
  const autoplay = inView && !paused && !touched && !reduce

  useEffect(() => {
    if (!autoplay) return
    const t = setTimeout(() => setActive((a) => (a + 1) % steps.length), STEP_MS)
    return () => clearTimeout(t)
  }, [autoplay, active, steps.length])

  const step = steps[active]
  const select = (i: number) => {
    setTouched(true)
    setActive(i)
  }

  return (
    <section id="process" className="relative py-24 sm:py-32 lg:py-40 scroll-mt-20 bg-sand/60 overflow-hidden">
      {/* faint drafting grid */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.35] pointer-events-none [background-image:linear-gradient(var(--color-stone)_1px,transparent_1px),linear-gradient(90deg,var(--color-stone)_1px,transparent_1px)] [background-size:88px_88px] [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)]"
      />
      <div className="relative container-x">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
          <SectionHeading
            index={index ?? undefined}
            label="Our process"
            title="A clear path from"
            accent="idea to handover."
            intro="Five stages, each with defined deliverables and sign-off — so you always know what happens next, and why."
          />
          <p className="hidden lg:block text-right text-xs tracking-[0.18em] uppercase text-muted shrink-0">
            Typical house · <span className="text-ink">14 – 24 months</span>
          </p>
        </div>

        <div
          ref={ref}
          className="mt-16 lg:mt-20 grid gap-10 lg:grid-cols-12 lg:gap-16"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          {/* Visual */}
          <div className="lg:col-span-7">
            <div className="relative aspect-[4/3] lg:aspect-[5/4] overflow-hidden bg-ink lg:sticky lg:top-28">
              <AnimatePresence initial={false}>
                <motion.div
                  key={active}
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: 1.06 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.1, ease }}
                >
                  <Image src={step.image} alt={step.alt} fill sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
                </motion.div>
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" aria-hidden />

              <div className="absolute left-0 right-0 bottom-0 p-6 sm:p-10 text-ivory flex items-end justify-between gap-6">
                <div>
                  <p className="text-[10px] tracking-[0.24em] uppercase text-bronze-soft">Stage {String(active + 1).padStart(2, '0')} / {String(steps.length).padStart(2, '0')}</p>
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={active}
                      className="display text-4xl sm:text-5xl mt-3"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.5, ease }}
                    >
                      {step.title}
                    </motion.p>
                  </AnimatePresence>
                </div>
                <p className="hidden sm:block text-right shrink-0">
                  <span className="block text-[10px] tracking-[0.24em] uppercase text-ivory/60">Duration</span>
                  <span className="block mt-1 text-sm">{step.duration}</span>
                </p>
              </div>
              <span aria-hidden className="absolute top-6 right-6 display text-[7rem] sm:text-[9rem] leading-none text-ivory/15 select-none">
                {String(active + 1).padStart(2, '0')}
              </span>
            </div>
          </div>

          {/* Stage list */}
          <ol className="lg:col-span-5 relative" aria-label="Project stages">
            <span aria-hidden className="absolute left-[11px] top-3 bottom-3 w-px bg-stone" />
            {steps.map((s, i) => {
              const isActive = i === active
              const done = i < active
              return (
                <li key={s.title} className="relative pl-12 pb-2">
                  <span
                    aria-hidden
                    className={cn(
                      'absolute left-0 top-[22px] w-[23px] h-[23px] rotate-45 border transition-colors duration-500 flex items-center justify-center',
                      isActive ? 'bg-ink border-ink' : done ? 'bg-bronze border-bronze' : 'bg-ivory border-stone',
                    )}
                  >
                    <span className={cn('w-1.5 h-1.5', isActive ? 'bg-bronze' : 'bg-transparent')} />
                  </span>
                  <button
                    type="button"
                    onClick={() => select(i)}
                    aria-expanded={isActive}
                    aria-controls={`stage-${i}`}
                    className="w-full text-left py-4 flex items-baseline gap-4 group"
                  >
                    <span className={cn('text-[11px] tracking-[0.22em] font-semibold tabular-nums transition-colors', isActive ? 'text-bronze-deep' : 'text-muted')}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className={cn('display text-[1.9rem] sm:text-4xl transition-colors duration-500', isActive ? 'text-ink' : 'text-ink/45 group-hover:text-ink/80')}>
                      {s.title}
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isActive && (
                      <motion.div
                        id={`stage-${i}`}
                        key="body"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.6, ease }}
                        className="overflow-hidden"
                      >
                        <div className="pb-8 pl-9">
                          <p className="text-muted leading-relaxed">{s.text}</p>
                          <ul className="mt-5 grid sm:grid-cols-2 gap-x-6 gap-y-2.5">
                            {s.deliverables.map((d) => (
                              <li key={d} className="flex items-center gap-2.5 text-sm text-ink">
                                <span aria-hidden className="w-3 h-px bg-bronze-deep" /> {d}
                              </li>
                            ))}
                          </ul>
                          <p className="mt-5 text-[10px] tracking-[0.22em] uppercase text-bronze-deep font-semibold sm:hidden">{s.duration}</p>
                          {/* autoplay progress */}
                          <div className="mt-6 h-px bg-stone overflow-hidden" aria-hidden>
                            {autoplay && (
                              <motion.div
                                key={`p-${active}`}
                                className="h-full bg-ink origin-left"
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ duration: STEP_MS / 1000, ease: 'linear' }}
                              />
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              )
            })}
            <li className="pl-12 pt-4">
              <Link href="/contact#consultation" className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] uppercase text-ink link-draw pb-1">
                Start with a discovery call <ArrowRight size={14} />
              </Link>
            </li>
          </ol>
        </div>
      </div>
    </section>
  )
}
