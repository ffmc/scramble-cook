import { useStore } from '../context/AppContext'

const PROTEIN_COLOURS = {
  chicken:    'bg-terra-100 text-terra-500',
  beef:       'bg-amber-100 text-amber-700',
  shrimp:     'bg-blue-100 text-blue-700',
  salmon:     'bg-orange-100 text-orange-700',
  fish:       'bg-sky-100 text-sky-700',
  lamb:       'bg-purple-100 text-purple-700',
  pork:       'bg-pink-100 text-pink-700',
  eggs:       'bg-yellow-100 text-yellow-700',
  vegetarian: 'bg-sage-100 text-sage-500',
}

const PROTEIN_DEFAULT = 'bg-warm-line text-warm-gray'

export default function DayCard({ dayKey, dayLabel, slots, mealType, isLocked, recipes, onSwap, onView }) {
  const showLunch  = mealType === 'lunch'  || mealType === 'both'
  const showDinner = mealType === 'dinner' || mealType === 'both'
  const skipSlot   = useStore(s => s.skipSlot)

  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden">
      <div className="px-4 py-2 bg-cream-200 border-b border-warm-line">
        <span className="text-xs font-bold uppercase tracking-widest text-warm-gray">{dayLabel}</span>
      </div>
      <div className="divide-y divide-warm-line">
        {showLunch  && (
          <SlotRow slot="lunch"  dayKey={dayKey} slots={slots} isLocked={isLocked} recipes={recipes} onSwap={onSwap} skipSlot={skipSlot} onView={onView} />
        )}
        {showDinner && (
          <SlotRow slot="dinner" dayKey={dayKey} slots={slots} isLocked={isLocked} recipes={recipes} onSwap={onSwap} skipSlot={skipSlot} onView={onView} />
        )}
      </div>
    </div>
  )
}

function SlotRow({ slot, dayKey, slots, isLocked, recipes, onSwap, skipSlot, onView }) {
  const recipeId  = slots[slot]
  const skipped   = slots[slot === 'lunch' ? 'lunchSkipped' : 'dinnerSkipped']
  const recipe    = recipeId ? recipes.find(r => r.id === recipeId) : null
  const slotLabel = slot === 'lunch' ? 'Lunch' : 'Dinner'

  if (skipped) {
    return (
      <div className="px-4 py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-warm-muted">{slotLabel}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-warm-line text-warm-muted">Not home</span>
        </div>
        {!isLocked && (
          <button
            onClick={() => skipSlot(dayKey, slot, false)}
            className="text-xs text-terra-400 underline underline-offset-2"
          >
            Undo
          </button>
        )}
      </div>
    )
  }

  if (!recipe) {
    return (
      <div className="px-4 py-3 flex items-center gap-2">
        <span className="text-xs font-semibold text-warm-muted">{slotLabel}</span>
        {!isLocked ? (
          <button
            onClick={() => onSwap(dayKey, slot)}
            className="text-xs text-terra-300 hover:text-terra-400 transition-colors"
          >
            + Add recipe
          </button>
        ) : (
          <span className="text-xs text-warm-muted italic">—</span>
        )}
      </div>
    )
  }

  const proteinClass = PROTEIN_COLOURS[recipe.protein] ?? PROTEIN_DEFAULT

  return (
    <div className="px-4 py-3">
      <div className="flex items-start justify-between gap-2">
        <button
          onClick={() => onView?.(recipe.id)}
          className="flex-1 min-w-0 text-left"
        >
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-xs font-semibold text-warm-muted">{slotLabel}</span>
          </div>
          <p className="text-sm font-semibold text-gray-800 leading-snug truncate">{recipe.name}</p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="text-xs text-warm-gray">⏱ {recipe.prepTime + recipe.cookTime}m</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${proteinClass}`}>
              {recipe.protein}
            </span>
          </div>
        </button>
        {!isLocked && (
          <div className="flex items-center gap-1 shrink-0 mt-1">
            <button
              onClick={() => onSwap(dayKey, slot)}
              className="p-1.5 rounded-lg hover:bg-cream-200 text-warm-gray hover:text-terra-400 transition-colors"
              title="Swap recipe"
            >
              <SwapIcon />
            </button>
            <button
              onClick={() => skipSlot(dayKey, slot)}
              className="p-1.5 rounded-lg hover:bg-cream-200 text-warm-gray hover:text-red-400 transition-colors"
              title="Remove"
            >
              <XIcon />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function SwapIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M7 16V4m0 0L3 8m4-4 4 4M17 8v12m0 0 4-4m-4 4-4-4" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}
