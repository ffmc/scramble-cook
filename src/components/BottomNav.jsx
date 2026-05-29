import { NavLink } from 'react-router-dom'
import { useStore } from '../context/AppContext'

const NAV_ITEMS = [
  { to: '/',         label: 'This Week',     icon: CalendarIcon },
  { to: '/shopping', label: 'Shopping',      icon: CartIcon },
  { to: '/recipes',  label: 'Recipes',       icon: BookIcon },
  { to: '/history',  label: 'History',       icon: ClockIcon },
]

export default function BottomNav() {
  const isLocked = useStore(s => s.currentWeek.isLocked)

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-warm-line z-30 safe-bottom">
      <div className="max-w-md mx-auto flex">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
          const disabled = to === '/shopping' && !isLocked
          return (
            <NavLink
              key={to}
              to={disabled ? '#' : to}
              onClick={e => disabled && e.preventDefault()}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center gap-0.5 py-3 text-xs font-medium transition-colors duration-150
                ${disabled ? 'text-warm-muted pointer-events-none' : isActive ? 'text-terra-400' : 'text-warm-gray'}`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}

function CalendarIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  )
}

function CartIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18M16 10a4 4 0 0 1-8 0" />
    </svg>
  )
}

function BookIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  )
}

function ClockIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  )
}
