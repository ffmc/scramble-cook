// One-off migration: load src/data/recipes.json into Supabase as global recipes.
// Usage: SUPABASE_URL=... SUPABASE_SERVICE_KEY=... node scripts/seed-recipes.mjs
import { createClient } from '@supabase/supabase-js'
import { readFile } from 'node:fs/promises'

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_KEY
if (!url || !key) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_KEY env vars.')
  process.exit(1)
}

const recipes = JSON.parse(await readFile(new URL('../src/data/recipes.json', import.meta.url)))
const supabase = createClient(url, key)

const rows = recipes.map(r => ({ household_id: null, recipe_id: r.id, data: r }))
const { error } = await supabase.from('recipes').upsert(rows, { onConflict: 'household_id,recipe_id' })

if (error) {
  console.error('Seed failed:', error.message)
  process.exit(1)
}
console.log(`Seeded ${rows.length} global recipes.`)
