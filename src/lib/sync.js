import { supabase } from './supabase'
import { useStore } from '../context/AppContext'

const clientId = Math.random().toString(36).slice(2)

let householdId = null
let initialized = false
let applyingRemote = false
let pushTimer = null

function persistedFields(s) {
  return {
    current_week: s.currentWeek,
    week_history: s.weekHistory,
    favourites: s.favourites,
    shopping_list_checked: s.shoppingListChecked,
  }
}

function applyRemote(row) {
  applyingRemote = true
  useStore.setState({
    currentWeek: row.current_week ?? useStore.getState().currentWeek,
    weekHistory: row.week_history ?? [],
    favourites: row.favourites ?? [],
    shoppingListChecked: row.shopping_list_checked ?? {},
  })
  applyingRemote = false
}

async function refreshRecipes() {
  const { data } = await supabase
    .from('recipes')
    .select('data')
    .or(`household_id.is.null,household_id.eq.${householdId}`)
  useStore.setState({ recipes: (data ?? []).map(r => r.data) })
}

function schedulePush() {
  clearTimeout(pushTimer)
  pushTimer = setTimeout(async () => {
    const s = useStore.getState()
    await supabase.from('week_state').upsert({
      household_id: householdId,
      ...persistedFields(s),
      last_writer: clientId,
      updated_at: new Date().toISOString(),
    })
  }, 600)
}

export async function initSync(hid) {
  if (initialized) return
  initialized = true
  householdId = hid

  const { data: ws } = await supabase
    .from('week_state')
    .select('*')
    .eq('household_id', hid)
    .maybeSingle()
  if (ws) applyRemote(ws)

  await refreshRecipes()
  useStore.setState({ hydrated: true })

  useStore.subscribe((state, prev) => {
    if (applyingRemote) return
    if (
      state.currentWeek === prev.currentWeek &&
      state.weekHistory === prev.weekHistory &&
      state.favourites === prev.favourites &&
      state.shoppingListChecked === prev.shoppingListChecked
    ) return
    schedulePush()
  })

  supabase
    .channel(`week_state:${hid}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'week_state', filter: `household_id=eq.${hid}` },
      ({ new: row }) => {
        if (row && row.last_writer !== clientId) applyRemote(row)
      }
    )
    .subscribe()

  supabase
    .channel(`recipes:${hid}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'recipes' }, refreshRecipes)
    .subscribe()
}

export async function addRecipe(recipe) {
  const { error } = await supabase
    .from('recipes')
    .insert({ household_id: householdId, recipe_id: recipe.id, data: recipe })
  if (error) throw error
  await refreshRecipes()
}
