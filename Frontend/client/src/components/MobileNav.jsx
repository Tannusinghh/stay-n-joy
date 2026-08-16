import { Home, Compass, User } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'

const tabs = [
  { icon: Home, label: 'Stays', path: '/listings' },
  { icon: Compass, label: 'Plan trip', path: '/plan-trip' },
  { icon: User, label: 'Account', path: '/login' },
]

export default function MobileNav() {
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-card/90 backdrop-blur-lg border-t border-border">
      <div className="flex items-center justify-around h-16">
        {tabs.map(({ icon: Icon, label, path }) => {
          const active =
            location.pathname === path ||
            (path === '/listings' && (location.pathname === '/' || location.pathname.startsWith('/listings'))) ||
            (path !== '/listings' && location.pathname.startsWith(path))
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-2 min-w-[64px] transition-colors',
                active ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
