import { useState, useMemo } from 'react'
import { useStore } from '../context/AppContext'

const SORT_OPTIONS = [
  { key: 'az',   label: 'A–Z' },
  { key: 'time', label: 'Time ↑' },
  { key: 'kcal', label: 'Kcal ↑' },
  { key: 'fav',  label: '★ First' },
]

export default function SwapPicker({ isOpen, onClose, day, slot, recipes, onSelect, currentRecipeId }) {
  const [search,  setSearch]  = useState('')
  const [favOnly, setFavOnly] = useState(false)
  const [cuisine, setCuisine] = useState('')
  const [protein, setProtein] = useState('')
  const [sort,    setSort]    = useState('az')
  const favourites = useStore(s => s.favourites)

  const slotRecipes = useMemo(() =>
    recipes.filter(r => r.mealType.includes(slot)),
    [recipes, slot]
  )

  const cuisines = useMemo(() => [...new Set(slotRecipes.map(r => r.cuisine))].sort(), [slotRecipes])
  const proteins = useMemo(() => [...new Set(slotRecipes.map(r => r.protein))].sort(), [slotRecipes])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    let list = slotRecipes.filter(r => {
      if (q && !r.name.toLowerCase().includes(q)) return false
      if (favOnly && !favourites.includes(r.id)) return false
      if (cuisine && r.cuisine !== cuisine) return false
      if (protein && r.protein !== protein) return false
      return true
    })
    if (sort === 'az')   list = [...list].sort((a, b) => a.name.localeCompare(b.name))
    if (sort === 'time') list = [...list].sort((a, b) => (a.prepTime + a.cookTime) - (b.prepTime + b.cookTime))
    if (sort === 'kcal') list = [...list].sort((a, b) => (a.nutrition?.calories ?? 0) - (b.nutrition?.calories ?? 0))
    if (sort === 'fav')  list = [...list].sort((a, b) =>
      (favourites.includes(a.id) ? 0 : 1) - (favourites.includes(b.id) ? 0 : 1)
    )
    return list
  }, [slotRecipes, search, favOnly, cuisine, protein, sort, favourites])

  const currentRecipe = currentRecipeId ? recipes.find(r => r.id === currentRecipeId) : null

  const handleSelect = (recipeId) => {
    onSelect(day, slot, recipeId)
    handleClose()
  }

  const handleClose = () => {
    setSearch('')
    setFavOnly(false)
    setCuisine('')
    setProtein('')
    setSort('az')
    onClose()
  }

  return (
    <div
      className={`fixed inset-0 z-50 bg-cream-50 flex flex-col transition-transform duration-300 ease-out
        ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3 bg-white border-b border-warm-line">
        <div className="flex items-center gap-2 mb-0.5">
          <button
            onClick={handleClose}
            className="p-1.5 -ml-1.5 rounded-lg text-warm-gray hover:text-terra-400 hover:bg-cream-100 transition-colors"
          >
            <ChevronLeftIcon />
          </button>
          <h2 className="text-base font-bold text-gray-800">
            Pick a {slot === 'lunch' ? 'Lunch' : 'Dinner'}
          </h2>
        </div>
        {currentRecipe && (
          <p className="text-xs text-warm-muted ml-8">
            Replacing: <span className="font-medium text-warm-gray">{currentRecipe.name}</span>
          </p>
        )}
      </div>

      {/* Search */}
      <div className="px-4 pt-3 pb-2 bg-white">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-muted" />
          <input
            type="text"
            placeholder="Search recipes…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-warm-line rounded-xl bg-cream-50
                       focus:outline-none focus:border-terra-300 transition-colors"
          />
        </div>
      </div>

      {/* Filter pills */}
      <div className="bg-white border-b border-warm-line pb-3 px-4">
        <div className="flex gap-2 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none' }}>
          <button
            onClick={() => setFavOnly(v => !v)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors
              ${favOnly ? 'bg-terra-400 border-terra-400 text-white' : 'border-warm-line text-warm-gray hover:border-terra-300'}`}
          >
            ★ Favourites
          </button>
          {cuisines.map(c => (
            <button
              key={c}
              onClick={() => setCuisine(v => v === c ? '' : c)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors capitalize
                ${cuisine === c ? 'bg-terra-400 border-terra-400 text-white' : 'border-warm-line text-warm-gray hover:border-terra-300'}`}
            >
              {c}
            </button>
          ))}
          {proteins.map(p => (
            <button
              key={p}
              onClick={() => setProtein(v => v === p ? '' : p)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors capitalize
                ${protein === p ? 'bg-terra-400 border-terra-400 text-white' : 'border-warm-line text-warm-gray hover:border-terra-300'}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Sort + count */}
      <div className="px-4 py-2 flex items-center justify-between">
        <span className="text-xs text-warm-muted">{filtered.length} recipes</span>
        <div className="flex items-center gap-1">
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.key}
              onClick={() => setSort(opt.key)}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors
                ${sort === opt.key ? 'bg-terra-400 text-white' : 'text-warm-gray hover:text-terra-400'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Recipe list */}
      <div className="flex-1 overflow-y-auto px-4 pb-8">
        {filtered.length === 0 ? (
          <p className="text-center text-sm text-warm-muted py-12">No recipes match</p>
        ) : (
          <ul className="divide-y divide-warm-line">
            {filtered.map(recipe => {
              const isCurrent = recipe.id === currentRecipeId
              const isFav = favourites.includes(recipe.id)
              return (
                <li key={recipe.id}>
                  <button
                    onClick={() => !isCurrent && handleSelect(recipe.id)}
                    disabled={isCurrent}
                    className={`w-full flex items-center gap-3 py-3.5 text-left transition-colors rounded-xl
                      ${isCurrent ? 'opacity-40 cursor-default' : 'hover:bg-cream-100 -mx-2 px-2'}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-sm font-semibold text-gray-800 leading-snug">{recipe.name}</p>
                        {isCurrent && <span className="text-xs text-warm-muted">(current)</span>}
                      </div>
                      <p className="text-xs text-warm-gray mt-0.5 capitalize">
                        {recipe.cuisine} · {recipe.protein} · {recipe.prepTime + recipe.cookTime}m
                        {recipe.nutrition?.calories ? ` · ${recipe.nutrition.calories} kcal` : ''}
                      </p>
                    </div>
                    {isFav && <StarIcon className="w-4 h-4 text-amber-400 shrink-0" />}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

function ChevronLeftIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M15 18l-6-6 6-6" />
    </svg>
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

function StarIcon({ className }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}
