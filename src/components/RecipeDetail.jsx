import { useState } from 'react'
import BottomSheet from './BottomSheet'
import { formatQty } from '../utils/shoppingList'

const CATEGORY_LABELS = {
  proteins:   '🥩 Proteins',
  vegetables: '🥦 Vegetables',
  aromatics:  '🧄 Aromatics & Herbs',
  pantry:     '🥫 Pantry',
  dairy:      '🧈 Dairy & Eggs',
  condiments: '🍋 Condiments',
}

export default function RecipeDetail({ recipe, isOpen, onClose, isFavourite, onToggleFavourite }) {
  const [localServings, setLocalServings] = useState(null)

  const servings = localServings ?? recipe?.servings ?? 1

  const handleClose = () => {
    setLocalServings(null)
    onClose()
  }

  if (!recipe) return null

  const scale = servings / recipe.servings

  const ingredientsByCategory = recipe.ingredients.reduce((acc, ing) => {
    if (!acc[ing.category]) acc[ing.category] = []
    acc[ing.category].push(ing)
    return acc
  }, {})

  const categoryOrder = ['proteins', 'vegetables', 'aromatics', 'pantry', 'dairy', 'condiments']

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose}>
      <div className="px-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-4 border-b border-warm-line">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-warm-gray">{recipe.cuisine}</span>
            </div>
            <h2 className="text-lg font-extrabold text-gray-800 leading-snug">{recipe.name}</h2>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onToggleFavourite(recipe.id)}
              className={`text-2xl leading-none transition-transform duration-150 active:scale-110
                ${isFavourite ? 'text-amber-400' : 'text-warm-muted hover:text-amber-300'}`}
            >
              ★
            </button>
            <button
              onClick={handleClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-cream-200 text-warm-gray
                         hover:bg-cream-300 transition-colors text-lg leading-none"
            >
              ×
            </button>
          </div>
        </div>

        {/* Tags */}
        {recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 py-3 border-b border-warm-line">
            {recipe.tags.map(tag => (
              <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-sage-100 text-sage-500 font-medium">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Times + difficulty */}
        <div className="grid grid-cols-4 gap-2 py-3 border-b border-warm-line">
          <MetaStat label="Prep" value={`${recipe.prepTime}m`} />
          <MetaStat label="Cook" value={`${recipe.cookTime}m`} />
          <MetaStat label="Total" value={`${recipe.prepTime + recipe.cookTime}m`} />
          <MetaStat label="Level" value={recipe.difficulty} />
        </div>

        {/* Servings scaler */}
        <div className="flex items-center justify-between py-3 border-b border-warm-line">
          <span className="text-sm font-semibold text-gray-700">Servings</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLocalServings(Math.max(1, servings - 1))}
              className="w-8 h-8 rounded-full border border-warm-line flex items-center justify-center
                         text-warm-gray hover:border-terra-300 hover:text-terra-400 transition-colors"
            >
              −
            </button>
            <span className="w-6 text-center font-bold text-terra-500">{servings}</span>
            <button
              onClick={() => setLocalServings(servings + 1)}
              className="w-8 h-8 rounded-full border border-warm-line flex items-center justify-center
                         text-warm-gray hover:border-terra-300 hover:text-terra-400 transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {/* Ingredients */}
        <div className="py-4 border-b border-warm-line">
          <h3 className="text-sm font-bold text-gray-700 mb-3">Ingredients</h3>
          {categoryOrder
            .filter(cat => ingredientsByCategory[cat])
            .map(cat => (
              <div key={cat} className="mb-3">
                <p className="text-xs font-semibold text-warm-muted uppercase tracking-wider mb-1.5">
                  {CATEGORY_LABELS[cat]}
                </p>
                <ul className="space-y-1">
                  {ingredientsByCategory[cat].map((ing, i) => (
                    <li key={i} className="flex items-baseline justify-between text-sm">
                      <span className="text-gray-700">{ing.name}</span>
                      <span className="text-warm-gray text-xs ml-2 shrink-0">
                        {ing.quantity ? `${formatQty(ing.quantity * scale)}${ing.unit ? ' ' + ing.unit : ''}` : ing.unit}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
        </div>

        {/* Instructions */}
        <div className="py-4 border-b border-warm-line">
          <h3 className="text-sm font-bold text-gray-700 mb-3">Instructions</h3>
          <ol className="space-y-4">
            {recipe.instructions.map(({ step, text }) => (
              <li key={step} className="flex gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-terra-400 text-white text-xs
                                 flex items-center justify-center font-bold mt-0.5">
                  {step}
                </span>
                <p className="text-sm text-gray-700 leading-relaxed">{text}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* Nutrition — fixed per-serving values, not affected by the scaler */}
        <div className="py-4 border-b border-warm-line">
          <h3 className="text-sm font-bold text-gray-700 mb-3">Per serving</h3>
          <div className="grid grid-cols-4 gap-2">
            <NutritionCard label="Calories" value={Math.round(recipe.nutrition.calories / recipe.servings)} unit="kcal" />
            <NutritionCard label="Protein"  value={Math.round(recipe.nutrition.protein  / recipe.servings)} unit="g" />
            <NutritionCard label="Carbs"    value={Math.round(recipe.nutrition.carbs    / recipe.servings)} unit="g" />
            <NutritionCard label="Fat"      value={Math.round(recipe.nutrition.fat      / recipe.servings)} unit="g" />
          </div>
        </div>

        {/* Notes */}
        {recipe.notes && (
          <div className="py-4">
            <h3 className="text-sm font-bold text-gray-700 mb-2">Notes</h3>
            <p className="text-sm text-warm-gray leading-relaxed">{recipe.notes}</p>
          </div>
        )}
      </div>
    </BottomSheet>
  )
}

function MetaStat({ label, value }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-xs text-warm-muted uppercase tracking-wide">{label}</span>
      <span className="text-sm font-bold text-gray-700 capitalize">{value}</span>
    </div>
  )
}

function NutritionCard({ label, value, unit }) {
  return (
    <div className="bg-cream-100 rounded-xl p-2 text-center">
      <p className="text-lg font-extrabold text-terra-500">{value}</p>
      <p className="text-xs text-warm-gray">{unit}</p>
      <p className="text-xs text-warm-muted">{label}</p>
    </div>
  )
}
