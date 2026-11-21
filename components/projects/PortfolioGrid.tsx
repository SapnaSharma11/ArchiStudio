'use client'
import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import ProjectCard from '@/components/shared/ProjectCard'
import { PROJECT_CATEGORIES } from '@/lib/brand'
import type { PortfolioProject } from '@/lib/projects'
import { cn } from '@/utils/cn'

/** Aspect rhythm for the masonry columns — gives the grid its asymmetric cadence. */
const ASPECTS = ['aspect-[4/5]', 'aspect-[4/3]', 'aspect-[1/1]', 'aspect-[3/4]', 'aspect-[4/3]', 'aspect-[4/5]']

export default function PortfolioGrid({ projects, initial = 'all' }: { projects: PortfolioProject[]; initial?: string }) {
  const [filter, setFilter] = useState(initial)
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: projects.length }
    for (const p of projects) c[p.category] = (c[p.category] ?? 0) + 1
    return c
  }, [projects])
  const visible = filter === 'all' ? projects : projects.filter((p) => p.category === filter)
  const filters = [{ value: 'all', label: 'All' }, ...PROJECT_CATEGORIES]

  return (
    <div>
      <div role="tablist" aria-label="Filter projects by category" className="flex gap-2 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 pb-2 sm:flex-wrap">
        {filters.map((f) => {
          const active = filter === f.value
          const count = counts[f.value] ?? 0
          return (
            <button
              key={f.value}
              type="button"
              role="tab"
              aria-selected={active}
              disabled={!count}
              onClick={() => setFilter(f.value)}
              className={cn(
                'shrink-0 px-5 py-2.5 text-[11px] font-semibold tracking-[0.18em] uppercase border transition-colors duration-300 disabled:opacity-35 disabled:cursor-not-allowed',
                active ? 'bg-ink text-ivory border-ink' : 'border-stone text-ink hover:border-ink',
              )}
            >
              {f.label} <span className={cn('ml-1 tabular-nums', active ? 'text-bronze' : 'text-muted')}>{count}</span>
            </button>
          )
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={filter}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mt-12 columns-1 sm:columns-2 lg:columns-3 gap-8"
        >
          {visible.map((p, i) => (
            <div key={p.slug} className="break-inside-avoid mb-14">
              <ProjectCard project={p} aspect={ASPECTS[i % ASPECTS.length]} />
            </div>
          ))}
          {visible.length === 0 && <p className="text-muted py-20">No projects in this category yet.</p>}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
