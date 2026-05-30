import { useState, useMemo } from 'react'
import { useStore } from '../context/AppContext'
import RecipeCard from '../components/RecipeCard'
import RecipeDetail from '../components/RecipeDetail'
import ImportRecipe from '../components/ImportRecipe'

const PREP_RANGES = [
  { label: 'Under 20m', max: 20 },
  { label: '20–30m',    min: 20, max: 30 },
  { label: '30–45m',    min: 30, max: 45 },
]

const EMPTY_FILTERS = { cuisine: '', protein: '', mealType: '', prepRange: '', tags: [] }

export default function Recipes() {
  const favourites        = useStore(s => s.favourites)
  const toggleFavourite   = useStore(s => s.toggleFavourite)
  const allRecipes        = useStore(s => s.recipes)

  const [search,      setSearch]      = useState('')
  const [filters,     setFilters]     = useState(EMPTY_FILTERS)
  const [selectedId,  setSelectedId]  = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  const [showImport,  setShowImport]  = useState(false)

  const CUISINES = useMemo(() => [...new Set(allRecipes.map(r => r.cuisine))].sort(), [allRecipes])
  const PROTEINS = useMemo(() => [...new Set(allRecipes.map(r => r.protein))].sort(), [allRecipes])
  const ALL_TAGS = useMemo(() => [...new Set(allRecipes.flatMap(r => r.tags))].sort(), [allRecipes])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return allRecipes.filter(r => {
      if (q && !r.name.toLowerCase().includes(q)) return false
      if (filters.cuisine  && r.cuisine !== filters.cuisine)           return false
      if (filters.protein  && r.protein !== filters.protein)           return false
      if (filters.mealType && !r.mealType.includes(filters.mealType))  return false
      if (filters.tags.length > 0 && !filters.tags.every(t => r.tags.includes(t))) return false
      if (filters.prepRange) {
        const range = PREP_RANGES.find(p => p.label === filters.prepRange)
        const total = r.prepTime + r.cookTime
        if (range) {
          if (range.max  !== undefined && total >= range.max) return false
          if (range.min  !== undefined && total < range.min)  return false
        }
      }
      return true
    })
  }, [search, filters, allRecipes])

  const selectedRecipe = selectedId ? allRecipes.find(r => r.id === selectedId) : null

  const setFilter = (key, value) => setFilters(f => ({ ...f, [key]: value }))

  const toggleTag = (tag) =>
    setFilters(f => ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag],
    }))

  const activeFilterCount =
    (filters.cuisine ? 1 : 0) + (filters.protein ? 1 : 0) +
    (filters.mealType ? 1 : 0) + (filters.prepRange ? 1 : 0) + filters.tags.length

  return (
    <div>
      <header className="px-4 pt-5 pb-3 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-terra-500 tracking-tight">Recipes</h1>
        <button
          onClick={() => setShowImport(true)}
          className="px-3 py-2 rounded-xl bg-terra-400 text-white text-sm font-semibold hover:bg-terra-500 transition-colors"
        >
          + Import
        </button>
      </header>

      {/* Search bar */}
      <div className="px-4 pb-3 flex gap-2">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-muted" />
          <input
            type="text"
            placeholder="Search recipes…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-warm-line rounded-xl bg-white
                       focus:outline-none focus:border-terra-300 transition-colors"
          />
        </div>
        <button
          onClick={() => setShowFilters(v => !v)}
          className={`px-3 py-2.5 rounded-xl border text-sm font-semibold transition-colors
            ${activeFilterCount > 0
              ? 'bg-terra-400 border-terra-400 text-white'
              : 'border-warm-line text-warm-gray hover:border-terra-300'}`}
        >
          Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="mx-4 mb-3 p-4 bg-white rounded-2xl shadow-card space-y-3">
          <FilterRow label="Cuisine">
            <PillSelect
              options={CUISINES}
              value={filters.cuisine}
              onChange={v => setFilter('cuisine', v)}
            />
          </FilterRow>
          <FilterRow label="Protein">
            <PillSelect
              options={PROTEINS}
              value={filters.protein}
              onChange={v => setFilter('protein', v)}
            />
          </FilterRow>
          <FilterRow label="Meal">
            <PillSelect
              options={['lunch', 'dinner']}
              value={filters.mealType}
              onChange={v => setFilter('mealType', v)}
            />
          </FilterRow>
          <FilterRow label="Time">
            <PillSelect
              options={PREP_RANGES.map(p => p.label)}
              value={filters.prepRange}
              onChange={v => setFilter('prepRange', v)}
            />
          </FilterRow>
          <FilterRow label="Tags">
            <div className="flex flex-wrap gap-1.5">
              {ALL_TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors
                    ${filters.tags.includes(tag)
                      ? 'bg-sage-400 text-white'
                      : 'bg-cream-200 text-warm-gray hover:bg-sage-100 hover:text-sage-500'}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </FilterRow>
          {activeFilterCount > 0 && (
            <button
              onClick={() => setFilters(EMPTY_FILTERS)}
              className="text-xs text-terra-400 underline underline-offset-2"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Recipe grid */}
      <div className="px-4 pb-4 grid grid-cols-2 gap-3">
        {filtered.map(recipe => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            isFavourite={favourites.includes(recipe.id)}
            onClick={() => setSelectedId(recipe.id)}
            onToggleFavourite={toggleFavourite}
          />
        ))}
        {filtered.length === 0 && (
          <p className="col-span-2 text-center text-sm text-warm-muted py-12">No recipes match your filters</p>
        )}
      </div>

      <RecipeDetail
        recipe={selectedRecipe}
        isOpen={!!selectedId}
        onClose={() => setSelectedId(null)}
        isFavourite={selectedRecipe ? favourites.includes(selectedRecipe.id) : false}
        onToggleFavourite={toggleFavourite}
      />

      <ImportRecipe isOpen={showImport} onClose={() => setShowImport(false)} />
    </div>
  )
}

function FilterRow({ label, children }) {
  return (
    <div>
      <p className="text-xs font-bold text-warm-muted uppercase tracking-wider mb-1.5">{label}</p>
      {children}
    </div>
  )
}

function PillSelect({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => onChange(value === opt ? '' : opt)}
          className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors capitalize
            ${value === opt
              ? 'bg-terra-400 text-white'
              : 'bg-cream-200 text-warm-gray hover:bg-terra-100 hover:text-terra-500'}`}
        >
          {opt}
        </button>
      ))}
    </div>
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
