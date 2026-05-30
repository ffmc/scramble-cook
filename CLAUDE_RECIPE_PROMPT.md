# Recipe → JSON prompt (for the Claude phone app)

Paste this whole prompt into the Claude app, then add the recipe (a photo, a link, or pasted
text) underneath. Claude will reply with one JSON object. Copy it and paste it into Scramble
Cook → Recipes → **+ Import**.

---

Convert the recipe I give you into a single JSON object matching this exact schema. Output **only**
the JSON — no markdown, no code fences, no commentary.

```
{
  "id": "kebab-case-unique-id",        // lowercase, words separated by hyphens
  "name": "Display Name",
  "cuisine": "Mexican",
  "cuisineEmoji": "🇲🇽",
  "mealType": ["lunch", "dinner"],     // any of: "lunch", "dinner"
  "prepTime": 15,                       // minutes
  "cookTime": 25,                       // minutes
  "difficulty": "easy",                 // "easy" | "medium" | "hard"
  "servings": 3,
  "protein": "chicken",                 // main protein, lowercase (e.g. chicken, beef, tofu, beans)
  "tags": ["low-carb", "gluten-free"],
  "ingredients": [
    {
      "name": "chicken thighs (boneless)",
      "quantity": 600,                  // number, or null if not applicable
      "unit": "g",                      // e.g. g, ml, tbsp, tsp, cup, clove — or null
      "category": "proteins"            // one of: proteins, vegetables, aromatics, pantry, dairy, condiments
    }
  ],
  "instructions": [
    { "step": 1, "text": "Do the first thing." },
    { "step": 2, "text": "Then the next." }
  ],
  "nutrition": { "calories": 380, "protein": 42, "carbs": 10, "fat": 18 },  // per serving
  "notes": ""
}
```

Rules:
- `category` for every ingredient must be exactly one of: `proteins`, `vegetables`, `aromatics`, `pantry`, `dairy`, `condiments`.
- `mealType` values must be `lunch` and/or `dinner` only.
- Estimate `nutrition` per serving if not stated.
- Make `id` short, lowercase, hyphenated, and descriptive of the dish.
