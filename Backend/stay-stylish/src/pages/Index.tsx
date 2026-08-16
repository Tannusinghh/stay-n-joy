import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, CalendarDays, Users, Waves, Mountain, Building2, TreePine, Sailboat, Palmtree, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PropertyCard from "@/components/PropertyCard";
import { properties, categories } from "@/data/properties";
import { cn } from "@/lib/utils";

const categoryIcons: Record<string, React.ElementType> = {
  Waves, Mountain, Building2, TreePine, Sailboat, Palmtree,
};

const Index = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchLocation, setSearchLocation] = useState("");

  const filtered = activeCategory
    ? properties.filter((p) => p.category === activeCategory)
    : properties;

  const handleSearch = () => {
    navigate(`/search?location=${encodeURIComponent(searchLocation)}`);
  };

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      {/* Hero */}
      <section className="relative overflow-hidden gradient-hero py-20 md:py-32 px-4">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&h=800&fit=crop')] bg-cover bg-center opacity-20" />
        <div className="container mx-auto relative z-10 text-center">
          <h1 className="font-display text-4xl md:text-6xl font-bold text-primary-foreground mb-4 animate-fade-in">
            Find Your Perfect
            <span className="block bg-gradient-to-r from-[hsl(16,85%,61%)] to-[hsl(45,93%,58%)] bg-clip-text text-transparent">
              Vacation Rental
            </span>
          </h1>
          <p className="text-primary-foreground/80 text-lg md:text-xl max-w-2xl mx-auto mb-8 animate-fade-in">
            Discover unique stays around the world — from beachfront villas to mountain cabins
          </p>

          {/* Search bar */}
          <div className="max-w-3xl mx-auto bg-card rounded-2xl p-2 md:p-3 shadow-elevated animate-slide-up flex flex-col md:flex-row gap-2">
            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-muted">
              <MapPin className="w-5 h-5 text-muted-foreground shrink-0" />
              <Input
                placeholder="Where are you going?"
                className="border-0 bg-transparent shadow-none focus-visible:ring-0 h-auto p-0"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted">
              <CalendarDays className="w-5 h-5 text-muted-foreground shrink-0" />
              <span className="text-sm text-muted-foreground">Any dates</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted">
              <Users className="w-5 h-5 text-muted-foreground shrink-0" />
              <span className="text-sm text-muted-foreground">Guests</span>
            </div>
            <Button onClick={handleSearch} className="gradient-primary text-primary-foreground rounded-xl h-12 px-6 gap-2 shadow-lg hover:opacity-90 transition-opacity">
              <Search className="w-5 h-5" /> Search
            </Button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => {
            const Icon = categoryIcons[cat.icon];
            const active = activeCategory === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(active ? null : cat.name)}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-medium whitespace-nowrap transition-all",
                  active
                    ? "bg-primary text-primary-foreground border-primary shadow-lg"
                    : "bg-card text-foreground border-border hover:border-primary/50 hover:shadow-card"
                )}
              >
                {Icon && <Icon className="w-4 h-4" />}
                {cat.name}
              </button>
            );
          })}
        </div>
      </section>

      {/* Featured Properties */}
      <section className="container mx-auto px-4 pb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              {activeCategory ? `${activeCategory} Getaways` : "Trending Stays"}
            </h2>
            <p className="text-muted-foreground mt-1">Handpicked properties loved by travelers</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/search")} className="hidden md:flex">
            View all
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((property, i) => (
            <div key={property.id} className="animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
              <PropertyCard property={property} />
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-xl text-muted-foreground">No properties found in this category.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Index;
