/** Shared client-side types for the public website. */

export interface EnquiryFormData {
  fullName: string
  phone: string
  email: string
  projectType: string
  budget?: string
  location: string
  /** Project brief (stored in Booking.problem) */
  problem: string
  preferredDate: string
  preferredTime: string
  notes?: string
}

export interface FeedbackFormData {
  name: string
  rating: number
  message: string
}

export interface TestimonialData {
  id: number
  name: string
  rating: number
  message: string
  createdAt: string
}
