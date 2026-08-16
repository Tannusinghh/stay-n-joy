import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useLocation } from 'react-router-dom'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import api from '../api'
import { useAuth } from '../context/AuthContext'

const SEARCH_DEBOUNCE_MS = 350
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import ListingCard from '@/components/ListingCard'
import {
  AlertCircle,
  Flame,
  BedDouble,
  Mountain,
  Castle,
  Waves,
  Tent,
  Snowflake,
  Ship,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const CATEGORIES = [
  { id: 'trending', label: 'Trending', icon: Flame },
  { id: 'rooms', label: 'Rooms', icon: BedDouble },
  { id: 'mountains', label: 'Mountains', icon: Mountain },
  { id: 'castles', label: 'Castles', icon: Castle },
  { id: 'pools', label: 'Amazing Pools', icon: Waves },
  { id: 'camping', label: 'Camping', icon: Tent },
  { id: 'arctic', label: 'Arctic', icon: Snowflake },
  { id: 'boat', label: 'Boat', icon: Ship },
]

const SORT_OPTIONS = [
  { value: '', label: 'Default' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'newest', label: 'Newest first' },
]

function buildListingsParams({ category, q, minPrice, maxPrice, sort }) {
  const params = new URLSearchParams()
  if (category) params.set('category', category)
  if (q && q.trim()) params.set('q', q.trim())
  if (minPrice !== '') params.set('minPrice', minPrice)
  if (maxPrice !== '') params.set('maxPrice', maxPrice)
  if (sort) params.set('sort', sort)
  return params
}

export default function ListingsList() {
  const { isAuthenticated } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [showTax, setShowTax] = useState(false)
  const location = useLocation()
  const [searchInput, setSearchInput] = useState('')
  const [searchForFetch, setSearchForFetch] = useState('')
  const searchDebounceRef = useRef(null)
  const initFromStateRef = useRef(false)

  const [aiQuery, setAiQuery] = useState('')
  const [aiResults, setAiResults] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState(null)
  const [aiFiltersUsed, setAiFiltersUsed] = useState(null)

  const category = searchParams.get('category') || ''
  const minPrice = searchParams.get('minPrice') || ''
  const maxPrice = searchParams.get('maxPrice') || ''
  const sort = searchParams.get('sort') || ''

  const queryKey = ['listings', { category, q: searchForFetch, minPrice, maxPrice, sort }]
  const { data: listings = [], isLoading, isFetching, isError: hasError, error } = useQuery({
    queryKey,
    queryFn: async () => {
      const params = buildListingsParams({ category, q: searchForFetch, minPrice, maxPrice, sort })
      const res = await api.get(`/api/listings?${params.toString()}`)
      return res.data || []
    },
    placeholderData: keepPreviousData,
  })
  const errorMessage = hasError && error ? (error.message || 'Failed to load listings') : null
  const showFullSkeleton = isLoading && listings.length === 0

  const displayListings = aiResults !== null ? aiResults : listings
  const isAiSearchMode = aiResults !== null

  const handleAiSearch = async (e) => {
    e?.preventDefault()
    const q = aiQuery.trim()
    if (!q || aiLoading || !isAuthenticated) return
    setAiError(null)
    setAiLoading(true)
    try {
      const res = await api.post('/api/ai/smart-search', { query: q })
      setAiResults(res.data || [])
      setAiFiltersUsed(res.filtersUsed ?? null)
    } catch (err) {
      setAiError(err.message || 'AI search failed')
      setAiResults(null)
      setAiFiltersUsed(null)
    } finally {
      setAiLoading(false)
    }
  }

  const clearAiSearch = () => {
    setAiResults(null)
    setAiFiltersUsed(null)
    setAiError(null)
    setAiQuery('')
  }

  // Initial load: read search from navbar (location.state) or legacy URL once; strip ?q from URL
  useEffect(() => {
    if (initFromStateRef.current) return
    const fromState = location.state?.search
    const fromUrl = searchParams.get('q') || searchParams.get('search') || ''
    const initial = (typeof fromState === 'string' && fromState.trim()) || fromUrl.trim() || ''
    if (initial) {
      setSearchInput(initial)
      setSearchForFetch(initial)
    }
    initFromStateRef.current = true
    if (fromUrl) {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        next.delete('q')
        next.delete('search')
        return next
      }, { replace: true })
    }
  }, [])

  // When navbar navigates to /listings with state.search (realtime), apply it without re-mount
  useEffect(() => {
    const fromState = location.state?.search
    if (typeof fromState === 'string' && fromState.trim()) {
      setSearchInput(fromState.trim())
      setSearchForFetch(fromState.trim())
    }
  }, [location.state?.search])

  const setFilter = (key, value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value === '' || value == null) next.delete(key)
      else next.set(key, value)
      return next
    })
  }

  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchInput(value)
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    searchDebounceRef.current = setTimeout(() => {
      setSearchForFetch(value.trim())
      searchDebounceRef.current = null
    }, SEARCH_DEBOUNCE_MS)
  }

  if (showFullSkeleton) {
    return (
      <div className="min-h-[60vh] bg-background">
        <div className="mx-auto w-full max-w-[1600px] px-6 py-8 sm:px-8 lg:px-10">
          <div className="mb-8 flex flex-wrap gap-4">
            {CATEGORIES.slice(0, 6).map((c) => (
              <div key={c.id} className="h-12 w-24 animate-pulse rounded-full bg-muted" />
            ))}
          </div>
          <div className="mb-6 h-10 w-80 animate-pulse rounded-lg bg-muted" />
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden">
                <div className="h-72 animate-pulse bg-muted" />
                <CardHeader className="pb-2">
                  <div className="h-6 w-3/4 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
                </CardHeader>
                <CardContent>
                  <div className="h-5 w-1/4 animate-pulse rounded bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (hasError) {
    return (
      <div className="mx-auto w-full max-w-[1600px] px-6 py-12 sm:px-8 lg:px-10">
        <Alert variant="destructive" className="text-base">
          <AlertCircle className="size-5" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-[60vh] bg-background">
      <section className="relative overflow-hidden gradient-hero px-4 py-12 md:py-16">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&h=800&fit=crop')] bg-cover bg-center opacity-20" />
        <div className="container relative z-10 mx-auto max-w-[1600px] text-center">
          <h1 className="font-display mb-4 text-3xl font-bold text-primary-foreground md:text-5xl animate-fade-in">
            Find your perfect stay
          </h1>
          <p className="mx-auto mb-6 max-w-xl text-primary-foreground/90 text-lg animate-fade-in">
            Unique homes and experiences around the world
          </p>
        </div>
      </section>

      <div className="mx-auto w-full max-w-[1600px] px-6 py-8 sm:px-8 lg:px-10">
        {/* Category pills */}
        <div className="mb-6 flex flex-wrap items-center gap-3 overflow-x-auto pb-2">
          {CATEGORIES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter('category', category === id ? '' : id)}
              className={cn(
                'flex items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2.5 text-sm font-medium transition-all',
                category === id
                  ? 'border-primary bg-primary text-primary-foreground shadow-md'
                  : 'border-border bg-card text-foreground hover:border-primary/50 hover:shadow-card'
              )}
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Filters row: search, price, sort */}
        <div className="mb-8 flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow duration-200 hover:shadow-md">
          <div className="flex flex-1 flex-wrap items-center gap-4 gap-y-3">
            <Input
              type="search"
              placeholder="Search by title, location..."
              value={searchInput}
              onChange={handleSearchChange}
              className="max-w-xs rounded-xl border-border focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-colors"
            />
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Min $"
                min="0"
                value={minPrice}
                onChange={(e) => setFilter('minPrice', e.target.value)}
                className="w-24 rounded-xl border-border focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-colors"
              />
              <span className="text-muted-foreground">–</span>
              <Input
                type="number"
                placeholder="Max $"
                min="0"
                value={maxPrice}
                onChange={(e) => setFilter('maxPrice', e.target.value)}
                className="w-24 rounded-xl border-border focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-colors"
              />
            </div>
            <select
              value={sort}
              onChange={(e) => setFilter('sort', e.target.value)}
              className="flex h-10 items-center rounded-xl border border-border bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-colors"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value || 'default'} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {/* AI natural-language search */}
            <form onSubmit={handleAiSearch} className="flex flex-wrap items-center gap-2 border-l border-border pl-4">
              <Sparkles className="size-4 shrink-0 text-primary" aria-hidden />
              <Input
                type="text"
                placeholder={isAuthenticated ? 'e.g. cheap beach stays in Goa' : 'Sign in to use AI search'}
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                disabled={!isAuthenticated || aiLoading}
                className="max-w-[220px] rounded-xl border-border focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-colors"
              />
              <Button
                type="submit"
                size="sm"
                className="rounded-xl gradient-primary text-primary-foreground border-0 shadow-sm hover:opacity-90"
                disabled={!isAuthenticated || aiLoading || !aiQuery.trim()}
              >
                {aiLoading ? 'Searching…' : 'AI Search'}
              </Button>
            </form>
          </div>
          <div className="flex shrink-0 items-center gap-2 rounded-full border border-border bg-muted/30 px-4 py-2">
            <input
              type="checkbox"
              id="tax-toggle"
              checked={showTax}
              onChange={(e) => setShowTax(e.target.checked)}
              className="size-4 rounded border-input"
            />
            <label htmlFor="tax-toggle" className="cursor-pointer text-sm text-muted-foreground">
              Show price after taxes
            </label>
          </div>
        </div>

        {aiError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="size-5" />
            <AlertDescription>{aiError}</AlertDescription>
          </Alert>
        )}

        {isAiSearchMode && (
          <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
            <span className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Sparkles className="size-4 text-primary" />
              AI found {displayListings.length} result{displayListings.length !== 1 ? 's' : ''}
            </span>
            {aiFiltersUsed && Object.keys(aiFiltersUsed).length > 0 && (
              <span className="text-xs text-muted-foreground">
                {[
                  aiFiltersUsed.keywords && `Keywords: ${aiFiltersUsed.keywords}`,
                  aiFiltersUsed.priceMin != null && `Min $${aiFiltersUsed.priceMin}`,
                  aiFiltersUsed.priceMax != null && `Max $${aiFiltersUsed.priceMax}`,
                  aiFiltersUsed.location && `Location: ${aiFiltersUsed.location}`,
                  aiFiltersUsed.country && `Country: ${aiFiltersUsed.country}`,
                ].filter(Boolean).join(' · ')}
              </span>
            )}
            <Button variant="outline" size="sm" className="ml-auto rounded-xl" onClick={clearAiSearch}>
              Clear AI search
            </Button>
          </div>
        )}

        {(category || searchForFetch || minPrice || maxPrice || displayListings.length > 0) && !isAiSearchMode && (
          <p className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              {displayListings.length} result{displayListings.length !== 1 ? 's' : ''}
              {category && ` in ${CATEGORIES.find((c) => c.id === category)?.label || category}`}
            </span>
            {isFetching && (
              <span className="inline-block size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-hidden />
            )}
          </p>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayListings.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/20 py-20 text-center">
              <p className="text-xl text-muted-foreground">
                {isAiSearchMode ? 'No listings match your AI search.' : 'No listings found.'}
              </p>
              <Button
                variant="link"
                className="mt-4 text-lg"
                onClick={() => (isAiSearchMode ? clearAiSearch() : (setSearchParams({}), setSearchInput(''), setSearchForFetch('')))}
              >
                {isAiSearchMode ? 'Clear AI search' : 'Clear filters'}
              </Button>
            </div>
          ) : (
            displayListings.map((listing, i) => (
              <div key={listing._id} className="animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                <ListingCard listing={listing} showTax={showTax} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
