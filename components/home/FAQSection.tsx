import site from '@/data/site.json'

/** Frequently asked questions with FAQPage structured data. Uses native <details> — no JS. */
export default function FAQSection() {
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: site.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  }
  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <ul className="border-t border-line">
        {site.faq.map((f) => (
          <li key={f.q} className="border-b border-line">
            <details className="group py-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 display text-2xl text-ink [&::-webkit-details-marker]:hidden">
                {f.q}
                <span aria-hidden className="relative w-4 h-4 shrink-0">
                  <span className="absolute top-1/2 left-0 w-4 h-px bg-ink" />
                  <span className="absolute top-1/2 left-0 w-4 h-px bg-ink rotate-90 transition-transform duration-300 group-open:rotate-0" />
                </span>
              </summary>
              <p className="mt-4 text-muted leading-relaxed max-w-2xl">{f.a}</p>
            </details>
          </li>
        ))}
      </ul>
    </div>
  )
}
