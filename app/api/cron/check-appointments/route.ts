import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPatientApology } from '@/lib/email'

// Called daily by Vercel Cron (see vercel.json). Finds enquiries still "New"
// whose preferred consultation date has passed and sends the client a polite
// follow-up email, then marks them `missed` ("Awaiting reply" in the dashboard).
export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()

  const expired = await prisma.booking.findMany({
    where: {
      status: 'pending',
      preferredDate: { lt: now },
    },
  })

  await Promise.all(
    expired.map(async (booking) => {
      await sendPatientApology({
        toEmail:       booking.email,
        fullName:      booking.fullName,
        preferredDate: booking.preferredDate.toISOString(),
        preferredTime: booking.preferredTime,
      })
      await prisma.booking.update({
        where: { id: booking.id },
        data: { status: 'missed' },
      })
    })
  )

  return NextResponse.json({ processed: expired.length })
}
