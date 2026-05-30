import { useState, useEffect } from 'react'
import { useStore } from '../context/AppContext'
import { getStoredHousehold, resolveHousehold } from '../lib/household'
import { initSync } from '../lib/sync'

export default function HouseholdGate({ children }) {
  const hydrated = useStore(s => s.hydrated)
  const [household, setHousehold] = useState(() => getStoredHousehold())
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (household) initSync(household.id)
  }, [household])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      setHousehold(await resolveHousehold(code))
    } catch {
      setError('Could not connect. Check your code and try again.')
      setBusy(false)
    }
  }

  if (household) {
    if (!hydrated) {
      return (
        <div className="max-w-md mx-auto min-h-screen bg-cream-100 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-terra-200 border-t-terra-400 animate-spin" />
        </div>
      )
    }
    return children
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-cream-100 flex flex-col justify-center px-8">
      <h1 className="font-display text-3xl font-bold text-terra-500 tracking-tight text-center">The Scramble Cook</h1>
      <p className="text-sm text-warm-gray mt-2 mb-6 text-center">
        Enter your household code. Use the same code on both phones to share and sync your week.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          autoCapitalize="none"
          autoCorrect="off"
          placeholder="e.g. cardoso-kitchen"
          value={code}
          onChange={e => setCode(e.target.value)}
          className="w-full px-4 py-3 text-base border border-warm-line rounded-xl bg-white
                     focus:outline-none focus:border-terra-300 transition-colors text-center"
        />
        {error && <p className="text-xs text-tomato-500 text-center">{error}</p>}
        <button
          type="submit"
          disabled={busy || !code.trim()}
          className="w-full py-3 rounded-2xl bg-terra-400 text-white font-bold text-base
                     hover:bg-terra-500 active:scale-95 transition-all duration-150 disabled:opacity-50"
        >
          {busy ? 'Connecting…' : 'Continue'}
        </button>
      </form>
    </div>
  )
}
