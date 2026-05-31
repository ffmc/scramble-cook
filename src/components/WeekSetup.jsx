import { useStore } from '../context/AppContext'

const MEAL_OPTIONS = [
  { value: 'lunch',  label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'both',   label: 'Both' },
]

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const DAY_SHORT = { monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun' }

export default function WeekSetup() {
  const mealType      = useStore(s => s.currentWeek.mealType)
  const servings      = useStore(s => s.currentWeek.servings)
  const isLocked      = useStore(s => s.currentWeek.isLocked)
  const activeDays    = useStore(s => s.currentWeek.activeDays ?? DAYS)
  const setMealType   = useStore(s => s.setMealType)
  const setServings   = useStore(s => s.setServings)
  const toggleActiveDay = useStore(s => s.toggleActiveDay)

  return (
    <div className="flex flex-col gap-2.5 px-4 py-3 bg-white border-b border-warm-line">
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-1">
          {MEAL_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => !isLocked && setMealType(opt.value)}
              disabled={isLocked}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors duration-150
                ${mealType === opt.value
                  ? 'bg-terra-400 text-white'
                  : 'border border-terra-300 text-terra-400 disabled:opacity-50'
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <PersonIcon className="w-4 h-4 text-warm-muted shrink-0" />
          <button
            onClick={() => !isLocked && setServings(Math.max(1, servings - 1))}
            disabled={isLocked || servings <= 1}
            className="w-7 h-7 rounded-full border border-warm-line flex items-center justify-center text-warm-gray
                       hover:border-terra-300 hover:text-terra-400 transition-colors duration-150 disabled:opacity-40"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M5 12h14"/></svg>
          </button>
          <span className="w-5 text-center text-sm font-bold text-terra-500">{servings}</span>
          <button
            onClick={() => !isLocked && setServings(Math.min(12, servings + 1))}
            disabled={isLocked || servings >= 12}
            className="w-7 h-7 rounded-full border border-warm-line flex items-center justify-center text-warm-gray
                       hover:border-terra-300 hover:text-terra-400 transition-colors duration-150 disabled:opacity-40"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M12 5v14M5 12h14"/></svg>
          </button>
        </div>
      </div>

      <div className="flex gap-1.5">
        {DAYS.map(d => (
          <button
            key={d}
            onClick={() => !isLocked && toggleActiveDay(d)}
            disabled={isLocked}
            className={`flex-1 py-1 rounded-full text-xs font-semibold border transition-colors duration-150
              ${activeDays.includes(d)
                ? 'bg-terra-400 border-terra-400 text-white'
                : 'border-warm-line text-warm-muted'
              }
              ${isLocked ? 'opacity-50 cursor-default' : 'hover:border-terra-300'}`}
          >
            {DAY_SHORT[d]}
          </button>
        ))}
      </div>
    </div>
  )
}

function PersonIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}
