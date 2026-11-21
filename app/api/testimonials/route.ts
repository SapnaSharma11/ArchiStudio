import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const TestimonialSchema = z.object({
  name:    z.string().min(2, 'Name must be at least 2 characters'),
  rating:  z.coerce.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  message: z.string().min(10, 'Review must be at least 10 characters').max(500, 'Review cannot exceed 500 characters'),
})

export async function GET() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where:   { approved: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(testimonials)
  } catch (err) {
    console.error('Testimonials GET error:', err)
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = TestimonialSchema.parse(body)

    await prisma.testimonial.create({
      data: {
        name:     data.name,
        rating:   data.rating,
        message:  data.message,
        approved: true,
      },
    })

    return NextResponse.json(
      { success: true, message: 'Thank you for your feedback! Your review is now live.' },
      { status: 201 }
    )
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, errors: err.issues.map((e: z.core.$ZodIssue) => e.message) },
        { status: 400 }
      )
    }
    console.error('Testimonial POST error:', err)
    return NextResponse.json(
      { success: false, message: 'Server error. Please try again.' },
      { status: 500 }
    )
  }
}
