import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, MapPin, Users as UsersIcon, User, Heart, Settings, Clock } from "lucide-react";
import { format } from "date-fns";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import PropertyCard from "@/components/PropertyCard";
import { properties } from "@/data/properties";
import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";

const statusColor: Record<string, string> = {
  confirmed: "bg-green-500/10 text-green-600 border-green-200",
  completed: "bg-muted text-muted-foreground border-border",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { bookings, favorites } = useApp();
  const wishlistProperties = properties.filter((p) => favorites.includes(p.id));

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full gradient-secondary flex items-center justify-center text-secondary-foreground font-bold text-xl">
            JD
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">Welcome back, Jane!</h1>
            <p className="text-muted-foreground">Manage your bookings and saved stays</p>
          </div>
        </div>

        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList className="bg-muted">
            <TabsTrigger value="bookings" className="gap-2"><CalendarDays className="w-4 h-4" /> Bookings</TabsTrigger>
            <TabsTrigger value="wishlist" className="gap-2"><Heart className="w-4 h-4" /> Wishlist</TabsTrigger>
            <TabsTrigger value="profile" className="gap-2"><Settings className="w-4 h-4" /> Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="bookings">
            {bookings.length === 0 ? (
              <div className="text-center py-16">
                <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-xl text-muted-foreground mb-2">No bookings yet</p>
                <Button className="gradient-primary text-primary-foreground" onClick={() => navigate("/search")}>Explore stays</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => {
                  const property = properties.find((p) => p.id === booking.propertyId);
                  if (!property) return null;
                  return (
                    <div key={booking.id} className="bg-card rounded-2xl border border-border p-4 md:p-6 flex flex-col md:flex-row gap-4 hover-lift cursor-pointer" onClick={() => navigate(`/property/${property.id}`)}>
                      <img src={property.images[0]} alt={property.title} className="w-full md:w-40 h-32 md:h-28 rounded-xl object-cover" />
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold">{property.title}</h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" /> {property.location}</p>
                          </div>
                          <Badge variant="outline" className={cn("capitalize shrink-0", statusColor[booking.status])}>
                            {booking.status}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                          <span>{format(new Date(booking.checkIn), "MMM d")} – {format(new Date(booking.checkOut), "MMM d, yyyy")}</span>
                          <span>{booking.guests} guests</span>
                          <span className="font-semibold text-foreground">${booking.totalPrice}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Ref: {booking.id}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="wishlist">
            {wishlistProperties.length === 0 ? (
              <div className="text-center py-16">
                <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-xl text-muted-foreground mb-2">No saved stays yet</p>
                <Button className="gradient-primary text-primary-foreground" onClick={() => navigate("/search")}>Discover stays</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlistProperties.map((p) => (
                  <PropertyCard key={p.id} property={p} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="profile">
            <div className="bg-card rounded-2xl border border-border p-6 max-w-lg">
              <h2 className="font-display text-xl font-semibold mb-4">Profile Settings</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>First Name</Label><Input defaultValue="Jane" /></div>
                  <div><Label>Last Name</Label><Input defaultValue="Doe" /></div>
                </div>
                <div><Label>Email</Label><Input defaultValue="jane@example.com" type="email" /></div>
                <div><Label>Phone</Label><Input defaultValue="+1 555 123 4567" type="tel" /></div>
                <Separator />
                <Button className="gradient-primary text-primary-foreground">Save Changes</Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
