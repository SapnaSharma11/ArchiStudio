import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyConfirmToken } from '@/lib/token'
import { sendPatientConfirmation } from '@/lib/email'
import { BRAND } from '@/lib/brand'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const bookingId = parseInt(id, 10)
  const token = req.nextUrl.searchParams.get('token') ?? ''

  if (!verifyConfirmToken(bookingId, token)) {
    return html('Invalid Link', 'This confirmation link is invalid or has expired.', false)
  }

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } })

  if (!booking) {
    return html('Not Found', 'Booking not found.', false)
  }

  if (booking.status === 'confirmed') {
    return html(
      'Already Confirmed',
      `${booking.fullName}'s consultation was already confirmed.`,
      true
    )
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: 'confirmed' },
  })

  void sendPatientConfirmation({
    toEmail:       booking.email,
    fullName:      booking.fullName,
    preferredDate: booking.preferredDate.toISOString(),
    preferredTime: booking.preferredTime,
  })

  return html(
    'Consultation confirmed',
    `${booking.fullName}'s consultation is booked. A confirmation has been sent to ${booking.email}.`,
    true
  )
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function html(title: string, message: string, success: boolean): NextResponse {
  const color = success ? '#5F6347' : '#9A3B2E'
  const icon = success ? '✓' : '✕'
  const page = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="robots" content="noindex"/>
<title>${esc(title)} · ${esc(BRAND.name)}</title></head>
<body style="font-family:Helvetica,Arial,sans-serif;display:flex;align-items:center;justify-content:center;
             min-height:100vh;margin:0;background:#F5F3EE;color:#242424">
  <div style="text-align:center;max-width:440px;padding:48px 28px;background:#fff;border:1px solid #E4DFD6">
    <div style="font-size:11px;letter-spacing:.24em;color:#7A6347;text-transform:uppercase">${esc(BRAND.name)}</div>
    <div style="font-size:40px;color:${color};margin-top:18px">${icon}</div>
    <h1 style="font-family:Georgia,serif;font-weight:400;color:#252522;margin:12px 0 10px">${esc(title)}</h1>
    <p style="color:#77736D;margin:0;line-height:1.7">${esc(message)}</p>
  </div>
</body>
</html>`
  return new NextResponse(page, {
    headers: { 'Content-Type': 'text/html' },
  })
}
