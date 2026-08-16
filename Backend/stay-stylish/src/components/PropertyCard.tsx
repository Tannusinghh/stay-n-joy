import { Link } from "react-router-dom";
import { Heart, Star, MapPin } from "lucide-react";
import { Property } from "@/data/properties";
import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface PropertyCardProps {
  property: Property;
}

const PropertyCard = ({ property }: PropertyCardProps) => {
  const { toggleFavorite, isFavorite } = useApp();
  const [imgIndex, setImgIndex] = useState(0);
  const liked = isFavorite(property.id);

  return (
    <Link to={`/property/${property.id}`} className="group block">
      <div className="relative overflow-hidden rounded-2xl bg-card shadow-card hover-lift">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={property.images[imgIndex]}
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {/* Image dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {property.images.slice(0, 4).map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.preventDefault(); setImgIndex(i); }}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all",
                  i === imgIndex ? "bg-primary-foreground w-3" : "bg-primary-foreground/60"
                )}
              />
            ))}
          </div>
          {/* Favorite button */}
          <button
            onClick={(e) => { e.preventDefault(); toggleFavorite(property.id); }}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110"
          >
            <Heart
              className={cn("w-5 h-5 transition-colors", liked ? "fill-primary text-primary" : "text-foreground")}
            />
          </button>
          {/* Superhost badge */}
          {property.host.superhost && (
            <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-card/90 backdrop-blur-sm text-xs font-semibold text-foreground">
              Superhost
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-display font-semibold text-foreground truncate">{property.title}</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 shrink-0" /> {property.location}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Star className="w-4 h-4 fill-accent text-accent" />
              <span className="text-sm font-semibold">{property.rating}</span>
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-lg font-bold text-foreground">${property.price}</span>
            <span className="text-sm text-muted-foreground">/ night</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;
