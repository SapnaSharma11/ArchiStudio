import type { Config } from 'tailwindcss'

/**
 * Tailwind v4 reads its design tokens from the `@theme` block in
 * app/globals.css (ink, bronze, ivory, sand, line, muted, olive, …).
 * This file is kept only for editor tooling compatibility.
 */
const config: Config = {
  content: ['./components/**/*.{ts,tsx}', './app/**/*.{ts,tsx}'],
}
export default config
