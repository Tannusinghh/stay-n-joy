import PropertyCard from "@/components/PropertyCard";
import { properties } from "@/data/properties";
import { useApp } from "@/context/AppContext";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Wishlist = () => {
  const { favorites } = useApp();
  const navigate = useNavigate();
  const wishlistProperties = properties.filter((p) => favorites.includes(p.id));

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <div className="container mx-auto px-4 py-8">
        <h1 className="font-display text-2xl md:text-3xl font-bold mb-2">Your Wishlist</h1>
        <p className="text-muted-foreground mb-6">{wishlistProperties.length} saved {wishlistProperties.length === 1 ? "stay" : "stays"}</p>

        {wishlistProperties.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-xl text-muted-foreground mb-2">No saved stays yet</p>
            <p className="text-sm text-muted-foreground mb-6">Tap the heart on any property to save it here</p>
            <Button className="gradient-primary text-primary-foreground" onClick={() => navigate("/search")}>Start Exploring</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistProperties.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
