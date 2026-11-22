export type Film = { id: number; title: string; videoUrl: string | null; image: string | null; sessionType: string | null }

/** Grid of short site / interiors videos (Dashboard → Films). Videos load only when played. */
export default function FilmGrid({ films }: { films: Film[] }) {
  return (
    <ul className="grid gap-x-5 gap-y-10 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
      {films.map((f) => (
        <li key={f.id}>
          <div className="relative aspect-[9/16] overflow-hidden rounded-media bg-ink">
            {f.videoUrl ? (
              <video
                src={f.videoUrl}
                poster={f.image ?? undefined}
                controls
                playsInline
                preload="none"
                className="absolute inset-0 w-full h-full object-cover"
                aria-label={f.title}
              />
            ) : null}
          </div>
          {f.sessionType && <p className="mt-3 text-xs text-bronze-deep">{f.sessionType}</p>}
          <h3 className="display text-lg sm:text-xl text-ink mt-1 leading-snug">{f.title}</h3>
        </li>
      ))}
    </ul>
  )
}
