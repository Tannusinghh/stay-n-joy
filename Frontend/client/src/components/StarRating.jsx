import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Display-only star rating (1-5). */
export function StarRatingDisplay({ rating, size = 'md', className }) {
  const sizeClass = size === 'lg' ? 'size-6' : size === 'sm' ? 'size-4' : 'size-5'
  return (
    <div className={cn('flex items-center gap-0.5', className)} role="img" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            sizeClass,
            star <= rating ? 'fill-amber-400 text-amber-500' : 'text-gray-200'
          )}
        />
      ))}
    </div>
  )
}

/** Interactive star rating input for review form (1-5). */
export function StarRatingInput({ value, onChange, disabled, className }) {
  const sizeClass = 'size-8 sm:size-10'
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onClick={() => onChange(star)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              onChange(star)
            }
          }}
          className={cn(
            'rounded p-0.5 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50',
            star <= value ? 'text-amber-500' : 'text-gray-200 hover:text-amber-200'
          )}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
        >
          <Star className={cn(sizeClass, star <= value && 'fill-amber-400')} />
        </button>
      ))}
    </div>
  )
}
