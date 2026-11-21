/** Slow ticker of design principles (managed in Dashboard → Design Principles). */
export default function PrinciplesMarquee({ items }: { items: string[] }) {
  if (!items.length) return null
  const row = [...items, ...items]
  return (
    <section aria-label="Design principles" className="border-y border-line py-7 overflow-hidden bg-ivory">
      <div className="flex w-max animate-marquee motion-reduce:animate-none">
        {[0, 1].map((k) => (
          <ul key={k} aria-hidden={k === 1} className="flex shrink-0">
            {row.map((t, i) => (
              <li key={`${k}-${i}`} className="flex items-center display italic text-3xl sm:text-4xl text-ink/80 px-8 whitespace-nowrap">
                {t}
                <span className="ml-16 w-2 h-2 rotate-45 bg-bronze" aria-hidden />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </section>
  )
}
