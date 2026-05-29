import { useMemo, useState } from 'react'
import { useStore } from '../context/AppContext'
import { buildShoppingList, buildShoppingListByDay, buildCopyText } from '../utils/shoppingList'
import ShoppingItem from '../components/ShoppingItem'
import allRecipes from '../data/recipes.json'

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const DAY_SHORT = {
  monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu',
  friday: 'Fri', saturday: 'Sat', sunday: 'Sun',
}
const MEAL_OPTIONS = [['lunch', 'Lunch only'], ['dinner', 'Dinner only'], ['both', 'Both']]

export default function ShoppingList() {
  const slots               = useStore(s => s.currentWeek.slots)
  const servings            = useStore(s => s.currentWeek.servings)
  const shoppingListChecked = useStore(s => s.shoppingListChecked)
  const toggleShoppingItem  = useStore(s => s.toggleShoppingItem)

  const weekRecipeIds = useMemo(() => {
    const ids = new Set()
    for (const day of Object.values(slots)) {
      if (day.lunch  && !day.lunchSkipped)  ids.add(day.lunch)
      if (day.dinner && !day.dinnerSkipped) ids.add(day.dinner)
    }
    return ids
  }, [slots])

  const weekRecipes = useMemo(
    () => allRecipes.filter(r => weekRecipeIds.has(r.id)).sort((a, b) => a.name.localeCompare(b.name)),
    [weekRecipeIds]
  )

  const [copied,       setCopied]       = useState(false)
  const [filtersOpen,  setFiltersOpen]  = useState(false)
  const [sortMode,     setSortMode]     = useState('category')
  const [mealFilter,   setMealFilter]   = useState('both')
  const [activeDays,   setActiveDays]   = useState(() => new Set(DAYS))
  const [activeRecipes, setActiveRecipes] = useState(() => new Set(weekRecipeIds))

  const toggleDay = (day) => setActiveDays(prev => {
    const next = new Set(prev)
    next.has(day) ? next.delete(day) : next.add(day)
    return next
  })

  const toggleRecipe = (id) => setActiveRecipes(prev => {
    const next = new Set(prev)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })

  const filterCount = (mealFilter !== 'both' ? 1 : 0)
    + (DAYS.length - activeDays.size)
    + (weekRecipeIds.size - activeRecipes.size)

  const isFiltered = filterCount > 0

  const resetFilters = () => {
    setMealFilter('both')
    setActiveDays(new Set(DAYS))
    setActiveRecipes(new Set(weekRecipeIds))
  }

  const filteredSlots = useMemo(() => {
    const empty = { lunch: null, dinner: null, lunchSkipped: false, dinnerSkipped: false }
    return Object.fromEntries(
      DAYS.map(day => {
        if (!activeDays.has(day)) return [day, empty]
        const s = slots[day]
        return [day, {
          ...s,
          lunch:  (mealFilter !== 'dinner' && s.lunch  && activeRecipes.has(s.lunch))  ? s.lunch  : null,
          dinner: (mealFilter !== 'lunch'  && s.dinner && activeRecipes.has(s.dinner)) ? s.dinner : null,
        }]
      })
    )
  }, [slots, activeDays, mealFilter, activeRecipes])

  const groups = useMemo(
    () => buildShoppingList(filteredSlots, allRecipes, servings),
    [filteredSlots, servings]
  )

  const dayGroups = useMemo(
    () => buildShoppingListByDay(filteredSlots, allRecipes, servings),
    [filteredSlots, servings]
  )

  const totalItems   = sortMode === 'day'
    ? dayGroups.reduce((n, d) => n + d.meals.reduce((m, meal) => m + meal.ingredients.length, 0), 0)
    : groups.reduce((n, g) => n + g.items.length, 0)
  const checkedCount = Object.values(shoppingListChecked).filter(Boolean).length

  const handleCopy = () => {
    const text = buildCopyText(groups, allRecipes)
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div>
      <header className="px-4 pt-5 pb-3 flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-terra-500 tracking-tight">Shopping List</h1>
          <p className="text-sm text-warm-gray mt-0.5">
            {checkedCount}/{totalItems} items ticked
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFiltersOpen(o => !o)}
            className={`relative px-3 py-2 rounded-xl text-sm font-semibold transition-colors
              ${filtersOpen || isFiltered
                ? 'bg-terra-400 text-white'
                : 'border border-warm-line text-warm-gray hover:border-terra-300 hover:text-terra-400'}`}
          >
            Filters
            {filterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-sage-400 text-white
                               text-xs flex items-center justify-center font-bold leading-none">
                {filterCount}
              </span>
            )}
          </button>
          <button
            onClick={handleCopy}
            className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors
              ${copied
                ? 'bg-sage-400 text-white'
                : 'border border-warm-line text-warm-gray hover:border-terra-300 hover:text-terra-400'}`}
          >
            {copied ? '✓ Copied!' : 'Copy'}
          </button>
        </div>
      </header>

      <div className="px-4 pb-2 flex items-center gap-2">
        <span className="text-xs text-warm-muted font-medium">Group by</span>
        {[['category', 'Category'], ['day', 'Day']].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setSortMode(val)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors
              ${sortMode === val ? 'bg-terra-400 text-white' : 'bg-cream-200 text-warm-gray hover:bg-cream-300'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {filtersOpen && (
        <div className="px-4 pb-3">
          <div className="bg-white rounded-2xl shadow-card p-4 space-y-4">
            {/* Meal type */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-warm-muted mb-2">Meal</p>
              <div className="flex gap-2 flex-wrap">
                {MEAL_OPTIONS.map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => setMealFilter(val)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors
                      ${mealFilter === val ? 'bg-terra-400 text-white' : 'bg-cream-200 text-warm-gray hover:bg-cream-300'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Days */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-warm-muted mb-2">Days</p>
              <div className="flex flex-wrap gap-1.5">
                {DAYS.map(day => (
                  <button
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors
                      ${activeDays.has(day) ? 'bg-terra-400 text-white' : 'bg-warm-line text-warm-muted'}`}
                  >
                    {DAY_SHORT[day]}
                  </button>
                ))}
              </div>
            </div>

            {/* Dishes */}
            {weekRecipes.length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-warm-muted mb-2">Dishes</p>
                <div className="flex flex-wrap gap-1.5">
                  {weekRecipes.map(r => (
                    <button
                      key={r.id}
                      onClick={() => toggleRecipe(r.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors
                        ${activeRecipes.has(r.id) ? 'bg-terra-400 text-white' : 'bg-warm-line text-warm-muted'}`}
                    >
                      {r.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isFiltered && (
              <button
                onClick={resetFilters}
                className="text-xs text-terra-400 underline underline-offset-2"
              >
                Reset filters
              </button>
            )}
          </div>
        </div>
      )}

      <div className="px-4 pb-4 space-y-4">
        {sortMode === 'category' ? (
          <>
            {groups.map(group => (
              <div key={group.category} className="bg-white rounded-2xl shadow-card overflow-hidden">
                <div className="px-4 py-2.5 bg-cream-200 border-b border-warm-line">
                  <span className="text-xs font-bold uppercase tracking-widest text-warm-gray">
                    {group.label}
                  </span>
                </div>
                <ul className="divide-y divide-warm-line px-4">
                  {group.items.map(item => {
                    const uniqueNames = [...new Set(item.recipeIds.map(id => allRecipes.find(r => r.id === id)?.name).filter(Boolean))]
                    return (
                      <ShoppingItem
                        key={item.ingredientKey}
                        name={item.name}
                        quantity={item.quantity}
                        unit={item.unit}
                        recipeNames={uniqueNames}
                        checked={!!shoppingListChecked[item.ingredientKey]}
                        onToggle={() => toggleShoppingItem(item.ingredientKey)}
                      />
                    )
                  })}
                </ul>
              </div>
            ))}
            {groups.length === 0 && (
              <div className="text-center py-12 text-warm-muted text-sm">
                {isFiltered ? 'No ingredients match the active filters.' : 'No ingredients to list — all slots are empty or skipped.'}
              </div>
            )}
          </>
        ) : (
          <>
            {dayGroups.map(({ day, label, meals }) => (
              <div key={day} className="bg-white rounded-2xl shadow-card overflow-hidden">
                <div className="px-4 py-2.5 bg-cream-200 border-b border-warm-line">
                  <span className="text-xs font-bold uppercase tracking-widest text-warm-gray">{label}</span>
                </div>
                {meals.map(meal => (
                  <div key={meal.slot}>
                    <div className="px-4 pt-3 pb-1">
                      <span className="text-xs font-semibold text-warm-muted capitalize">{meal.slot} · {meal.recipeName}</span>
                    </div>
                    <ul className="divide-y divide-warm-line px-4">
                      {meal.ingredients.map((ing, i) => (
                        <ShoppingItem
                          key={`${day}-${meal.slot}-${i}`}
                          name={ing.name}
                          quantity={ing.scaledQty}
                          unit={ing.unit}
                          recipeNames={[]}
                          checked={!!shoppingListChecked[ing.ingredientKey]}
                          onToggle={() => toggleShoppingItem(ing.ingredientKey)}
                        />
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ))}
            {dayGroups.length === 0 && (
              <div className="text-center py-12 text-warm-muted text-sm">
                {isFiltered ? 'No ingredients match the active filters.' : 'No ingredients to list — all slots are empty or skipped.'}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
