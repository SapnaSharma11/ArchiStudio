import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, Play } from 'lucide-react'
import BackgroundVideo from '@/components/shared/BackgroundVideo'
import { isVideo } from '@/lib/video'
import { labelOf, PROJECT_CATEGORIES } from '@/lib/brand'
import type { PortfolioProject } from '@/lib/projects'
import { cn } from '@/utils/cn'

/**
 * Portfolio card: image with slow zoom on hover, then category · year,
 * serif title and location. `aspect` lets grids create asymmetric rhythm.
 */
export default function ProjectCard({
  project,
  aspect = 'aspect-[4/5]',
  sizes = '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw',
  large,
}: {
  project: Pick<PortfolioProject, 'slug' | 'title' | 'category' | 'location' | 'year' | 'coverImage'> & { gallery?: string[] }
  aspect?: string
  sizes?: string
  large?: boolean
}) {
  const films = (project.gallery ?? []).filter(isVideo)
  return (
    <Link href={`/projects/${project.slug}`} className="group block" aria-label={`${project.title} — view project`}>
      <div className={cn('img-zoom relative overflow-hidden bg-sand', aspect)}>
        {project.coverImage && (
          <Image
            src={project.coverImage}
            alt={`${project.title}, ${labelOf(PROJECT_CATEGORIES, project.category).toLowerCase()} project in ${project.location ?? 'India'}`}
            fill
            sizes={sizes}
            className="object-cover"
          />
        )}
        {films[0] && <BackgroundVideo src={films[0]} poster={project.coverImage ?? undefined} />}
        {films.length > 0 && (
          <span className="absolute left-4 bottom-4 inline-flex items-center gap-1.5 rounded-full bg-ink/60 backdrop-blur px-3 py-1.5 text-[11px] text-ivory">
            <Play size={11} fill="currentColor" strokeWidth={0} /> {films.length} {films.length === 1 ? 'film' : 'films'}
          </span>
        )}
        <span className="absolute inset-0 bg-ink/0 group-hover:bg-ink/15 transition-colors duration-700" />
        <span className="absolute right-4 top-4 w-10 h-10 rounded-full bg-ivory text-ink flex items-center justify-center opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
          <ArrowUpRight size={16} />
        </span>
      </div>
      <div className="mt-5 flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] font-medium tracking-[0.22em] uppercase text-bronze-deep">
            {labelOf(PROJECT_CATEGORIES, project.category)}
            {project.year ? ` · ${project.year}` : ''}
          </p>
          <h3 className={cn('display mt-2 text-ink', large ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-[1.75rem]')}>
            {project.title}
          </h3>
        </div>
        {project.location && <p className="text-xs text-muted text-right shrink-0 pt-1">{project.location}</p>}
      </div>
    </Link>
  )
}
