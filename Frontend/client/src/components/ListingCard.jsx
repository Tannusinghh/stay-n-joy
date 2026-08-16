import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, MapPin, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ListingCard({ listing, showTax = false }) {
  const [imgIndex, setImgIndex] = useState(0)
  const images = listing.images?.length
    ? listing.images.map((i) => (typeof i === 'string' ? i : i?.url || i))
    : listing.image?.url
      ? [listing.image.url]
      : []

  return (
    <Link
      to={`/listings/${listing._id}`}
      className="group block"
    >
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
        {/* Image */}
        <div className="relative aspect-4/3 overflow-hidden rounded-t-2xl">
          {images[imgIndex] ? (
            <img
              src={images[imgIndex]}
              alt={listing.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="h-full w-full bg-muted" />
          )}
          {/* Image dots when multiple */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
              {images.slice(0, 4).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    setImgIndex(i)
                  }}
                  className={cn(
                    'h-1.5 w-1.5 rounded-full transition-all',
                    i === imgIndex ? 'w-3 bg-primary-foreground' : 'bg-primary-foreground/60'
                  )}
                  aria-label={`View image ${i + 1}`}
                />
              ))}
            </div>
          )}
          {/* Favorite placeholder - visual only, no context yet */}
          <div className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-card/80 backdrop-blur-sm transition-transform group-hover:scale-110">
            <Heart className="h-5 w-5 text-foreground" />
          </div>
          {/* Superhost-style badge if needed */}
          {listing.superhost && (
            <div className="absolute left-3 top-3 rounded-full bg-card/90 px-2 py-1 text-xs font-semibold text-foreground backdrop-blur-sm">
              Superhost
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex min-w-0 items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-display line-clamp-2 font-semibold text-foreground">
                {listing.title}
              </h3>
              <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="line-clamp-1">
                  {[listing.location, listing.country].filter(Boolean).join(', ')}
                </span>
              </p>
            </div>
            {listing.rating != null && (
              <div className="flex shrink-0 items-center gap-1">
                <Star className="h-4 w-4 fill-accent text-accent" />
                <span className="text-sm font-semibold">{listing.rating}</span>
              </div>
            )}
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-lg font-bold text-foreground">${listing.price}</span>
            <span className="text-sm text-muted-foreground">/ night</span>
            {showTax && (
              <span className="text-sm text-muted-foreground">+ taxes & fees</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
