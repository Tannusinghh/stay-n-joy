import { useState, useRef, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'
import api from '../api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import ItineraryMap from '../components/ItineraryMap'
import ListingCard from '../components/ListingCard'
import { cn } from '@/lib/utils'
import {
  MapPin,
  Calendar,
  Wallet,
  AlertCircle,
  Sun,
  Map,
  Sparkles,
  Clock,
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Utensils,
  PartyPopper,
  Landmark,
  TreePine,
  Mountain,
  ShoppingBag,
  Camera,
  Waves,
  Minus,
  Plus,
  Eye,
  Home,
} from 'lucide-react'

const BUDGET_OPTIONS = ['Budget', 'Medium', 'Luxury']

const INTEREST_CHIPS = [
  { id: 'food', label: 'Food & Dining', icon: Utensils },
  { id: 'nightlife', label: 'Nightlife', icon: PartyPopper },
  { id: 'culture', label: 'Culture & History', icon: Landmark },
  { id: 'nature', label: 'Nature', icon: TreePine },
  { id: 'adventure', label: 'Adventure', icon: Mountain },
  { id: 'shopping', label: 'Shopping', icon: ShoppingBag },
  { id: 'photography', label: 'Photography', icon: Camera },
  { id: 'beach', label: 'Beach & Water', icon: Waves },
]

const PROGRESS_STEPS = [
  { key: 'searching', label: 'Searching real places', icon: Search },
  { key: 'generating', label: 'Building your itinerary', icon: Sparkles },
  { key: 'mapping', label: 'Mapping your route', icon: Map },
]

export default function PlanTrip() {
  const [destination, setDestination] = useState('')
  const [days, setDays] = useState(3)
  const [budget, setBudget] = useState('Medium')
  const [selectedInterests, setSelectedInterests] = useState([])
  const [customInterest, setCustomInterest] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [progressStep, setProgressStep] = useState(null)
  const [activeDay, setActiveDay] = useState(0)

  const mapRef = useRef(null)

  const toggleInterest = (id) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const interestsString = () => {
    const chips = selectedInterests.map(
      (id) => INTEREST_CHIPS.find((c) => c.id === id)?.label || id
    )
    if (customInterest.trim()) chips.push(customInterest.trim())
    return chips.join(', ') || ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!destination.trim()) {
      setError('Please enter a destination.')
      return
    }
    setError('')
    setResult(null)
    setLoading(true)
    setActiveDay(0)

    setProgressStep('searching')
    const t1 = setTimeout(() => setProgressStep('generating'), 3000)
    const t2 = setTimeout(() => setProgressStep('mapping'), 8000)

    try {
      const res = await api.post('/api/ai/itinerary', {
        destination: destination.trim(),
        days: Number(days) || 3,
        budget: budget || 'Medium',
        interests: interestsString() || undefined,
      })
      setResult(res)
      setProgressStep(null)
    } catch (err) {
      setError(err.message || 'Failed to generate itinerary')
      setProgressStep(null)
    } finally {
      clearTimeout(t1)
      clearTimeout(t2)
      setLoading(false)
    }
  }

  let normalized = result
  if (result?.itineraryText && typeof result.itineraryText === 'string') {
    try {
      const firstBrace = result.itineraryText.trim().indexOf('{')
      const jsonStr =
        firstBrace >= 0
          ? result.itineraryText.trim().slice(firstBrace)
          : result.itineraryText.trim()
      const parsed = JSON.parse(jsonStr)
      if (parsed?.days && Array.isArray(parsed.days) && parsed.days.length > 0) {
        normalized = {
          summary: parsed.summary ?? '',
          days: parsed.days,
          locations: result.locations || [],
          suggestedListings: result.suggestedListings || [],
        }
      }
    } catch (_) {
      /* keep normalized as result */
    }
  }

  const hasStructured =
    normalized?.summary != null &&
    Array.isArray(normalized?.days) &&
    normalized.days.length > 0
  const locations = normalized?.locations || []
  const displaySummary = normalized?.summary
  const displayDays = normalized?.days || []
  const displayItineraryText = hasStructured ? null : normalized?.itineraryText
  const suggestedListings = normalized?.suggestedListings || []

  const mapLocations = (locations || [])
    .filter((l) => l?.lat != null && l?.lng != null)
    .map((l) => ({ ...l, dayNumber: l.dayNumber ?? l.order ?? 0 }))
  const totalStops = hasStructured
    ? displayDays.reduce(
        (n, day) => n + (day.activities || []).filter((a) => a?.location).length,
        0
      )
    : (locations || []).length
  const hasMap = mapLocations.length > 0
  const someUnmapped = hasStructured && totalStops > 0 && mapLocations.length < totalStops

  const handleFlyTo = useCallback(
    (locationName) => {
      const loc = mapLocations.find(
        (l) => l.name && l.name.toLowerCase() === locationName.toLowerCase()
      )
      if (loc && mapRef.current?.flyTo) {
        mapRef.current.flyTo(loc.lng, loc.lat)
      }
    },
    [mapLocations]
  )

  const currentDayData = displayDays[activeDay] || null

  return (
    <div className="min-h-[60vh] bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden gradient-hero px-4 py-10 md:py-14">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&h=600&fit=crop')] bg-cover bg-center opacity-15" />
        <div className="container relative z-10 mx-auto max-w-4xl text-center">
          <h1 className="font-display mb-3 text-3xl font-bold text-primary-foreground md:text-5xl animate-fade-in">
            AI Trip Planner
          </h1>
          <p className="mx-auto max-w-xl text-primary-foreground/90 text-lg animate-fade-in">
            Tell us your destination and interests — we'll craft a day-by-day
            itinerary with real places and an interactive map.
          </p>
        </div>
      </section>

      <div className="mx-auto w-full max-w-6xl px-6 py-8 sm:px-8 lg:px-10">
        {/* Form */}
        <Card className="mb-10 overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
          <CardHeader className="border-b bg-muted/20">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="size-5 text-primary" />
              Plan your trip
            </CardTitle>
            <p className="text-muted-foreground">
              Fill in the details and we'll generate a personalized itinerary.
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="size-5" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Destination */}
              <div className="space-y-2">
                <Label htmlFor="destination" className="flex items-center gap-2 text-base font-medium">
                  <MapPin className="size-4 text-primary" />
                  Destination
                </Label>
                <Input
                  id="destination"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Paris, Tokyo, Bangalore"
                  className="rounded-xl text-base focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-colors"
                />
              </div>

              {/* Days + Budget side by side */}
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-base font-medium">
                    <Calendar className="size-4 text-primary" />
                    Number of days
                  </Label>
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="size-10 rounded-xl"
                      onClick={() => setDays((d) => Math.max(1, d - 1))}
                      disabled={days <= 1}
                    >
                      <Minus className="size-4" />
                    </Button>
                    <span className="w-10 text-center text-2xl font-bold text-foreground">
                      {days}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="size-10 rounded-xl"
                      onClick={() => setDays((d) => Math.min(14, d + 1))}
                      disabled={days >= 14}
                    >
                      <Plus className="size-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      day{days !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-base font-medium">
                    <Wallet className="size-4 text-primary" />
                    Budget
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {BUDGET_OPTIONS.map((b) => (
                      <Button
                        key={b}
                        type="button"
                        variant={budget === b ? 'default' : 'outline'}
                        size="lg"
                        className={cn(
                          'rounded-xl transition-all',
                          budget === b && 'shadow-md'
                        )}
                        onClick={() => setBudget(b)}
                      >
                        {b}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Interest chips */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-base font-medium">
                  <Sparkles className="size-4 text-primary" />
                  Interests
                </Label>
                <div className="flex flex-wrap gap-2">
                  {INTEREST_CHIPS.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => toggleInterest(id)}
                      className={cn(
                        'flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all',
                        selectedInterests.includes(id)
                          ? 'border-primary bg-primary text-primary-foreground shadow-md'
                          : 'border-border bg-card text-foreground hover:border-primary/50 hover:shadow-sm'
                      )}
                    >
                      <Icon className="size-4" />
                      {label}
                    </button>
                  ))}
                </div>
                <Input
                  value={customInterest}
                  onChange={(e) => setCustomInterest(e.target.value)}
                  placeholder="Or type custom interests..."
                  className="max-w-sm rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-colors"
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="rounded-xl text-base gradient-primary text-primary-foreground border-0 shadow-md hover:opacity-90 active:scale-[0.98] transition-all duration-200"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 size-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate itinerary'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Progress stepper */}
        {loading && progressStep && (
          <div className="mb-10 flex flex-col items-center gap-4">
            <div className="flex items-center gap-4">
              {PROGRESS_STEPS.map((step, i) => {
                const isActive = step.key === progressStep
                const stepIdx = PROGRESS_STEPS.findIndex((s) => s.key === progressStep)
                const isDone = i < stepIdx
                const Icon = step.icon
                return (
                  <div key={step.key} className="flex items-center gap-2">
                    {i > 0 && (
                      <div
                        className={cn(
                          'h-0.5 w-8 rounded-full transition-colors duration-500',
                          isDone || isActive ? 'bg-primary' : 'bg-border'
                        )}
                      />
                    )}
                    <div
                      className={cn(
                        'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-500',
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-md scale-105'
                          : isDone
                            ? 'bg-primary/20 text-primary'
                            : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {isActive ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Icon className="size-4" />
                      )}
                      <span className="hidden sm:inline">{step.label}</span>
                    </div>
                  </div>
                )
              })}
            </div>
            <p className="text-sm text-muted-foreground animate-pulse">
              This usually takes 10–20 seconds...
            </p>
          </div>
        )}

        {/* Results */}
        {result && hasStructured && (
          <div className="space-y-8">
            {/* Summary */}
            {displaySummary && (
              <Card className="overflow-hidden rounded-2xl border border-border bg-primary/5 shadow-sm">
                <CardContent className="p-6">
                  <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold">
                    <Sparkles className="size-5 text-primary" />
                    Trip Overview
                  </h2>
                  <div className="prose prose-lg max-w-none text-foreground prose-p:leading-relaxed">
                    <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
                      {displaySummary}
                    </ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Side-by-side: Map + Day content */}
            <div className="grid gap-8 lg:grid-cols-5">
              {/* Map column */}
              <div className={cn('lg:col-span-2', !hasMap && 'hidden lg:block')}>
                <div className="lg:sticky lg:top-20">
                  <h2 className="mb-3 flex items-center gap-2 text-xl font-bold">
                    <Map className="size-5 text-primary" />
                    Your route
                  </h2>
                  {someUnmapped && (
                    <p className="mb-2 text-sm text-amber-600 dark:text-amber-400">
                      {totalStops - mapLocations.length} stop(s) could not be mapped.
                    </p>
                  )}
                  {hasMap ? (
                    <ItineraryMap
                      ref={mapRef}
                      locations={mapLocations}
                      showDayLabels
                      activeDay={activeDay + 1}
                    />
                  ) : (
                    <div className="flex h-[320px] items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/20 text-muted-foreground">
                      No mappable locations found.
                    </div>
                  )}
                </div>
              </div>

              {/* Day-by-day column */}
              <div className="lg:col-span-3">
                <h2 className="mb-4 text-xl font-bold">Day-by-day plan</h2>

                {/* Day tabs */}
                <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2">
                  {displayDays.map((day, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveDay(i)}
                      className={cn(
                        'flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all',
                        activeDay === i
                          ? 'border-primary bg-primary text-primary-foreground shadow-md'
                          : 'border-border bg-card text-foreground hover:border-primary/50 hover:shadow-sm'
                      )}
                    >
                      <Calendar className="size-3.5" />
                      Day {i + 1}
                    </button>
                  ))}
                </div>

                {/* Active day card */}
                {currentDayData && (
                  <Card className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md animate-fade-in">
                    <CardHeader className="border-b bg-muted/20">
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <Sun className="size-5 text-primary" />
                        {currentDayData.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="divide-y p-0">
                      {(currentDayData.activities || []).map((act, idx) => (
                        <div
                          key={idx}
                          className="flex flex-col gap-2 px-6 py-5 sm:flex-row sm:gap-4 transition-colors hover:bg-muted/10"
                        >
                          <div className="flex shrink-0 items-start">
                            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                              <Clock className="size-3" />
                              {act.time}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-foreground">
                              {act.title}
                            </h3>
                            {act.location && (
                              <div className="mt-1 flex items-center gap-2">
                                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                  <MapPin className="size-3.5 shrink-0" />
                                  <span>{act.location}</span>
                                </p>
                                {hasMap && (
                                  <button
                                    type="button"
                                    onClick={() => handleFlyTo(act.location)}
                                    className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
                                  >
                                    <Eye className="size-3" />
                                    View on map
                                  </button>
                                )}
                              </div>
                            )}
                            {act.description && (
                              <div className="mt-2 prose prose-sm max-w-none text-muted-foreground prose-p:my-1">
                                <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
                                  {act.description}
                                </ReactMarkdown>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Day navigation */}
                <div className="mt-4 flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    disabled={activeDay === 0}
                    onClick={() => setActiveDay((d) => d - 1)}
                  >
                    <ChevronLeft className="mr-1 size-4" />
                    Previous day
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Day {activeDay + 1} of {displayDays.length}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    disabled={activeDay >= displayDays.length - 1}
                    onClick={() => setActiveDay((d) => d + 1)}
                  >
                    Next day
                    <ChevronRight className="ml-1 size-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Suggested listings */}
            {suggestedListings.length > 0 && (
              <section className="mt-12">
                <h2 className="mb-2 flex items-center gap-2 text-2xl font-bold">
                  <Home className="size-6 text-primary" />
                  Places to stay in {destination}
                </h2>
                <p className="mb-6 text-muted-foreground">
                  StayNJoy listings that match your destination.
                </p>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {suggestedListings.map((listing) => (
                    <ListingCard key={listing._id} listing={listing} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Fallback: raw itinerary text */}
        {result && !hasStructured && displayItineraryText && (
          <Card className="rounded-2xl border border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Your itinerary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-lg max-w-none text-foreground prose-headings:font-bold prose-p:leading-relaxed prose-ul:my-3 prose-li:my-1">
                <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
                  {displayItineraryText}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
