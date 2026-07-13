import { supabase } from './supabase'

const STORAGE_KEY = 'scramble-cook-household'

export function getStoredHousehold() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null
  } catch {
    return null
  }
}

export function clearHousehold() {
  localStorage.removeItem(STORAGE_KEY)
}

function normalise(code) {
  return code.trim().toLowerCase()
}

// Look up a household by code, creating it if it doesn't exist yet.
export async function resolveHousehold(rawCode) {
  const code = normalise(rawCode)
  if (!code) throw new Error('Enter a code')

  const existing = await supabase.from('households').select('id, code').eq('code', code).maybeSingle()
  if (existing.error) throw existing.error

  let household = existing.data
  if (!household) {
    const created = await supabase.from('households').insert({ code }).select('id, code').single()
    if (created.error) throw created.error
    household = created.data
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(household))
  return household
}
