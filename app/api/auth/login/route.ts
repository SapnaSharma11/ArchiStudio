import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { checkPassword, createSession } from '@/lib/auth'

const LoginSchema = z.object({
  password: z.string().min(1, 'Password is required'),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { password } = LoginSchema.parse(body)

    if (!checkPassword(password)) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
    }

    await createSession()
    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? 'Invalid request' }, { status: 400 })
    }
    console.error('Login error:', err)
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 })
  }
}
