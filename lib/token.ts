import { createHmac } from 'crypto'

export function generateConfirmToken(bookingId: number): string {
  const secret = process.env.BOOKING_SECRET ?? 'dev-secret'
  return createHmac('sha256', secret).update(bookingId.toString()).digest('hex')
}

export function verifyConfirmToken(bookingId: number, token: string): boolean {
  return generateConfirmToken(bookingId) === token
}
