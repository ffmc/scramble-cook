import { useStore } from '../context/AppContext'

const MEAL_OPTIONS = [
  { value: 'lunch',  label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'both',   label: 'Both' },
]

export default function WeekSetup() {
  const mealType = useStore(s => s.currentWeek.mealType)
  const servings = useStore(s => s.currentWeek.servings)
  const isLocked = useStore(s => s.currentWeek.isLocked)
  const setMealType = useStore(s => s.setMealType)
  const setServings = useStore(s => s.setServings)

  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 bg-white border-b border-warm-line">
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
        <span className="text-xs text-warm-gray font-medium">Servings</span>
        <button
          onClick={() => !isLocked && setServings(Math.max(1, servings - 1))}
          disabled={isLocked || servings <= 1}
          className="w-7 h-7 rounded-full border border-warm-line flex items-center justify-center text-warm-gray
                     hover:border-terra-300 hover:text-terra-400 transition-colors duration-150 disabled:opacity-40"
        >
          −
        </button>
        <span className="w-5 text-center text-sm font-bold text-terra-500">{servings}</span>
        <button
          onClick={() => !isLocked && setServings(Math.min(12, servings + 1))}
          disabled={isLocked || servings >= 12}
          className="w-7 h-7 rounded-full border border-warm-line flex items-center justify-center text-warm-gray
                     hover:border-terra-300 hover:text-terra-400 transition-colors duration-150 disabled:opacity-40"
        >
          +
        </button>
      </div>
    </div>
  )
}
