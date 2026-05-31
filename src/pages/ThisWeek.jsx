import { useState } from 'react'
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

  const [swapContext, setSwapContext]       = useState(null)
  const [detailRecipe, setDetailRecipe]     = useState(null)
  const [locking, setLocking]          = useState(false)
  const [confirmNewWeek, setConfirmNewWeek] = useState(false)

  const { slots, isLocked, mealType, servings } = currentWeek

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
    const newSlots = generateWeek({ mealType, weekHistory, favourites, recipes })
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
  }

  return (
    <div>
      <header className="bg-terra-400 px-5 pt-4 pb-3 flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-cream-50 tracking-tight">The Scramble Cook</h1>
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
          <button
            onClick={handleScramble}
            className="w-full py-3.5 rounded-2xl bg-tomato-400 text-white font-bold text-base
                       hover:bg-tomato-500 active:scale-95 transition-all duration-150 shadow-card"
          >
            🎲 Scramble the Week
          </button>
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
              className="flex-1 py-3 rounded-2xl font-bold text-sm bg-sage-400 text-white
                         hover:bg-sage-500 transition-colors"
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
        {DAYS.map(day => (
          <DayCard
            key={day}
            dayKey={day}
            dayLabel={DAY_LABELS[day]}
            slots={slots[day]}
            mealType={mealType}
            isLocked={isLocked}
            recipes={recipes}
            onSwap={(d, slot) => setSwapContext({ day: d, slot })}
            onView={(id) => setDetailRecipe(recipes.find(r => r.id === id) ?? null)}
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
      />
    </div>
  )
}
