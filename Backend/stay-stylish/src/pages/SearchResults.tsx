import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, Grid3X3, List, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PropertyCard from "@/components/PropertyCard";
import { properties, categories } from "@/data/properties";
import { cn } from "@/lib/utils";

const allAmenities = ["WiFi", "Pool", "Kitchen", "Air conditioning", "Hot tub", "Free parking", "Fireplace", "Ocean view", "Mountain view", "Lake access"];

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const initLocation = searchParams.get("location") || "";

  const [location, setLocation] = useState(initLocation);
  const [priceRange, setPriceRange] = useState([0, 600]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [instantBook, setInstantBook] = useState(false);
  const [sortBy, setSortBy] = useState("recommended");
  const [gridView, setGridView] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let result = properties.filter((p) => {
      if (location && !p.location.toLowerCase().includes(location.toLowerCase()) && !p.country.toLowerCase().includes(location.toLowerCase())) return false;
      if (p.price < priceRange[0] || p.price > priceRange[1]) return false;
      if (selectedCategory && p.category !== selectedCategory) return false;
      if (instantBook && !p.instantBook) return false;
      if (selectedAmenities.length > 0 && !selectedAmenities.every((a) => p.amenities.includes(a))) return false;
      return true;
    });

    if (sortBy === "price-low") result.sort((a, b) => a.price - b.price);
    else if (sortBy === "price-high") result.sort((a, b) => b.price - a.price);
    else if (sortBy === "rating") result.sort((a, b) => b.rating - a.rating);

    return result;
  }, [location, priceRange, selectedCategory, selectedAmenities, instantBook, sortBy]);

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const FiltersContent = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-sm font-semibold mb-3 block">Price Range</Label>
        <Slider value={priceRange} onValueChange={setPriceRange} min={0} max={600} step={10} className="mb-2" />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>${priceRange[0]}</span><span>${priceRange[1]}+</span>
        </div>
      </div>

      <div>
        <Label className="text-sm font-semibold mb-3 block">Category</Label>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(selectedCategory === cat.name ? "" : cat.name)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                selectedCategory === cat.name
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-foreground border-border hover:border-primary/50"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-sm font-semibold mb-3 block">Amenities</Label>
        <div className="space-y-2.5">
          {allAmenities.map((amenity) => (
            <label key={amenity} className="flex items-center gap-2.5 cursor-pointer">
              <Checkbox
                checked={selectedAmenities.includes(amenity)}
                onCheckedChange={() => toggleAmenity(amenity)}
              />
              <span className="text-sm">{amenity}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold">Instant Book</Label>
        <Switch checked={instantBook} onCheckedChange={setInstantBook} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      {/* Sticky search */}
      <div className="sticky top-16 z-40 bg-card/90 backdrop-blur-lg border-b border-border py-3 px-4">
        <div className="container mx-auto flex items-center gap-3">
          <Input
            placeholder="Search by location..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="max-w-sm"
          />
          <Button
            variant="outline"
            className="md:hidden gap-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </Button>
          <div className="ml-auto flex items-center gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recommended">Recommended</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Top Rated</SelectItem>
              </SelectContent>
            </Select>
            <div className="hidden md:flex border rounded-lg">
              <Button variant={gridView ? "secondary" : "ghost"} size="icon" onClick={() => setGridView(true)}>
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button variant={!gridView ? "secondary" : "ghost"} size="icon" onClick={() => setGridView(false)}>
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-8">
          {/* Sidebar filters - desktop */}
          <aside className="hidden md:block w-64 shrink-0">
            <div className="sticky top-36 bg-card rounded-2xl border border-border p-5">
              <h3 className="font-display font-semibold text-lg mb-4">Filters</h3>
              <FiltersContent />
            </div>
          </aside>

          {/* Mobile filters overlay */}
          {showFilters && (
            <div className="fixed inset-0 z-50 md:hidden">
              <div className="absolute inset-0 bg-foreground/50" onClick={() => setShowFilters(false)} />
              <div className="absolute bottom-0 left-0 right-0 bg-card rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto animate-slide-up">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-semibold text-lg">Filters</h3>
                  <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)}><X /></Button>
                </div>
                <FiltersContent />
                <Button className="w-full mt-6 gradient-primary text-primary-foreground" onClick={() => setShowFilters(false)}>
                  Show {filtered.length} results
                </Button>
              </div>
            </div>
          )}

          {/* Results */}
          <div className="flex-1">
            <p className="text-muted-foreground mb-4">{filtered.length} stays found</p>
            <div className={cn(
              "gap-6",
              gridView ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" : "flex flex-col"
            )}>
              {filtered.map((property, i) => (
                <div key={property.id} className="animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
                  <PropertyCard property={property} />
                </div>
              ))}
            </div>
            {filtered.length === 0 && (
              <div className="text-center py-20">
                <p className="text-xl text-muted-foreground mb-2">No properties match your filters</p>
                <p className="text-sm text-muted-foreground">Try adjusting your search criteria</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
