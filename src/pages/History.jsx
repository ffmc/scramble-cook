import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../context/AppContext'

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const DAY_LABELS = {
  monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed',
  thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun',
}

function weekRange(lockedAt) {
  const end   = new Date(lockedAt)
  const start = new Date(end)
  start.setDate(end.getDate() - 6)
  const fmt = d => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  return `${fmt(start)} – ${fmt(end)}`
}

export default function History() {
  const weekHistory    = useStore(s => s.weekHistory)
  const loadHistoryWeek = useStore(s => s.loadHistoryWeek)
  const allRecipes      = useStore(s => s.recipes)
  const navigate        = useNavigate()
  const [expanded, setExpanded] = useState({})

  const recipeName = (id) => allRecipes.find(r => r.id === id)?.name ?? '—'

  const toggle = (i) => setExpanded(e => ({ ...e, [i]: !e[i] }))

  const handleReuse = (entry) => {
    loadHistoryWeek(entry)
    navigate('/')
  }

  if (weekHistory.length === 0) {
    return (
      <div>
        <header className="px-4 pt-5 pb-3">
          <h1 className="font-display text-2xl font-bold text-terra-500 tracking-tight">History</h1>
        </header>
        <div className="px-4 py-12 text-center">
          <p className="text-warm-muted text-sm">No past weeks yet. Lock your first week to see it here.</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <header className="px-4 pt-5 pb-3">
        <h1 className="font-display text-2xl font-bold text-terra-500 tracking-tight">History</h1>
        <p className="text-sm text-warm-gray mt-0.5">{weekHistory.length} past {weekHistory.length === 1 ? 'week' : 'weeks'}</p>
      </header>

      <div className="px-4 pb-4 space-y-3">
        {weekHistory.map((entry, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-card overflow-hidden">
            <div className="px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-800">{weekRange(entry.lockedAt)}</p>
                <p className="text-xs text-warm-gray mt-0.5">
                  {entry.mealType === 'both' ? 'Lunch & Dinner' : entry.mealType === 'lunch' ? 'Lunch only' : 'Dinner only'}
                  {' · '}{entry.servings} servings
                </p>
              </div>
              <button
                onClick={() => toggle(i)}
                className="p-2 rounded-lg hover:bg-cream-200 text-warm-gray transition-colors"
              >
                <ChevronIcon open={!!expanded[i]} />
              </button>
            </div>

            {/* Mini grid — always visible */}
            <div className="px-4 pb-3 grid grid-cols-7 gap-0.5">
              {DAYS.map(day => {
                const s = entry.slots[day]
                const hasMeal = s.lunch || s.dinner
                return (
                  <div key={day} className="flex flex-col items-center gap-0.5">
                    <span className="text-xs text-warm-muted">{DAY_LABELS[day][0]}</span>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs
                      ${hasMeal ? 'bg-terra-400 text-white' : 'bg-warm-line text-warm-muted'}`}>
                      {hasMeal ? '✓' : '—'}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Expanded detail */}
            {expanded[i] && (
              <div className="border-t border-warm-line">
                <div className="px-4 py-3 space-y-2">
                  {DAYS.map(day => {
                    const s = entry.slots[day]
                    const showLunch  = entry.mealType === 'lunch'  || entry.mealType === 'both'
                    const showDinner = entry.mealType === 'dinner' || entry.mealType === 'both'
                    return (
                      <div key={day}>
                        <p className="text-xs font-bold uppercase tracking-wider text-warm-muted mb-0.5">
                          {DAY_LABELS[day]}
                        </p>
                        {showLunch && (
                          <p className="text-xs text-gray-700">
                            <span className="text-warm-muted">L: </span>
                            {s.lunchSkipped ? 'Not home' : s.lunch ? recipeName(s.lunch) : '—'}
                          </p>
                        )}
                        {showDinner && (
                          <p className="text-xs text-gray-700">
                            <span className="text-warm-muted">D: </span>
                            {s.dinnerSkipped ? 'Not home' : s.dinner ? recipeName(s.dinner) : '—'}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
                <div className="px-4 pb-4">
                  <button
                    onClick={() => handleReuse(entry)}
                    className="w-full py-2.5 rounded-xl bg-terra-400 text-white text-sm font-semibold
                               hover:bg-terra-500 transition-colors"
                  >
                    Re-use this week
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function ChevronIcon({ open }) {
  return (
    <svg
      className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}
