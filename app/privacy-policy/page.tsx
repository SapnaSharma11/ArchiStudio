import type { Metadata } from 'next'
import legal from '@/data/legal.json'
import { BRAND } from '@/lib/brand'
import { pageMeta } from '@/lib/seo'
import LegalPage from '@/components/shared/LegalPage'

export const metadata: Metadata = pageMeta({
  title: 'Privacy Policy',
  description: `How ${BRAND.name} collects, uses and protects the information you share with us.`,
  path: '/privacy-policy',
})

export default function PrivacyPage() {
  return <LegalPage title="Privacy Policy" lastUpdated={legal.privacy.lastUpdated} sections={legal.privacy.sections} />
}
