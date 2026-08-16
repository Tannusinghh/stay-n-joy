import { Link, useLocation } from "react-router-dom";
import { Search, Heart, User, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useApp } from "@/context/AppContext";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { favorites } = useApp();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">S</span>
          </div>
          <span className="font-display text-xl font-bold text-foreground">StayVibe</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          <Link to="/search">
            <Button variant="ghost" size="sm" className="gap-2">
              <Search className="w-4 h-4" /> Explore
            </Button>
          </Link>
          <Link to="/wishlist">
            <Button variant="ghost" size="sm" className="gap-2 relative">
              <Heart className="w-4 h-4" /> Wishlist
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2">
              <User className="w-4 h-4" /> Dashboard
            </Button>
          </Link>
        </nav>

        {/* Mobile toggle */}
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card animate-fade-in">
          <nav className="flex flex-col p-4 gap-2">
            <Link to="/search" onClick={() => setMobileOpen(false)}>
              <Button variant="ghost" className="w-full justify-start gap-2"><Search className="w-4 h-4" /> Explore</Button>
            </Link>
            <Link to="/wishlist" onClick={() => setMobileOpen(false)}>
              <Button variant="ghost" className="w-full justify-start gap-2"><Heart className="w-4 h-4" /> Wishlist ({favorites.length})</Button>
            </Link>
            <Link to="/dashboard" onClick={() => setMobileOpen(false)}>
              <Button variant="ghost" className="w-full justify-start gap-2"><User className="w-4 h-4" /> Dashboard</Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
