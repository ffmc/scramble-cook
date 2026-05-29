import { useState, useMemo } from 'react'
import BottomSheet from './BottomSheet'
import { useStore } from '../context/AppContext'

export default function SwapPicker({ isOpen, onClose, day, slot, recipes, onSelect }) {
  const [search, setSearch] = useState('')
  const favourites = useStore(s => s.favourites)

  const filtered = useMemo(() => {
    const targetMeal = slot
    const q = search.toLowerCase()
    return recipes.filter(r =>
      r.mealType.includes(targetMeal) &&
      r.name.toLowerCase().includes(q)
    )
  }, [recipes, slot, search])

  const handleSelect = (recipeId) => {
    onSelect(day, slot, recipeId)
    setSearch('')
    onClose()
  }

  const handleClose = () => {
    setSearch('')
    onClose()
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose} maxHeight="65vh">
      <div className="px-4 pt-2 pb-3 sticky top-0 bg-white z-10 border-b border-warm-line">
        <h2 className="text-base font-bold text-gray-800 mb-3">
          Pick a {slot === 'lunch' ? 'Lunch' : 'Dinner'} Recipe
        </h2>
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-muted" />
          <input
            type="text"
            placeholder="Search recipes…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-warm-line rounded-xl bg-cream-50
                       focus:outline-none focus:border-terra-300 transition-colors"
          />
        </div>
      </div>

      <ul className="divide-y divide-warm-line px-4">
        {filtered.map(recipe => (
          <li key={recipe.id}>
            <button
              onClick={() => handleSelect(recipe.id)}
              className="w-full flex items-center gap-3 py-3 text-left hover:bg-cream-50 rounded-lg -mx-1 px-1 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 leading-snug">{recipe.name}</p>
                <p className="text-xs text-warm-gray mt-0.5">
                  {recipe.protein} · {recipe.prepTime + recipe.cookTime}m
                  {favourites.includes(recipe.id) ? ' · ★' : ''}
                </p>
              </div>
            </button>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="py-8 text-center text-sm text-warm-muted">No recipes found</li>
        )}
      </ul>
    </BottomSheet>
  )
}

function SearchIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  )
}
