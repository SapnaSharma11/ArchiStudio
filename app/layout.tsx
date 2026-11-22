import type { Metadata, Viewport } from 'next'
import { headers } from 'next/headers'
import { Outfit, Plus_Jakarta_Sans } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import WhatsAppButton from '@/components/layout/WhatsAppButton'
import MotionProvider from '@/components/site/MotionProvider'
import { BRAND } from '@/lib/brand'
import { SEO } from '@/lib/seo'
import { getStudio } from '@/lib/clinic'
import { getPublishedServices } from '@/lib/services'

// Type system: soft geometric Outfit for display, Plus Jakarta Sans for text and labels.
const display = Outfit({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500'],
  variable: '--font-display-src',
  display: 'swap',
})
const sans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans-src',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(BRAND.siteUrl),
  title: { default: SEO.default.title, template: `%s | ${BRAND.name}` },
  description: SEO.default.description,
  keywords: SEO.default.keywords,
  applicationName: BRAND.name,
  alternates: { canonical: '/' },
  openGraph: {
    title: SEO.default.title,
    description: SEO.default.description,
    siteName: BRAND.name,
    type: 'website',
    locale: BRAND.locale,
    images: [{ url: '/images/apn/residential-building-elevation.jpg', width: 1077, height: 1280, alt: BRAND.name }],
  },
  twitter: {
    card: 'summary_large_image',
    title: SEO.default.title,
    description: SEO.default.description,
    images: ['/images/apn/residential-building-elevation.jpg'],
  },
}

export const viewport: Viewport = {
  themeColor: '#252522',
}


export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') ?? ''
  const [studio, services] = await Promise.all([getStudio(), getPublishedServices()])
  // Hide the public navbar/footer on the email preview, login, and admin dashboard.
  const isChromeless =
    pathname.startsWith('/email-preview') || pathname.startsWith('/login') || pathname.startsWith('/dashboard')

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': ['ProfessionalService', 'LocalBusiness'],
    '@id': `${BRAND.siteUrl}/#studio`,
    name: studio.name,
    description: SEO.default.description,
    slogan: studio.tagline,
    url: BRAND.siteUrl,
    image: `${BRAND.siteUrl}/images/apn/residential-building-elevation.jpg`,
    email: studio.email || undefined,
    telephone: studio.phone || undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: studio.address.line1,
      addressLocality: studio.address.line2,
      addressRegion: studio.address.state,
      postalCode: studio.address.pincode,
      addressCountry: 'IN',
    },
    areaServed: 'IN',
    knowsAbout: services.map((s) => s.title),
    founder: studio.principal.name ? { '@type': 'Person', name: studio.principal.name, jobTitle: studio.principal.title } : undefined,
    openingHoursSpecification: studio.hours
      .filter((h) => !h.byAppointment && !h.closed && h.morningOpen)
      .map((h) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: h.day,
        opens: h.morningOpen,
        closes: h.eveningClose || h.morningClose,
      })),
    sameAs: Object.values(studio.socials ?? {}).filter((u) => /^https?:\/\/[^/]+\/.+/.test(u)),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Architecture & interior design services',
      itemListElement: services.map((s) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: s.title, url: `${BRAND.siteUrl}/services/${s.slug}` },
      })),
    },
  }

  return (
    <html lang="en-IN" data-scroll-behavior="smooth" className={`${display.variable} ${sans.variable}`}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <MotionProvider>
          {!isChromeless && <Navbar studio={studio} />}
          <main id="main">{children}</main>
          {!isChromeless && (
            <Footer studio={studio} services={services.slice(0, 7).map((s) => ({ slug: s.slug, title: s.title }))} />
          )}
          {!isChromeless && studio.whatsapp && <WhatsAppButton whatsapp={studio.whatsapp} />}
        </MotionProvider>
        <Toaster
          position="bottom-center"
          toastOptions={{
            duration: 4500,
            style: {
              borderRadius: '2px',
              background: '#252522',
              color: '#F5F3EE',
              fontSize: '14px',
              padding: '14px 18px',
            },
            success: { iconTheme: { primary: '#B49A7A', secondary: '#252522' } },
          }}
        />
      </body>
    </html>
  )
}
