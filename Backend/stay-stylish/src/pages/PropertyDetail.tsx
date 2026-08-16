import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, MapPin, Heart, Share2, Users, Bed, Bath, ChevronDown, ChevronUp, Wifi, Car, Waves, Flame, Snowflake, UtensilsCrossed, Tv, WashingMachine, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { properties, reviews as allReviews } from "@/data/properties";
import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";
import { format, differenceInDays } from "date-fns";
import type { DateRange } from "react-day-picker";

const amenityIcons: Record<string, React.ElementType> = {
  WiFi: Wifi, "Free parking": Car, Pool: Waves, "Hot tub": Flame, "Air conditioning": Snowflake,
  Kitchen: UtensilsCrossed, "Smart TV": Tv, Washer: WashingMachine, Fireplace: Flame,
};

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toggleFavorite, isFavorite } = useApp();
  const property = properties.find((p) => p.id === id);
  const reviews = allReviews.filter((r) => r.propertyId === id);

  const [showFullDesc, setShowFullDesc] = useState(false);
  const [guests, setGuests] = useState(2);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-muted-foreground">Property not found</p>
      </div>
    );
  }

  const liked = isFavorite(property.id);
  const nights = dateRange?.from && dateRange?.to ? differenceInDays(dateRange.to, dateRange.from) : 0;
  const subtotal = nights * property.price;
  const cleaningFee = nights > 0 ? 75 : 0;
  const serviceFee = Math.round(subtotal * 0.12);
  const total = subtotal + cleaningFee + serviceFee;

  const handleBook = () => {
    if (!dateRange?.from || !dateRange?.to) return;
    navigate(`/book/${property.id}?checkIn=${dateRange.from.toISOString()}&checkOut=${dateRange.to.toISOString()}&guests=${guests}`);
  };

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      {/* Lightbox */}
      {lightboxImg && (
        <div className="fixed inset-0 z-50 bg-foreground/90 flex items-center justify-center p-4" onClick={() => setLightboxImg(null)}>
          <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-primary-foreground"><X /></Button>
          <img src={lightboxImg} alt="" className="max-w-full max-h-[90vh] object-contain rounded-lg" />
        </div>
      )}

      {/* Image Gallery */}
      <div className="container mx-auto px-4 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 rounded-2xl overflow-hidden h-[300px] md:h-[420px]">
          <div className="md:col-span-2 md:row-span-2 cursor-pointer" onClick={() => setLightboxImg(property.images[0])}>
            <img src={property.images[0]} alt={property.title} className="w-full h-full object-cover hover:opacity-90 transition-opacity" />
          </div>
          {property.images.slice(1, 5).map((img, i) => (
            <div key={i} className="hidden md:block cursor-pointer" onClick={() => setLightboxImg(img)}>
              <img src={img} alt="" className="w-full h-full object-cover hover:opacity-90 transition-opacity" />
            </div>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Main content */}
          <div className="flex-1">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">{property.title}</h1>
                <p className="text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="w-4 h-4" /> {property.location}, {property.country}
                </p>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {property.guests} guests</span>
                  <span className="flex items-center gap-1"><Bed className="w-4 h-4" /> {property.bedrooms} bedrooms</span>
                  <span className="flex items-center gap-1"><Bath className="w-4 h-4" /> {property.bathrooms} baths</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={() => toggleFavorite(property.id)}>
                  <Heart className={cn("w-5 h-5", liked ? "fill-primary text-primary" : "")} />
                </Button>
                <Button variant="outline" size="icon"><Share2 className="w-5 h-5" /></Button>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Host */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full gradient-secondary flex items-center justify-center text-secondary-foreground font-bold">
                {property.host.avatar}
              </div>
              <div>
                <p className="font-semibold">Hosted by {property.host.name}</p>
                <p className="text-sm text-muted-foreground">
                  {property.host.superhost && "Superhost · "}Joined in {property.host.joinedYear}
                </p>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Description */}
            <div>
              <h2 className="font-display text-xl font-semibold mb-3">About this place</h2>
              <p className={cn("text-muted-foreground leading-relaxed", !showFullDesc && "line-clamp-3")}>
                {property.description}
              </p>
              <Button variant="link" className="p-0 h-auto mt-1" onClick={() => setShowFullDesc(!showFullDesc)}>
                {showFullDesc ? <><ChevronUp className="w-4 h-4 mr-1" /> Show less</> : <><ChevronDown className="w-4 h-4 mr-1" /> Show more</>}
              </Button>
            </div>

            <Separator className="my-6" />

            {/* Amenities */}
            <div>
              <h2 className="font-display text-xl font-semibold mb-4">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {property.amenities.map((amenity) => {
                  const Icon = amenityIcons[amenity];
                  return (
                    <div key={amenity} className="flex items-center gap-3 p-3 rounded-xl bg-muted">
                      {Icon ? <Icon className="w-5 h-5 text-primary" /> : <div className="w-5 h-5 rounded-full bg-primary/20" />}
                      <span className="text-sm font-medium">{amenity}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <Separator className="my-6" />

            {/* Reviews */}
            <div>
              <h2 className="font-display text-xl font-semibold mb-1">Reviews</h2>
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 fill-accent text-accent" />
                <span className="font-bold text-lg">{property.rating}</span>
                <span className="text-muted-foreground">· {property.reviewCount} reviews</span>
              </div>
              <div className="space-y-4">
                {reviews.length > 0 ? reviews.map((review) => (
                  <div key={review.id} className="bg-muted rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
                        {review.avatar}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{review.userName}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(review.date), "MMM yyyy")}</p>
                      </div>
                      <div className="ml-auto flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-accent text-accent" />
                        <span className="text-sm font-medium">{review.rating}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                  </div>
                )) : (
                  <p className="text-muted-foreground">No reviews yet.</p>
                )}
              </div>
            </div>

            <Separator className="my-6" />

            {/* House Rules & Cancellation */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h2 className="font-display text-xl font-semibold mb-3">House Rules</h2>
                <ul className="space-y-2">
                  {property.houseRules.map((rule, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" /> {rule}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="font-display text-xl font-semibold mb-3">Cancellation Policy</h2>
                <p className="text-sm text-muted-foreground">{property.cancellationPolicy}</p>
              </div>
            </div>
          </div>

          {/* Sticky Booking Widget */}
          <div className="lg:w-[380px] shrink-0">
            <div className="sticky top-20 bg-card rounded-2xl border border-border p-6 shadow-elevated">
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-2xl font-bold">${property.price}</span>
                <span className="text-muted-foreground">/ night</span>
              </div>

              {/* Date picker */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left h-auto py-3 mb-3">
                    <div className="grid grid-cols-2 w-full gap-2 text-sm">
                      <div>
                        <p className="text-[10px] uppercase font-semibold text-muted-foreground">Check-in</p>
                        <p>{dateRange?.from ? format(dateRange.from, "MMM d") : "Add date"}</p>
                      </div>
                      <div className="border-l border-border pl-2">
                        <p className="text-[10px] uppercase font-semibold text-muted-foreground">Check-out</p>
                        <p>{dateRange?.to ? format(dateRange.to, "MMM d") : "Add date"}</p>
                      </div>
                    </div>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    disabled={(date) => date < new Date()}
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>

              {/* Guests */}
              <div className="flex items-center justify-between border border-border rounded-lg px-4 py-3 mb-4">
                <div>
                  <p className="text-[10px] uppercase font-semibold text-muted-foreground">Guests</p>
                  <p className="text-sm">{guests} guest{guests > 1 ? "s" : ""}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="h-8 w-8" disabled={guests <= 1} onClick={() => setGuests(guests - 1)}>-</Button>
                  <Button variant="outline" size="icon" className="h-8 w-8" disabled={guests >= property.guests} onClick={() => setGuests(guests + 1)}>+</Button>
                </div>
              </div>

              <Button
                className="w-full h-12 text-base gradient-primary text-primary-foreground rounded-xl shadow-lg hover:opacity-90 transition-opacity"
                disabled={!dateRange?.from || !dateRange?.to}
                onClick={handleBook}
              >
                {property.instantBook ? "Book Now" : "Request to Book"}
              </Button>

              {nights > 0 && (
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">${property.price} × {nights} nights</span><span>${subtotal}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Cleaning fee</span><span>${cleaningFee}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Service fee</span><span>${serviceFee}</span></div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-bold text-base"><span>Total</span><span>${total}</span></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;
