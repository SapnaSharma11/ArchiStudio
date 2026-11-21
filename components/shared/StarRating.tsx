'use client'
import { Star } from 'lucide-react'

interface Props {
  rating: number
  max?: number
  size?: number
  interactive?: boolean
  onChange?: (rating: number) => void
}

export default function StarRating({ rating, max = 5, size = 16, interactive = false, onChange }: Props) {
  if (!interactive) {
    return (
      <div className="flex items-center gap-0.5" role="img" aria-label={`${rating} out of ${max}`}>
        {Array.from({ length: max }).map((_, i) => (
          <Star key={i} size={size} strokeWidth={1.25} className={i < rating ? 'fill-bronze text-bronze' : 'text-stone'} />
        ))}
      </div>
    )
  }
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
      {Array.from({ length: max }).map((_, i) => (
        <button
          key={i}
          type="button"
          role="radio"
          aria-checked={rating === i + 1}
          aria-label={`${i + 1} star${i ? 's' : ''}`}
          onClick={() => onChange?.(i + 1)}
          className="p-0.5"
        >
          <Star size={size} strokeWidth={1.25} className={i < rating ? 'fill-bronze text-bronze' : 'text-stone hover:text-bronze'} />
        </button>
      ))}
    </div>
  )
}
