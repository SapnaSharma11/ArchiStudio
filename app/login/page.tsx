import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { BRAND } from '@/lib/brand'
import LoginForm from './LoginForm'

export const metadata: Metadata = {
  title: { absolute: `Studio Login | ${BRAND.name}` },
  robots: { index: false, follow: false },
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ from?: string }> }) {
  // Already signed in → go straight to the dashboard.
  if (await getSession()) redirect('/dashboard')
  const { from } = await searchParams
  return <LoginForm from={from} />
}
