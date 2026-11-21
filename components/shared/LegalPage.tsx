import PageHero from '@/components/shared/PageHero'

export default function LegalPage({
  title,
  lastUpdated,
  sections,
}: {
  title: string
  lastUpdated: string
  sections: { title: string; content: string }[]
}) {
  const updated = new Date(lastUpdated).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
  return (
    <>
      <PageHero label="Legal" title={title} intro={`Last updated ${updated}.`} crumbs={[{ label: title }]} />
      <section className="pb-24 sm:pb-32">
        <div className="container-x">
          <ol className="max-w-3xl border-t border-ink">
            {sections.map((s, i) => (
              <li key={s.title} className="grid gap-3 sm:grid-cols-12 py-8 border-b border-line">
                <span className="sm:col-span-2 text-[11px] tracking-[0.22em] text-bronze-deep font-semibold">{String(i + 1).padStart(2, '0')}</span>
                <div className="sm:col-span-10">
                  <h2 className="display text-2xl text-ink">{s.title}</h2>
                  <p className="mt-3 text-muted leading-relaxed">{s.content}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  )
}
