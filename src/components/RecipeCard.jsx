const DIFFICULTY_COLOURS = {
  easy:   'bg-sage-100 text-sage-500',
  medium: 'bg-amber-100 text-amber-700',
  hard:   'bg-red-100 text-red-600',
}

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

export default function RecipeCard({ recipe, isFavourite, onClick, onToggleFavourite }) {
  const difficultyClass = DIFFICULTY_COLOURS[recipe.difficulty] ?? DIFFICULTY_COLOURS.easy
  const proteinClass    = PROTEIN_COLOURS[recipe.protein] ?? PROTEIN_DEFAULT

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl shadow-card p-4 cursor-pointer hover:shadow-md active:scale-[0.98] transition-all duration-150"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-xs text-warm-gray font-medium truncate">{recipe.cuisine}</span>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${difficultyClass}`}>
            {recipe.difficulty}
          </span>
          <button
            onClick={e => { e.stopPropagation(); onToggleFavourite(recipe.id) }}
            className={`text-lg leading-none transition-transform duration-150 active:scale-110
              ${isFavourite ? 'text-amber-400' : 'text-warm-muted hover:text-amber-300'}`}
            title={isFavourite ? 'Remove from favourites' : 'Add to favourites'}
          >
            ★
          </button>
        </div>
      </div>

      <h3 className="font-bold text-gray-800 text-sm leading-snug line-clamp-2 mb-2">{recipe.name}</h3>

      <div className="flex items-center gap-1.5 mb-2 flex-wrap">
        <span className="text-xs px-2 py-0.5 rounded-full bg-cream-200 text-warm-gray font-medium">
          ⏱ {recipe.prepTime + recipe.cookTime}m
        </span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${proteinClass}`}>
          {recipe.protein}
        </span>
        {recipe.nutrition?.calories && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-cream-200 text-warm-gray font-medium">
            {recipe.nutrition.calories} kcal
          </span>
        )}
      </div>

      {recipe.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {recipe.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-cream-200 text-warm-gray">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
