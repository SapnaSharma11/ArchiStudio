import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { buildClientConfirmationEmail, buildFollowUpEmail, buildOwnerEnquiryEmail } from '@/lib/email'

export const metadata: Metadata = { title: 'Email preview', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

const sample = {
  fullName: 'Aditi Kulkarni',
  phone: '+91 98XXX XXXXX',
  email: 'aditi@example.com',
  projectType: 'Residential — new build',
  budget: '₹2 – 5 crore',
  location: 'Pune, Maharashtra',
  problem: 'A G+2 family home on a 3,600 sq ft corner plot. We would like a private courtyard, a rooftop garden and plenty of daylight.',
  preferredDate: new Date(Date.now() + 3 * 86400000).toISOString(),
  preferredTime: '11:30 AM',
}

/**
 * Renders the live email templates from lib/email.ts with sample data.
 * Available in development, or to a signed-in admin in production.
 */
export default async function EmailPreviewPage() {
  if (process.env.NODE_ENV === 'production' && !(await getSession())) notFound()

  const emails = [
    { label: 'Studio — new enquiry notification', mail: buildOwnerEnquiryEmail(sample, '#confirm') },
    { label: 'Client — consultation confirmed', mail: buildClientConfirmationEmail(sample) },
    { label: 'Client — follow-up (unconfirmed request)', mail: buildFollowUpEmail(sample) },
  ]

  return (
    <div className="min-h-screen bg-sand py-12 px-4">
      <div className="max-w-[640px] mx-auto space-y-14">
        <h1 className="display text-4xl text-ink">Email templates</h1>
        {emails.map(({ label, mail }) => (
          <section key={label}>
            <p className="eyebrow">{label}</p>
            <p className="text-sm text-muted mt-1 mb-4">Subject: {mail.subject}</p>
            <div className="bg-white" dangerouslySetInnerHTML={{ __html: mail.html }} />
          </section>
        ))}
      </div>
    </div>
  )
}
