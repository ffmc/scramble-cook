const DAYS_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const DAY_LABELS  = { monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday', thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday' }

const CATEGORY_ORDER = ['proteins', 'vegetables', 'aromatics', 'pantry', 'dairy', 'condiments']

const CATEGORY_LABELS = {
  proteins:   '🥩 Proteins',
  vegetables: '🥦 Vegetables & Greens',
  aromatics:  '🧄 Aromatics & Herbs',
  pantry:     '🥫 Pantry & Dry Goods',
  dairy:      '🧈 Dairy & Eggs',
  condiments: '🍋 Condiments & Sauces',
}

export function buildShoppingList(slots, recipes, servings) {
  const activeRecipes = []
  for (const day of Object.values(slots)) {
    if (day.lunch && !day.lunchSkipped) activeRecipes.push(day.lunch)
    if (day.dinner && !day.dinnerSkipped) activeRecipes.push(day.dinner)
  }

  const mergeMap = {}

  for (const recipeId of activeRecipes) {
    const recipe = recipes.find(r => r.id === recipeId)
    if (!recipe) continue
    const scale = servings / recipe.servings

    for (const ing of recipe.ingredients) {
      const normName = ing.name.trim().toLowerCase()
      const mapKey = `${ing.category}__${normName}__${ing.unit ?? ''}`

      if (!mergeMap[mapKey]) {
        mergeMap[mapKey] = {
          name: ing.name,
          category: ing.category,
          quantity: 0,
          unit: ing.unit,
          recipeIds: [],
          ingredientKey: `${ing.category}__${normName}`,
        }
      }

      mergeMap[mapKey].quantity += (ing.quantity ?? 0) * scale
      if (!mergeMap[mapKey].recipeIds.includes(recipeId)) {
        mergeMap[mapKey].recipeIds.push(recipeId)
      }
    }
  }

  const grouped = {}
  for (const item of Object.values(mergeMap)) {
    if (!grouped[item.category]) grouped[item.category] = []
    grouped[item.category].push(item)
  }

  return CATEGORY_ORDER.filter(cat => grouped[cat]?.length > 0).map(cat => ({
    category: cat,
    label: CATEGORY_LABELS[cat],
    items: grouped[cat],
  }))
}

export function buildShoppingListByDay(slots, recipes, servings) {
  return DAYS_ORDER
    .map(day => {
      const s = slots[day]
      const meals = []

      for (const [slot, recipeKey, skippedKey] of [
        ['lunch',  'lunch',  'lunchSkipped'],
        ['dinner', 'dinner', 'dinnerSkipped'],
      ]) {
        if (!s[recipeKey] || s[skippedKey]) continue
        const recipe = recipes.find(r => r.id === s[recipeKey])
        if (!recipe) continue
        const scale = servings / recipe.servings
        meals.push({
          slot,
          recipeName: recipe.name,
          ingredients: recipe.ingredients.map(ing => ({
            name: ing.name,
            category: ing.category,
            unit: ing.unit,
            ingredientKey: `${ing.category}__${ing.name.trim().toLowerCase()}`,
            scaledQty: ing.quantity ? ing.quantity * scale : null,
          })),
        })
      }

      return meals.length > 0 ? { day, label: DAY_LABELS[day], meals } : null
    })
    .filter(Boolean)
}

export function buildCopyText(groups, recipes) {
  return groups
    .map(group => {
      const header = group.label
      const items = group.items
        .map(item => {
          const qty =
            item.quantity && item.quantity > 0
              ? ` – ${formatQty(item.quantity)}${item.unit ?? ''}`
              : ''
          const recipeNames = [...new Set(item.recipeIds.map(id => recipes.find(r => r.id === id)?.name).filter(Boolean))]
          return `• ${item.name}${qty} (${recipeNames.join(', ')})`
        })
        .join('\n')
      return `${header}\n${items}`
    })
    .join('\n\n')
}

export function formatQty(n) {
  const rounded = Math.round(n * 10) / 10
  return Number.isInteger(rounded) ? String(rounded) : String(rounded)
}
