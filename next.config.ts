import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    // Allow admin-uploaded media served from Cloudinary via next/image.
    remotePatterns: [{ protocol: 'https', hostname: 'res.cloudinary.com' }],
    formats: ['image/avif', 'image/webp'],
    qualities: [60, 75, 85],
  },
  async redirects() {
    return [
      // Public routes retired in the architecture rebrand.
      { source: '/book', destination: '/contact#consultation', permanent: true },
      { source: '/sessions', destination: '/journal#films', permanent: true },
      { source: '/workshops', destination: '/journal#talks', permanent: true },
      { source: '/events', destination: '/journal#news', permanent: true },
      // Dashboard modules renamed for the studio domain (API paths are unchanged).
      ...[
        ['appointments', 'enquiries'],
        ['clinic', 'settings'],
        ['profile', 'principal'],
        ['certifications', 'awards'],
        ['tips', 'principles'],
        ['sessions', 'films'],
        ['workshops', 'talks'],
        ['events', 'news'],
      ].map(([from, to]) => ({ source: `/dashboard/${from}`, destination: `/dashboard/${to}`, permanent: true })),
    ]
  },
}

export default nextConfig
