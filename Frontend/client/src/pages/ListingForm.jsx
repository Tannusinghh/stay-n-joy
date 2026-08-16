import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import api from '../api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, ArrowLeft, ImageIcon, MapPin, DollarSign, FileText, Globe } from 'lucide-react'

const CATEGORY_OPTIONS = [
  { value: 'trending', label: 'Trending' },
  { value: 'rooms', label: 'Rooms' },
  { value: 'mountains', label: 'Mountains' },
  { value: 'castles', label: 'Castles' },
  { value: 'pools', label: 'Amazing Pools' },
  { value: 'camping', label: 'Camping' },
  { value: 'arctic', label: 'Arctic' },
  { value: 'boat', label: 'Boat' },
]

function buildFormData(listing, imageFile) {
  const formData = new FormData()
  formData.append('listing[title]', listing.title)
  formData.append('listing[description]', listing.description)
  formData.append('listing[price]', String(listing.price))
  formData.append('listing[location]', listing.location)
  formData.append('listing[country]', listing.country)
  if (listing.category) formData.append('listing[category]', listing.category)
  if (imageFile) {
    formData.append('listing[image][url]', imageFile)
  } else {
    formData.append('listing[image][url]', listing.image?.url ?? '')
    if (listing.image?.filename) formData.append('listing[image][filename]', listing.image.filename)
  }
  return formData
}

export default function ListingForm({ edit = false }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    country: '',
    category: 'trending',
    image: { url: '', filename: '' },
  })
  const [imageFile, setImageFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fetching, setFetching] = useState(edit && !!id)

  useEffect(() => {
    if (edit && id) {
      setFetching(true)
      api.get(`/api/listings/${id}`)
        .then((res) => {
          const d = res.data
          setForm({
            title: d.title || '',
            description: d.description || '',
            price: d.price ?? '',
            location: d.location || '',
            country: d.country || '',
            category: d.category || 'trending',
            image: d.image || { url: '', filename: '' },
          })
        })
        .catch((err) => setError(err.message))
        .finally(() => setFetching(false))
    }
  }, [edit, id])

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'price') {
      setForm((f) => ({ ...f, [name]: value === '' ? '' : Number(value) }))
    } else {
      setForm((f) => ({ ...f, [name]: value }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!edit && !imageFile) {
      setError('Image is required for new listing')
      return
    }
    setLoading(true)
    try {
      const formData = buildFormData(form, imageFile)
      if (edit) {
        await api.put(`/api/listings/${id}`, formData, true)
        navigate(`/listings/${id}`)
      } else {
        await api.post('/api/listings', formData, true)
        navigate('/listings')
      }
    } catch (err) {
      setError(err.message || 'Failed to save listing')
    } finally {
      setLoading(false)
    }
  }

  if (edit && fetching) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <div className="animate-pulse space-y-6">
          <div className="h-10 w-48 rounded-lg bg-muted" />
          <div className="h-64 rounded-2xl bg-muted" />
          <div className="h-12 rounded-xl bg-muted" />
          <div className="h-12 rounded-xl bg-muted" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-10">
      {/* Top bar with back */}
      <div className="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-4 px-4 py-4 sm:px-6">
          <Link
            to={edit && id ? `/listings/${id}` : '/listings'}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back
          </Link>
          <span className="font-display text-lg font-semibold text-foreground">
            {edit ? 'Edit listing' : 'New listing'}
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <Alert variant="destructive" className="rounded-xl">
              <AlertCircle className="size-5" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Section: Basics */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md sm:p-8">
            <h2 className="font-display mb-6 flex items-center gap-3 text-xl font-semibold text-foreground">
              <FileText className="size-5 text-primary" />
              Basics
            </h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium text-foreground">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Cozy cabin in the woods"
                  required
                  className="h-12 rounded-xl border-border bg-background text-base focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-foreground">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe your place — what guests will love..."
                  required
                  rows={5}
                  className="min-h-32 rounded-xl border-border bg-background text-base focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-colors"
                />
              </div>
            </div>
          </section>

          {/* Section: Location */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md sm:p-8">
            <h2 className="font-display mb-6 flex items-center gap-3 text-xl font-semibold text-foreground">
              <MapPin className="size-5 text-primary" />
              Location
            </h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-medium text-foreground">City or area</Label>
                <Input
                  id="location"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="e.g. Malibu, Aspen"
                  required
                  className="h-12 rounded-xl border-border bg-background text-base focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country" className="text-sm font-medium text-foreground">Country</Label>
                <Input
                  id="country"
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  placeholder="e.g. United States"
                  required
                  className="h-12 rounded-xl border-border bg-background text-base focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-colors"
                />
              </div>
            </div>
          </section>

          {/* Section: Category */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md sm:p-8">
            <h2 className="font-display mb-6 flex items-center gap-3 text-xl font-semibold text-foreground">
              <Globe className="size-5 text-primary" />
              Category
            </h2>
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium text-foreground">Listing category (for filtering)</Label>
              <select
                id="category"
                name="category"
                value={form.category || 'trending'}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="flex h-12 w-full max-w-xs rounded-xl border border-border bg-background px-3 text-base focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-colors"
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </section>

          {/* Section: Price */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md sm:p-8">
            <h2 className="font-display mb-6 flex items-center gap-3 text-xl font-semibold text-foreground">
              <DollarSign className="size-5 text-primary" />
              Price
            </h2>
            <div className="space-y-2">
              <Label htmlFor="price" className="text-sm font-medium text-foreground">Price per night (USD)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                required
                className="h-12 w-full max-w-[200px] rounded-xl border-border bg-background text-base"
              />
            </div>
          </section>

          {/* Section: Photo */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md sm:p-8">
            <h2 className="font-display mb-6 flex items-center gap-3 text-xl font-semibold text-foreground">
              <ImageIcon className="size-5 text-primary" />
              Photo
              {edit && <span className="text-sm font-normal text-muted-foreground">(optional — leave empty to keep current)</span>}
            </h2>
            <div className="space-y-4">
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/30 py-10 transition-colors hover:border-primary/50 hover:bg-muted/50">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="sr-only"
                />
                <ImageIcon className="mb-3 size-10 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">
                  {imageFile ? imageFile.name : 'Click or drag to upload'}
                </span>
                <span className="mt-1 text-xs text-muted-foreground">PNG or JPG</span>
              </label>
              {edit && form.image?.url && !imageFile && (
                <div className="rounded-xl border border-border bg-muted/20 p-4">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Current photo</p>
                  <img src={form.image.url} alt="Current" className="max-h-48 w-full rounded-lg object-cover" />
                </div>
              )}
            </div>
          </section>

          {/* Submit */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Link
              to={edit && id ? `/listings/${id}` : '/listings'}
              className="text-sm font-medium text-muted-foreground underline-offset-4 hover:underline"
            >
              Cancel
            </Link>
            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="min-w-[200px] rounded-xl py-6 text-base font-medium gradient-primary text-primary-foreground shadow-sm hover:opacity-90 active:scale-[0.98] transition-all duration-200 border-0"
            >
              {loading ? 'Saving...' : edit ? 'Save changes' : 'Create listing'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
