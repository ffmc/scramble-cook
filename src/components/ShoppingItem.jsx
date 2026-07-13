import { formatQty } from '../utils/shoppingList'

export default function ShoppingItem({ name, quantity, unit, recipeNames, checked, onToggle }) {
  const qtyText = quantity && quantity > 0 ? `${formatQty(quantity)}${unit ? ' ' + unit : ''}` : null

  return (
    <li
      className={`flex items-start gap-3 py-3 cursor-pointer select-none transition-opacity
        ${checked ? 'opacity-50' : 'opacity-100'}`}
      onClick={onToggle}
    >
      <div className={`mt-0.5 w-5 h-5 rounded shrink-0 border-2 flex items-center justify-center transition-colors
        ${checked ? 'bg-sage-400 border-sage-400' : 'border-warm-line bg-white'}`}>
        {checked && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <span className={`text-sm font-medium ${checked ? 'line-through text-warm-muted' : 'text-gray-800'}`}>
            {name}
          </span>
          {qtyText && (
            <span className={`text-xs shrink-0 ${checked ? 'text-warm-muted' : 'text-warm-gray'}`}>
              {qtyText}
            </span>
          )}
        </div>
        {recipeNames.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {recipeNames.map(n => (
              <span key={n} className="text-xs px-1.5 py-0.5 rounded bg-cream-200 text-warm-gray">
                {n}
              </span>
            ))}
          </div>
        )}
      </div>
    </li>
  )
}
