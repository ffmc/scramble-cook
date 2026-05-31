const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

const emptyDaySlot = () => ({ lunch: null, dinner: null, lunchSkipped: false, dinnerSkipped: false })

export function generateWeek({ mealType, weekHistory, favourites, recipes, activeDays = DAYS }) {
  const previousIds =
    weekHistory.length > 0
      ? Object.values(weekHistory[0].slots)
          .flatMap(s => [s.lunch, s.dinner])
          .filter(Boolean)
      : []

  const slots = Object.fromEntries(DAYS.map(d => [d, emptyDaySlot()]))
  const usedProteins = []
  const activeDaySet = new Set(activeDays)

  for (let i = 0; i < DAYS.length; i++) {
    const day = DAYS[i]
    if (!activeDaySet.has(day)) continue

    const prevProtein = i > 0 ? usedProteins[i - 1] : null
    const usedThisWeek = Object.values(slots)
      .flatMap(s => [s.lunch, s.dinner])
      .filter(Boolean)

    if (mealType === 'lunch' || mealType === 'both') {
      slots[day].lunch = pickRecipe({ targetMeal: 'lunch', previousIds, usedThisWeek, prevProtein, favourites, recipes })
    }

    if (mealType === 'dinner' || mealType === 'both') {
      const afterLunch = slots[day].lunch ? [slots[day].lunch] : []
      const lunchProtein = slots[day].lunch ? recipes.find(r => r.id === slots[day].lunch)?.protein : null
      slots[day].dinner = pickRecipe({
        targetMeal: 'dinner',
        previousIds,
        usedThisWeek: [...usedThisWeek, ...afterLunch],
        prevProtein,
        sameDayProtein: lunchProtein,
        favourites,
        recipes,
      })
    }

    const lunchProtein = slots[day].lunch ? recipes.find(r => r.id === slots[day].lunch)?.protein : null
    const dinnerProtein = slots[day].dinner ? recipes.find(r => r.id === slots[day].dinner)?.protein : null
    usedProteins[i] = dinnerProtein || lunchProtein
  }

  return slots
}

function pickRecipe({ targetMeal, previousIds, usedThisWeek, prevProtein, sameDayProtein, favourites, recipes }) {
  const pool = recipes.filter(
    r =>
      r.mealType.includes(targetMeal) &&
      !previousIds.includes(r.id) &&
      !usedThisWeek.includes(r.id)
  )

  if (pool.length === 0) return null

  const weighted = pool.flatMap(r => {
    const favBoost    = favourites.includes(r.id) ? 1.5 : 1
    const proteinHit  = r.protein === prevProtein    ? 0.5 : 1
    const sameDayHit  = r.protein === sameDayProtein ? 0.5 : 1
    const weight = Math.round(favBoost * proteinHit * sameDayHit * 2)
    return Array(Math.max(1, weight)).fill(r.id)
  })

  return weighted[Math.floor(Math.random() * weighted.length)]
}
