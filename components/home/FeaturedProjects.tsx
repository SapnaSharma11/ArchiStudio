import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import SectionHeading from '@/components/shared/SectionHeading'
import ProjectCard from '@/components/shared/ProjectCard'
import FadeIn from '@/components/shared/FadeIn'
import type { PortfolioProject } from '@/lib/projects'

/**
 * Asymmetric editorial grid: a large/small rhythm that alternates sides, with
 * staggered vertical offsets so the page reads like a magazine spread.
 */
const LAYOUT = [
  { col: 'lg:col-span-7', aspect: 'aspect-[4/3]', offset: '', large: true },
  { col: 'lg:col-span-5', aspect: 'aspect-[4/5]', offset: 'lg:mt-40', large: false },
  { col: 'lg:col-span-5', aspect: 'aspect-[4/5]', offset: '', large: false },
  { col: 'lg:col-span-7', aspect: 'aspect-[4/3]', offset: 'lg:mt-24', large: true },
  { col: 'lg:col-span-8 lg:col-start-3', aspect: 'aspect-[16/9]', offset: '', large: true },
]

export default function FeaturedProjects({ projects }: { projects: PortfolioProject[] }) {
  if (!projects.length) return null
  return (
    <section className="py-24 sm:py-32 lg:py-40">
      <div className="container-x">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
          <SectionHeading
            index="03"
            label="Selected work"
            title="Residences, workplaces and"
            accent="interiors."
            intro="A selection of recent projects across India — each shaped by its site, its climate and the people it is built for."
          />
          <FadeIn>
            <Link href="/projects" className="btn btn-dark shrink-0">
              View all projects <ArrowRight size={15} className="btn-arrow" />
            </Link>
          </FadeIn>
        </div>
        <div className="mt-16 lg:mt-24 grid gap-x-10 gap-y-16 sm:grid-cols-2 lg:grid-cols-12">
          {projects.slice(0, LAYOUT.length).map((p, i) => {
            const l = LAYOUT[i]
            return (
              <FadeIn key={p.slug} className={`${l.col} ${l.offset} ${i === 4 ? 'sm:col-span-2' : ''}`}>
                <ProjectCard
                  project={p}
                  aspect={l.aspect}
                  large={l.large}
                  sizes={l.large ? '(min-width: 1024px) 58vw, 100vw' : '(min-width: 1024px) 40vw, (min-width: 640px) 50vw, 100vw'}
                />
              </FadeIn>
            )
          })}
        </div>
      </div>
    </section>
  )
}
