import { useState } from 'react'
import BottomSheet from './BottomSheet'
import { validateRecipe } from '../lib/recipeSchema'
import { addRecipe } from '../lib/sync'
import { useStore } from '../context/AppContext'

export default function ImportRecipe({ isOpen, onClose }) {
  const recipes = useStore(s => s.recipes)
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(false)

  const reset = () => {
    setText('')
    setError('')
    setSaved(false)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleSave = async () => {
    setError('')
    const result = validateRecipe(text)
    if (!result.ok) {
      setError(result.error)
      return
    }
    if (recipes.some(r => r.id === result.recipe.id)) {
      setError(`A recipe with id "${result.recipe.id}" already exists.`)
      return
    }
    setBusy(true)
    try {
      await addRecipe(result.recipe)
      setSaved(true)
      setText('')
    } catch (e) {
      setError(e.message || 'Could not save the recipe.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose}>
      <div className="px-5 pt-1">
        <h2 className="font-display text-xl font-bold text-terra-500 mb-1">Import a recipe</h2>
        <p className="text-sm text-warm-gray mb-4">
          Paste the JSON you got from Claude. It'll be added for both of you.
        </p>

        {saved ? (
          <div className="text-center py-6">
            <p className="text-sm font-semibold text-sage-500 mb-4">✓ Recipe added!</p>
            <div className="flex gap-2">
              <button
                onClick={reset}
                className="flex-1 py-3 rounded-2xl border-2 border-warm-line text-warm-gray font-bold text-sm"
              >
                Add another
              </button>
              <button
                onClick={handleClose}
                className="flex-1 py-3 rounded-2xl bg-terra-400 text-white font-bold text-sm"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder='{ "id": "…", "name": "…", … }'
              rows={10}
              className="w-full px-3 py-3 text-sm font-mono border border-warm-line rounded-xl bg-white
                         focus:outline-none focus:border-terra-300 transition-colors resize-none"
            />
            {error && <p className="text-xs text-tomato-500 mt-2">{error}</p>}
            <button
              onClick={handleSave}
              disabled={busy || !text.trim()}
              className="w-full mt-4 py-3 rounded-2xl bg-terra-400 text-white font-bold text-base
                         hover:bg-terra-500 active:scale-95 transition-all duration-150 disabled:opacity-50"
            >
              {busy ? 'Saving…' : 'Save recipe'}
            </button>
          </>
        )}
      </div>
    </BottomSheet>
  )
}
