import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Home,
  PlusCircle,
  LogIn,
  UserPlus,
  LogOut,
  Search,
  Menu,
  User,
  Compass,
} from 'lucide-react'

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const debounceRef = useRef(null)

  const applySearch = (value) => {
    const trimmed = value.trim()
    navigate('/listings', {
      replace: true,
      state: trimmed ? { search: trimmed } : undefined
    })
  }

  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      applySearch(value)
      debounceRef.current = null
    }, 350)
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
      debounceRef.current = null
    }
    applySearch(searchQuery)
  }

  const handleLogout = () => {
    setDropdownOpen(false)
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 shadow-sm supports-backdrop-filter:bg-background/80 backdrop-blur-md transition-shadow">
      <nav className="mx-auto flex h-16 w-full max-w-[1600px] items-center justify-between gap-4 px-6 sm:px-8 lg:px-10">
        <Link
          to="/listings"
          className="flex shrink-0 items-center gap-2 no-underline transition-opacity hover:opacity-90"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
            <span className="font-display text-sm font-bold text-primary-foreground">S</span>
          </div>
          <span className="font-display text-xl font-bold text-foreground">StayNJoy</span>
        </Link>

        {/* Search bar - visible on md+ (realtime debounced search) */}
        <form
          onSubmit={handleSearchSubmit}
          className="hidden flex-1 max-w-xl md:flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-2 shadow-sm transition-all duration-200 hover:shadow-md focus-within:bg-card focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50"
        >
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search destinations, price, or keywords"
            value={searchQuery}
            onChange={handleSearchChange}
            className="h-9 flex-1 border-0 bg-transparent text-base focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <Button type="submit" size="sm" className="rounded-full px-4 gradient-primary text-primary-foreground border-0 shadow-sm hover:opacity-90 active:scale-[0.98] transition-all duration-200">
            Search
          </Button>
        </form>

        <div className="flex shrink-0 items-center gap-2">
          <Link to="/listings">
            <Button variant="ghost" size="lg" className="text-base font-medium">
              Explore
            </Button>
          </Link>
          <Link to="/plan-trip">
            <Button variant="ghost" size="lg" className="text-base font-medium">
              Plan trip
            </Button>
          </Link>
          {isAuthenticated ? (
            <>
              <Link to="/listings/new">
                <Button size="lg" className="gap-2 rounded-full px-4 text-base font-medium gradient-primary text-primary-foreground border-0 shadow-md hover:opacity-90">
                  <PlusCircle className="size-5" />
                  Add Home
                </Button>
              </Link>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setDropdownOpen((o) => !o)}
                  className="flex items-center gap-2 rounded-full border border-border px-3 py-2 transition-shadow hover:shadow-md"
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                >
                  <Menu className="size-5 text-foreground" />
                  <User className="size-5 text-foreground" />
                </button>
                {dropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      aria-hidden
                      onClick={() => setDropdownOpen(false)}
                    />
                    <div className="absolute right-0 top-full z-20 mt-2 w-56 rounded-xl border border-border bg-card py-1 shadow-elevated animate-scale-in">
                      <div className="border-b border-border px-4 py-3">
                        <p className="text-sm font-medium">{user?.username}</p>
                        <p className="text-xs text-muted-foreground">Account</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-foreground hover:bg-muted"
                      >
                        <LogOut className="size-4" />
                        Log out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="lg" className="text-base font-medium">
                  Log in
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="lg" className="gap-2 rounded-full px-4 text-base font-medium gradient-primary text-primary-foreground border-0 shadow-md hover:opacity-90">
                  <UserPlus className="size-5" />
                  Sign up
                </Button>
              </Link>
            </>
          )}
        </div>
      </nav>
      {/* Mobile search - full width below nav */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2 border-t border-border bg-muted/30 px-4 py-3 md:hidden">
        <Input
          type="search"
          placeholder="Search destinations, price, or keywords"
          value={searchQuery}
          onChange={handleSearchChange}
          className="flex-1 rounded-xl border border-border bg-background text-base focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-colors"
        />
        <Button type="submit" size="lg" className="rounded-full px-5">
          <Search className="size-5" />
        </Button>
      </form>
    </header>
  )
}
