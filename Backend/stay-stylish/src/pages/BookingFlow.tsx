import { useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { format, differenceInDays } from "date-fns";
import { Check, ArrowLeft, ArrowRight, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { properties } from "@/data/properties";
import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";

const steps = ["Dates", "Details", "Summary", "Confirmed"];

const BookingFlow = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addBooking } = useApp();

  const property = properties.find((p) => p.id === id);
  const checkIn = new Date(searchParams.get("checkIn") || "");
  const checkOut = new Date(searchParams.get("checkOut") || "");
  const guestsParam = parseInt(searchParams.get("guests") || "2");

  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [bookingRef, setBookingRef] = useState("");

  if (!property || isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-muted-foreground">Invalid booking details</p>
      </div>
    );
  }

  const nights = differenceInDays(checkOut, checkIn);
  const subtotal = nights * property.price;
  const cleaningFee = 75;
  const serviceFee = Math.round(subtotal * 0.12);
  const total = subtotal + cleaningFee + serviceFee;

  const validateDetails = () => {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim()) e.lastName = "Required";
    if (!form.email.trim() || !form.email.includes("@")) e.email = "Valid email required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleConfirm = () => {
    const ref = `SV-${Date.now().toString(36).toUpperCase()}`;
    setBookingRef(ref);
    addBooking({
      id: ref,
      propertyId: property.id,
      checkIn: checkIn.toISOString().split("T")[0],
      checkOut: checkOut.toISOString().split("T")[0],
      guests: guestsParam,
      totalPrice: total,
      status: "confirmed",
      bookedAt: new Date().toISOString().split("T")[0],
    });
    setStep(3);
  };

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Progress */}
        {step < 3 && (
          <div className="flex items-center gap-2 mb-8">
            {steps.slice(0, 3).map((s, i) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all",
                  i <= step ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}>
                  {i < step ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span className={cn("text-sm font-medium hidden sm:block", i <= step ? "text-foreground" : "text-muted-foreground")}>{s}</span>
                {i < 2 && <div className={cn("flex-1 h-0.5 rounded", i < step ? "bg-primary" : "bg-muted")} />}
              </div>
            ))}
          </div>
        )}

        {/* Step 0: Dates confirmation */}
        {step === 0 && (
          <div className="animate-fade-in">
            <h1 className="font-display text-2xl font-bold mb-6">Confirm Your Dates</h1>
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex gap-4 mb-4">
                <img src={property.images[0]} alt={property.title} className="w-24 h-24 rounded-xl object-cover" />
                <div>
                  <h3 className="font-semibold">{property.title}</h3>
                  <p className="text-sm text-muted-foreground">{property.location}</p>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-muted-foreground">Check-in</p><p className="font-semibold">{format(checkIn, "EEE, MMM d, yyyy")}</p></div>
                <div><p className="text-muted-foreground">Check-out</p><p className="font-semibold">{format(checkOut, "EEE, MMM d, yyyy")}</p></div>
                <div><p className="text-muted-foreground">Guests</p><p className="font-semibold">{guestsParam}</p></div>
                <div><p className="text-muted-foreground">Nights</p><p className="font-semibold">{nights}</p></div>
              </div>
            </div>
            <Button className="w-full mt-6 h-12 gradient-primary text-primary-foreground rounded-xl gap-2" onClick={() => setStep(1)}>
              Continue <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Step 1: Guest details */}
        {step === 1 && (
          <div className="animate-fade-in">
            <h1 className="font-display text-2xl font-bold mb-6">Guest Details</h1>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>First Name</Label>
                  <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className={errors.firstName ? "border-destructive" : ""} />
                  {errors.firstName && <p className="text-xs text-destructive mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className={errors.lastName ? "border-destructive" : ""} />
                  {errors.lastName && <p className="text-xs text-destructive mt-1">{errors.lastName}</p>}
                </div>
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={errors.email ? "border-destructive" : ""} />
                {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
              </div>
              <div>
                <Label>Phone (optional)</Label>
                <Input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div>
                <Label>Message to host (optional)</Label>
                <Input value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Any special requests?" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setStep(0)} className="gap-2"><ArrowLeft className="w-4 h-4" /> Back</Button>
              <Button className="flex-1 h-12 gradient-primary text-primary-foreground rounded-xl gap-2" onClick={() => validateDetails() && setStep(2)}>
                Continue <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Summary */}
        {step === 2 && (
          <div className="animate-fade-in">
            <h1 className="font-display text-2xl font-bold mb-6">Booking Summary</h1>
            <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
              <div className="flex gap-4">
                <img src={property.images[0]} alt={property.title} className="w-20 h-20 rounded-xl object-cover" />
                <div>
                  <h3 className="font-semibold">{property.title}</h3>
                  <p className="text-sm text-muted-foreground">{property.location}</p>
                </div>
              </div>
              <Separator />
              <div className="text-sm space-y-1">
                <p><span className="text-muted-foreground">Dates:</span> {format(checkIn, "MMM d")} – {format(checkOut, "MMM d, yyyy")}</p>
                <p><span className="text-muted-foreground">Guests:</span> {guestsParam}</p>
                <p><span className="text-muted-foreground">Guest:</span> {form.firstName} {form.lastName}</p>
                <p><span className="text-muted-foreground">Email:</span> {form.email}</p>
              </div>
              <Separator />
              <div className="text-sm space-y-2">
                <div className="flex justify-between"><span className="text-muted-foreground">${property.price} × {nights} nights</span><span>${subtotal}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Cleaning fee</span><span>${cleaningFee}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Service fee</span><span>${serviceFee}</span></div>
                <Separator />
                <div className="flex justify-between font-bold text-lg"><span>Total</span><span>${total}</span></div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setStep(1)} className="gap-2"><ArrowLeft className="w-4 h-4" /> Back</Button>
              <Button className="flex-1 h-12 gradient-primary text-primary-foreground rounded-xl gap-2" onClick={handleConfirm}>
                Confirm & Book
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div className="text-center animate-scale-in py-12">
            <div className="w-20 h-20 rounded-full gradient-primary mx-auto flex items-center justify-center mb-6">
              <PartyPopper className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="font-display text-3xl font-bold mb-2">Booking Confirmed!</h1>
            <p className="text-muted-foreground mb-1">Your booking reference is</p>
            <p className="text-2xl font-bold text-primary mb-6">{bookingRef}</p>
            <div className="bg-card rounded-2xl border border-border p-6 max-w-sm mx-auto text-left text-sm space-y-1 mb-8">
              <p className="font-semibold">{property.title}</p>
              <p className="text-muted-foreground">{format(checkIn, "MMM d")} – {format(checkOut, "MMM d, yyyy")}</p>
              <p className="text-muted-foreground">{guestsParam} guests · ${total} total</p>
            </div>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => navigate("/dashboard")}>View Bookings</Button>
              <Button className="gradient-primary text-primary-foreground" onClick={() => navigate("/")}>Explore More</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingFlow;
