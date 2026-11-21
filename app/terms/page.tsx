import type { Metadata } from 'next'
import legal from '@/data/legal.json'
import { BRAND } from '@/lib/brand'
import { pageMeta } from '@/lib/seo'
import LegalPage from '@/components/shared/LegalPage'

export const metadata: Metadata = pageMeta({
  title: 'Terms of Use',
  description: `Terms of use for the ${BRAND.name} website.`,
  path: '/terms',
})

export default function TermsPage() {
  return <LegalPage title="Terms of Use" lastUpdated={legal.terms.lastUpdated} sections={legal.terms.sections} />
}
