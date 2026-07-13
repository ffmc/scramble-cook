import { z } from 'zod'

export const CATEGORIES = ['proteins', 'vegetables', 'aromatics', 'pantry', 'dairy', 'condiments']
export const MEAL_TYPES = ['lunch', 'dinner']
export const DIFFICULTIES = ['easy', 'medium', 'hard']

const ingredientSchema = z.object({
  name: z.string().min(1),
  quantity: z.number().nullable().optional(),
  unit: z.string().nullable().optional(),
  category: z.enum(CATEGORIES),
})

export const recipeSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'id must be kebab-case'),
  name: z.string().min(1),
  cuisine: z.string().min(1),
  cuisineEmoji: z.string().optional().default(''),
  mealType: z.array(z.enum(MEAL_TYPES)).min(1),
  prepTime: z.number(),
  cookTime: z.number(),
  difficulty: z.enum(DIFFICULTIES),
  servings: z.number().positive(),
  protein: z.string().min(1),
  tags: z.array(z.string()).default([]),
  ingredients: z.array(ingredientSchema).min(1),
  instructions: z.array(z.object({ step: z.number(), text: z.string().min(1) })).min(1),
  nutrition: z.object({
    calories: z.number(),
    protein: z.number(),
    carbs: z.number(),
    fat: z.number(),
  }),
  notes: z.string().optional().default(''),
})

// Returns { ok: true, recipe } or { ok: false, error } for pasted JSON.
export function validateRecipe(text) {
  let parsed
  try {
    parsed = JSON.parse(text)
  } catch {
    return { ok: false, error: 'Not valid JSON — check you pasted the whole thing.' }
  }
  const result = recipeSchema.safeParse(parsed)
  if (!result.success) {
    const first = result.error.issues[0]
    return { ok: false, error: `${first.path.join('.') || 'recipe'}: ${first.message}` }
  }
  return { ok: true, recipe: result.data }
}
