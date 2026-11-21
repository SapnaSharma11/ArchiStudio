import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { notifyOwnerNewBooking } from '@/lib/email'
import { EnquiryInput } from '@/lib/schemas'

/**
 * Public consultation request / project enquiry. Stored in the `Booking` table
 * (name kept for compatibility — see prisma/schema.prisma).
 */
export async function POST(req: NextRequest) {
  try {
    const data = EnquiryInput.parse(await req.json())

    const booking = await prisma.booking.create({
      data: {
        fullName: data.fullName,
        phone: data.phone,
        email: data.email,
        age: data.age ?? null,
        gender: data.gender ?? null,
        problem: data.problem,
        preferredDate: new Date(data.preferredDate),
        preferredTime: data.preferredTime,
        notes: data.notes,
        projectType: data.projectType ?? null,
        budget: data.budget ?? null,
        location: data.location ?? null,
        status: 'pending',
      },
    })

    void notifyOwnerNewBooking(booking.id, {
      fullName: data.fullName,
      phone: data.phone,
      email: data.email,
      projectType: data.projectType,
      budget: data.budget,
      location: data.location,
      problem: data.problem,
      preferredDate: data.preferredDate,
      preferredTime: data.preferredTime,
      notes: data.notes,
    })

    return NextResponse.json({ success: true, id: booking.id }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, errors: err.issues.map((e: z.core.$ZodIssue) => e.message) },
        { status: 400 },
      )
    }
    console.error('Enquiry error:', err)
    return NextResponse.json({ success: false, message: 'Server error. Please try again.' }, { status: 500 })
  }
}
