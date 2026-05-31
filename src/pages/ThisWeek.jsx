import { useState, useEffect } from 'react'
import { useStore } from '../context/AppContext'
import { generateWeek } from '../utils/generator'
import WeekSetup from '../components/WeekSetup'
import DayCard from '../components/DayCard'
import SwapPicker from '../components/SwapPicker'
import RecipeDetail from '../components/RecipeDetail'
import { getStoredHousehold, clearHousehold } from '../lib/household'

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const DAY_LABELS = {
  monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday',
  thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday',
}

export default function ThisWeek() {
  const currentWeek        = useStore(s => s.currentWeek)
  const weekHistory        = useStore(s => s.weekHistory)
  const favourites         = useStore(s => s.favourites)
  const recipes            = useStore(s => s.recipes)
  const toggleFavourite    = useStore(s => s.toggleFavourite)
  const setWeekSlots       = useStore(s => s.setWeekSlots)
  const setSlot            = useStore(s => s.setSlot)
  const lockWeek           = useStore(s => s.lockWeek)
  const unlockWeek         = useStore(s => s.unlockWeek)
  const startNewWeek       = useStore(s => s.startNewWeek)
  const swapDaySlots       = useStore(s => s.swapDaySlots)

  const [swapContext, setSwapContext]         = useState(null)
  const [detailRecipe, setDetailRecipe]       = useState(null)
  const [locking, setLocking]                = useState(false)
  const [confirmNewWeek, setConfirmNewWeek]   = useState(false)
  const [collapsedDays, setCollapsedDays]    = useState(new Set())
  const [excludedProteins, setExcludedProteins]     = useState([])
  const [excludePreviousWeek, setExcludePreviousWeek] = useState(true)
  const [filtersOpen, setFiltersOpen]                = useState(false)

  const { slots, isLocked, mealType, servings, activeDays = DAYS } = currentWeek

  const allProteins = [...new Set(recipes.map(r => r.protein))].sort()

  const previousWeekIds = weekHistory.length > 0
    ? Object.values(weekHistory[0].slots).flatMap(s => [s.lunch, s.dinner]).filter(Boolean)
    : []

  const toggleExcludedProtein = (protein) =>
    setExcludedProteins(prev =>
      prev.includes(protein) ? prev.filter(p => p !== protein) : [...prev, protein]
    )

  const toggleCollapse = (day) =>
    setCollapsedDays(prev => {
      const next = new Set(prev)
      next.has(day) ? next.delete(day) : next.add(day)
      return next
    })

  useEffect(() => {
    if (!isLocked) {
      setCollapsedDays(new Set())
      return
    }
    const day = new Date().getDay()
    const todayIdx = day === 0 ? 0 : (day + 6) % 7 // Mon=0 … Sun=6; Sun=0 means planning next week
    const pastDays = DAYS.slice(0, todayIdx)
    setCollapsedDays(prev => new Set([...prev, ...pastDays]))
  }, [isLocked])

  const householdCode = getStoredHousehold()?.code

  const handleLogout = () => {
    clearHousehold()
    window.location.reload()
  }

  const hasAnyFilled = DAYS.some(d =>
    (mealType === 'lunch' || mealType === 'both')  ? slots[d].lunch  : false ||
    (mealType === 'dinner' || mealType === 'both') ? slots[d].dinner : false
  )

  const hasFilledSlot = DAYS.some(d => slots[d].lunch || slots[d].dinner)

  const handleScramble = () => {
    const newSlots = generateWeek({ mealType, weekHistory, favourites, recipes, activeDays, excludedProteins, excludePreviousWeek })
    setWeekSlots(newSlots)
  }

  const handleLock = () => {
    setLocking(true)
    setTimeout(() => {
      lockWeek()
      setLocking(false)
    }, 600)
  }

  const handleNewWeek = () => {
    startNewWeek()
    setConfirmNewWeek(false)
    setExcludedProteins([])
    setExcludePreviousWeek(true)
    setFiltersOpen(false)
  }

  return (
    <div>
      <header className="bg-terra-400 px-5 pt-4 pb-3 flex items-start justify-between gap-3">
        <div>
          <h1 className="font-brand text-2xl font-extrabold text-cream-50 tracking-tight">The Scramble Cook</h1>
          <p className="text-xs text-terra-200 mt-0.5">
            {isLocked ? '🔒 Week locked' : 'Plan your week'}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="shrink-0 text-[11px] font-medium text-terra-200 hover:text-cream-50 transition-colors text-right leading-tight mt-0.5"
        >
          {householdCode && <span className="block opacity-80">{householdCode}</span>}
          Switch code
        </button>
      </header>

      <WeekSetup />

      <div className="px-4 py-4 flex flex-col gap-3">
        {/* Action buttons */}
        {!isLocked && (
          <>
            <button
              onClick={handleScramble}
              className="w-full py-3.5 rounded-2xl bg-tomato-500 text-white font-bold text-base
                         hover:bg-tomato-600 active:scale-95 transition-all duration-150 shadow-card"
            >
              🎲 Scramble the Week
            </button>
            <div className="rounded-2xl border border-warm-line overflow-hidden">
              <button
                onClick={() => setFiltersOpen(v => !v)}
                className="w-full flex items-center justify-between px-4 py-2.5 bg-white text-left"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-warm-gray">Scramble filters</span>
                  {(excludedProteins.length > 0 || !excludePreviousWeek) && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-terra-400 text-white font-bold leading-none">
                      {excludedProteins.length + (!excludePreviousWeek ? 1 : 0)}
                    </span>
                  )}
                </div>
                <svg
                  className={`w-4 h-4 text-warm-muted transition-transform duration-200 ${filtersOpen ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path d="M18 15l-6-6-6 6" />
                </svg>
              </button>

              {filtersOpen && (
                <div className="px-4 pb-4 pt-2 bg-white border-t border-warm-line space-y-3">
                  {weekHistory.length > 0 && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-warm-muted mb-2">Last week</p>
                      <button
                        onClick={() => setExcludePreviousWeek(v => !v)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors
                          ${excludePreviousWeek
                            ? 'bg-warm-line border-warm-line text-warm-muted line-through'
                            : 'border-warm-line text-warm-gray hover:border-terra-300'}`}
                      >
                        Exclude last week
                      </button>
                    </div>
                  )}

                  {allProteins.length > 0 && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-warm-muted mb-2">Proteins</p>
                      <div className="flex flex-wrap gap-2">
                        {allProteins.map(protein => {
                          const excluded = excludedProteins.includes(protein)
                          return (
                            <button
                              key={protein}
                              onClick={() => toggleExcludedProtein(protein)}
                              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors capitalize
                                ${excluded
                                  ? 'bg-warm-line border-warm-line text-warm-muted line-through'
                                  : 'border-warm-line text-warm-gray hover:border-terra-300'}`}
                            >
                              {protein}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {!isLocked && hasFilledSlot && (
          <button
            onClick={handleLock}
            className={`w-full py-3 rounded-2xl font-bold text-sm border-2 transition-all duration-300
              ${locking
                ? 'scale-95 bg-sage-300 border-sage-300 text-white'
                : 'border-terra-400 text-terra-400 hover:bg-terra-400 hover:text-white'}`}
          >
            🔒 Lock the Week
          </button>
        )}

        {isLocked && (
          <div className="flex gap-2">
            <button
              onClick={unlockWeek}
              className="flex-1 py-3 rounded-2xl font-bold text-sm border-2 border-warm-line text-warm-gray
                         hover:border-terra-300 hover:text-terra-400 transition-colors"
            >
              🔓 Unlock
            </button>
            <button
              onClick={() => setConfirmNewWeek(true)}
              className="flex-1 py-3 rounded-2xl font-bold text-sm bg-tomato-500 text-white
                         hover:bg-tomato-600 transition-colors"
            >
              ✨ New Week
            </button>
          </div>
        )}

        {/* Confirm new week dialog */}
        {confirmNewWeek && (
          <div className="rounded-2xl border-2 border-terra-200 bg-terra-100 p-4 text-center">
            <p className="text-sm font-semibold text-terra-500 mb-3">
              Archive this week to History and start fresh?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmNewWeek(false)}
                className="flex-1 py-2 rounded-xl border border-warm-line text-warm-gray text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleNewWeek}
                className="flex-1 py-2 rounded-xl bg-terra-400 text-white text-sm font-semibold"
              >
                Start New Week
              </button>
            </div>
          </div>
        )}

        {/* Day cards */}
        {DAYS.filter(day => activeDays.includes(day)).map(day => (
          <DayCard
            key={day}
            dayKey={day}
            dayLabel={DAY_LABELS[day]}
            slots={slots[day]}
            mealType={mealType}
            isLocked={isLocked}
            recipes={recipes}
            onSwap={(d, slot, recipeId) => setSwapContext({ day: d, slot, recipeId })}
            onView={(id) => setDetailRecipe(recipes.find(r => r.id === id) ?? null)}
            isCollapsed={collapsedDays.has(day)}
            onToggleCollapse={() => toggleCollapse(day)}
            onSwapSlots={swapDaySlots}
          />
        ))}
      </div>

      <RecipeDetail
        recipe={detailRecipe}
        isOpen={!!detailRecipe}
        onClose={() => setDetailRecipe(null)}
        isFavourite={!!detailRecipe && favourites.includes(detailRecipe.id)}
        onToggleFavourite={toggleFavourite}
      />

      <SwapPicker
        isOpen={!!swapContext}
        onClose={() => setSwapContext(null)}
        day={swapContext?.day}
        slot={swapContext?.slot}
        recipes={recipes}
        onSelect={setSlot}
        currentRecipeId={swapContext?.recipeId}
        usedRecipeIds={Object.values(slots).flatMap(s => [s.lunch, s.dinner]).filter(Boolean)}
        previousWeekIds={previousWeekIds}
      />
    </div>
  )
}
