import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import ListingMap from '../components/ListingMap'
import { StarRatingDisplay, StarRatingInput } from '@/components/StarRating'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import {
  MapPin,
  Pencil,
  Trash2,
  MessageSquare,
  AlertCircle,
  X,
  ChevronDown,
  ChevronUp,
  Users,
  BedDouble,
  Bath,
  Wifi,
  Car,
  Waves,
  Flame,
  Snowflake,
  Tv,
  UtensilsCrossed,
  WashingMachine,
  ArrowLeft,
} from 'lucide-react'

const amenityIcons = {
  WiFi: Wifi,
  'Free parking': Car,
  Pool: Waves,
  'Hot tub': Flame,
  'Air conditioning': Snowflake,
  Kitchen: UtensilsCrossed,
  'Smart TV': Tv,
  Washer: WashingMachine,
  'Beach access': Waves,
  Parking: Car,
  Fireplace: Flame,
  Garden: Waves,
  Elevator: Users,
}

export default function ListingDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [deletingReviewId, setDeletingReviewId] = useState(null)
  const [showFullDesc, setShowFullDesc] = useState(false)
  const [lightboxImg, setLightboxImg] = useState(null)

  useEffect(() => {
    let cancelled = false
    api.get(`/api/listings/${id}`).then((res) => {
      if (!cancelled) setListing(res.data)
    }).catch((err) => { if (!cancelled) setError(err.message) }).finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [id])

  const ownerId = listing?.owner?._id ?? listing?.owner
  const isOwner = listing && user && String(ownerId) === String(user._id)

  const images = listing?.images?.length
    ? listing.images
    : listing?.image?.url
      ? [listing.image.url]
      : []

  const handleDeleteListing = async () => {
    if (!window.confirm('Delete this listing?')) return
    try {
      await api.delete(`/api/listings/${id}`)
      navigate('/listings')
    } catch (err) {
      setError(err.message)
    }
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    setSubmittingReview(true)
    setError('')
    try {
      await api.post(`/api/listings/${id}/reviews`, { rating: reviewRating, comment: reviewComment })
      const res = await api.get(`/api/listings/${id}`)
      setListing(res.data)
      setReviewComment('')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmittingReview(false)
    }
  }

  const handleDeleteReview = async (reviewId) => {
    setDeletingReviewId(reviewId)
    try {
      await api.delete(`/api/listings/${id}/reviews/${reviewId}`)
      const res = await api.get(`/api/listings/${id}`)
      setListing(res.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setDeletingReviewId(null)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="aspect-video w-full animate-pulse rounded-2xl bg-muted" />
        <div className="mt-8 h-10 w-2/3 animate-pulse rounded-lg bg-muted" />
        <div className="mt-4 h-6 w-1/3 animate-pulse rounded bg-muted" />
      </div>
    )
  }
  if (error && !listing) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-8 lg:px-10">
        <Alert variant="destructive" className="text-base">
          <AlertCircle className="size-5" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }
  if (!listing) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-8 lg:px-10">
        <p className="text-xl text-muted-foreground">Listing not found.</p>
        <Button variant="link" className="mt-4 text-lg" onClick={() => navigate('/listings')}>
          Back to listings
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      {/* Lightbox */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/90 p-4"
          onClick={() => setLightboxImg(null)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Escape' && setLightboxImg(null)}
          aria-label="Close"
        >
          <Button variant="ghost" size="icon" className="absolute right-4 top-4 text-primary-foreground" onClick={() => setLightboxImg(null)}>
            <X className="size-5" />
          </Button>
          <img src={lightboxImg} alt="" className="max-h-[90vh] max-w-full rounded-lg object-contain" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="mx-auto mb-6 max-w-6xl px-4 text-base sm:px-6">
          <AlertCircle className="size-5" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link
          to="/listings"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to listings
        </Link>

        {/* Image gallery - stay-stylish style */}
        <div className="mb-8">
          {images.length > 0 ? (
            images.length === 1 ? (
              <button type="button" className="w-full overflow-hidden rounded-2xl" onClick={() => setLightboxImg(images[0])}>
                <img src={images[0]} alt={listing.title} className="aspect-video w-full object-cover transition-opacity hover:opacity-95" />
              </button>
            ) : (
              <div className="grid grid-cols-1 gap-2 overflow-hidden rounded-2xl md:grid-cols-4 md:h-[420px]">
                <button type="button" className="md:col-span-2 md:row-span-2" onClick={() => setLightboxImg(images[0])}>
                  <img src={images[0]} alt={listing.title} className="h-full w-full object-cover transition-opacity hover:opacity-95" />
                </button>
                {images.slice(1, 5).map((img, i) => (
                  <button key={i} type="button" className="hidden md:block" onClick={() => setLightboxImg(img)}>
                    <img src={img} alt="" className="h-full w-full object-cover transition-opacity hover:opacity-95" />
                  </button>
                ))}
              </div>
            )
          ) : (
            <div className="aspect-video w-full rounded-2xl bg-muted" />
          )}
        </div>

        <div className="flex flex-col gap-10 lg:flex-row">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">{listing.title}</h1>
                <p className="mt-1 flex items-center gap-1 text-muted-foreground">
                  <MapPin className="size-4" /> {listing.location}, {listing.country}
                </p>
                {(listing.guests != null || listing.bedrooms != null || listing.bathrooms != null) && (
                  <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {listing.guests != null && (
                      <span className="flex items-center gap-1"><Users className="size-4" /> {listing.guests} guests</span>
                    )}
                    {listing.bedrooms != null && (
                      <span className="flex items-center gap-1"><BedDouble className="size-4" /> {listing.bedrooms} bedrooms</span>
                    )}
                    {listing.bathrooms != null && (
                      <span className="flex items-center gap-1"><Bath className="size-4" /> {listing.bathrooms} baths</span>
                    )}
                  </div>
                )}
              </div>
              {isOwner && (
                <div className="flex flex-wrap gap-3">
                  <Link
                    to={`/listings/${id}/edit`}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-all duration-200 hover:opacity-90 active:scale-[0.98] gradient-primary border-0"
                  >
                    <Pencil className="size-4" />
                    Edit listing
                  </Link>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleDeleteListing}
                    className="gap-2 rounded-xl border-border"
                  >
                    <Trash2 className="size-4" />
                    Delete
                  </Button>
                </div>
              )}
            </div>

            <div className="my-8 border-t border-border" />

            {/* Host */}
            {listing.owner?.username && (
              <>
                <div className="flex items-center gap-4">
                  <div className="flex size-12 items-center justify-center rounded-full gradient-secondary text-lg font-bold text-secondary-foreground">
                    {(listing.owner.username || 'H').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold">Hosted by {listing.owner.username}</p>
                    {listing.superhost && <p className="text-sm text-muted-foreground">Superhost</p>}
                  </div>
                </div>
                <div className="my-6 border-t border-border" />
              </>
            )}

            {/* About */}
            <div>
              <h2 className="section-title">About this place</h2>
              <div className="section-title-accent" />
              <p className={cn('mt-3 leading-relaxed text-muted-foreground', !showFullDesc && 'line-clamp-4')}>
                {listing.description}
              </p>
              <Button variant="link" className="mt-1 h-auto p-0" onClick={() => setShowFullDesc(!showFullDesc)}>
                {showFullDesc ? <><ChevronUp className="mr-1 size-4" /> Show less</> : <><ChevronDown className="mr-1 size-4" /> Show more</>}
              </Button>
            </div>

            {/* Amenities */}
            {listing.amenities?.length > 0 && (
              <>
                <div className="my-6 border-t border-border" />
                <div>
                  <h2 className="section-title">Amenities</h2>
                  <div className="section-title-accent mb-4" />
                  <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
                    {listing.amenities.map((amenity) => {
                      const Icon = amenityIcons[amenity]
                      return (
                        <div key={amenity} className="flex items-center gap-3 rounded-xl bg-muted p-3">
                          {Icon ? <Icon className="size-5 text-primary" /> : <div className="size-5 rounded-full bg-primary/20" />}
                          <span className="text-sm font-medium">{amenity}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </>
            )}

            {/* Where you'll be */}
            {listing.geometry?.coordinates?.length === 2 && (
              <>
                <div className="my-6 border-t border-border" />
                <section>
                  <h2 className="section-title">Where you&apos;ll be</h2>
                  <div className="section-title-accent mb-4" />
                  <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                    <div className="h-[350px] w-full">
                      <ListingMap coordinates={listing.geometry.coordinates} />
                    </div>
                  </div>
                </section>
              </>
            )}

            {/* Reviews */}
            <div className="my-6 border-t border-border" />
            <section>
              <h2 className="section-title flex items-center gap-3">
                <MessageSquare className="size-6" />
                Reviews
                {listing.reviews?.length > 0 && (
                  <span className="rounded-full bg-muted px-3 py-0.5 text-base font-medium">{listing.reviews.length}</span>
                )}
              </h2>
              <div className="section-title-accent mb-4" />

              {isAuthenticated && (
                <Card className="mb-8 rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
                  <CardHeader>
                    <CardTitle className="text-xl">Add a review</CardTitle>
                    <p className="text-muted-foreground">Share your experience with others.</p>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmitReview} className="space-y-6">
                      <div className="space-y-3">
                        <Label className="text-base font-medium">Rating</Label>
                        <StarRatingInput value={reviewRating} onChange={setReviewRating} disabled={submittingReview} />
                        <p className="text-sm text-muted-foreground">{reviewRating} {reviewRating === 1 ? 'star' : 'stars'}</p>
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="comment" className="text-base font-medium">Comment</Label>
                        <Textarea
                          id="comment"
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder="What did you like? What could be better?"
                          required
                          rows={4}
                          className="min-h-24 rounded-xl text-base focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-colors"
                        />
                      </div>
                      <Button type="submit" size="lg" className="rounded-xl text-base gradient-primary text-primary-foreground border-0 shadow-sm hover:opacity-90 active:scale-[0.98] transition-all duration-200" disabled={submittingReview}>
                        {submittingReview ? 'Submitting...' : 'Submit review'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}

              {listing.reviews?.length ? (
                <div className="space-y-4">
                  {listing.reviews.map((rev) => (
                    <div key={rev._id} className="rounded-xl border border-border bg-card shadow-sm p-4">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="flex flex-wrap items-center gap-3">
                            <div className="flex size-9 items-center justify-center rounded-full gradient-primary text-sm font-bold text-primary-foreground">
                              {(rev.author?.username || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-semibold">{rev.author?.username ?? 'User'}</span>
                              <StarRatingDisplay rating={rev.rating} size="md" className="ml-2" />
                            </div>
                          </div>
                          <p className="text-muted-foreground">{rev.comment}</p>
                        </div>
                        {user && String(rev.author?._id ?? rev.author) === String(user._id) && (
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteReview(rev._id)} disabled={deletingReviewId === rev._id} className="shrink-0">
                            Delete
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border-2 border-dashed border-border bg-muted/20 py-16 text-center">
                  <p className="text-xl text-muted-foreground">No reviews yet. Be the first to leave one!</p>
                </div>
              )}
            </section>
          </div>

          {/* Sticky booking card */}
          <div className="lg:w-[380px] shrink-0">
            <div className="sticky top-24 rounded-2xl border border-border bg-card p-6 shadow-md">
              <div className="mb-4 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-foreground">${listing.price}</span>
                <span className="text-muted-foreground">/ night</span>
              </div>
              {listing.rating != null && (
                <p className="mb-4 flex items-center gap-1 text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">★ {listing.rating}</span>
                  {listing.reviews?.length != null && ` · ${listing.reviews.length} reviews`}
                </p>
              )}
              <Button className="w-full gap-2 rounded-xl py-6 text-base gradient-primary text-primary-foreground shadow-sm hover:opacity-90 active:scale-[0.98] transition-all duration-200 border-0" size="lg">
                Reserve
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
