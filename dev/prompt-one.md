Build a React web application called "The Scramble Cook" — a weekly meal planning app for a family of 3. The app should be deployed on Vercel with all data living in a local JSON file (recipes.json) that acts as the recipe database. No backend required. Use React + Vite, Tailwind CSS, and localStorage for persisting weekly menus and history.

---

DESIGN DIRECTION
- Warm, fun, kitchen-friendly aesthetic. Think modern cookbook meets weekly planner.
- Simple and uncluttered. Prioritise readability and ease of use on mobile.
- Playful but not childish. Functional but not corporate.
- Use a distinctive font pairing — a bold display font for headings, clean readable font for body.
- Warm color palette — creams, terracottas, warm greens. Avoid cold blues and greys.
- Satisfying micro-interactions on buttons (scramble, lock, swap).
- Works well on both desktop and mobile (kitchen tablet use).

---

APP STRUCTURE — 4 screens accessible via bottom navigation bar:

1. THIS WEEK (home screen)
2. SHOPPING LIST
3. RECIPES
4. HISTORY

---

SCREEN 1 — THIS WEEK

Before generating, show a simple setup panel with two choices:
- Meal selection: "Lunch only / Dinner only / Both" (default: Both)
- Servings: adjustable number (default: 3)

Main view is a 7-day card layout (Monday to Sunday). Each day has two slots: Lunch and Dinner. Slots are shown or hidden based on the meal selection choice.

At the top: a large "Scramble the Week 🎲" button that randomly populates all active slots with recipes from the database.

Smart generation rules:
- Avoid repeating any recipe from the previous locked week
- Avoid repeating the same protein on consecutive days where possible
- Respect the mealType field on each recipe (some recipes are lunch/dinner only)
- Favourited recipes have a 1.5x higher chance of being selected

Each day card shows:
- Day name
- Lunch slot (if active): recipe name, cuisine emoji/flag, prep time, protein tag
- Dinner slot (if active): same
- Each slot has: Swap button (opens recipe picker), Remove button (marks as "eating out" / "skipping")
- Removed slots show a greyed out "Not home" or "Skipping" label

At the bottom: "Lock the Week" button — only active when at least one slot is filled.
Once locked, slots become read-only and the Shopping List becomes available.
Show a confirmation animation when locking.

---

SCREEN 2 — SHOPPING LIST

Only available after the week is locked.

Auto-generated from all active (non-removed) locked recipes.
Ingredients grouped by category:
- 🥩 Proteins
- 🥦 Vegetables & Greens
- 🧄 Aromatics & Herbs
- 🥫 Pantry & Dry Goods
- 🧈 Dairy & Eggs
- 🍋 Condiments & Sauces

Rules:
- Quantities scaled to selected servings (default 3)
- Duplicate ingredients merged and quantities combined across recipes
- Each ingredient has a checkbox (persisted in localStorage)
- "Copy List" button exports plain text grouped list (for WhatsApp/Notes)
- Show which recipe each ingredient belongs to (subtle tag under each item)

---

SCREEN 3 — RECIPES

Browsable database of all recipes.

Top bar: search input + filter row
Filters:
- Cuisine (dropdown or pills)
- Protein (dropdown or pills)  
- Meal type: Lunch / Dinner / Both
- Prep time: Under 20min / 20-30min / 30-45min
- Tags: low-carb, gluten-free, dairy-free, vegetarian

Recipe grid: cards showing name, cuisine flag, prep time, protein, difficulty, favourite star.
Tapping a card opens a full Recipe Detail view (modal or slide-in panel) showing:
- Recipe name + cuisine
- Tags (low-carb, etc.)
- Prep time + cook time + total time
- Difficulty
- Servings scaler (adjust and ingredients update proportionally)
- Ingredients list (with quantities scaled to servings)
- Step-by-step instructions (numbered, large and readable)
- Nutrition estimate per serving (calories, protein, carbs, fat)
- Chef notes / tips / substitutions
- Favourite toggle (star button)

---

SCREEN 4 — HISTORY

List of all past locked weeks in reverse chronological order.
Each week entry shows:
- Week date range
- Mini grid of recipe names per day/slot
- "View Full Week" expands to show complete menu
- "Re-use this week" button that loads it back into This Week screen as a starting point (still editable before re-locking)

---

DATA STRUCTURE — recipes.json

Each recipe object must include:
{
  "id": "unique-slug",
  "name": "Recipe Name",
  "cuisine": "Mexican",
  "cuisineEmoji": "🇲🇽",
  "mealType": ["lunch", "dinner"],
  "prepTime": 15,
  "cookTime": 20,
  "difficulty": "easy",
  "servings": 3,
  "protein": "chicken",
  "tags": ["low-carb", "gluten-free"],
  "ingredients": [
    {
      "name": "chicken thighs",
      "quantity": 600,
      "unit": "g",
      "category": "proteins"
    }
  ],
  "instructions": [
    { "step": 1, "text": "Heat oil in a pan over medium heat." }
  ],
  "nutrition": {
    "calories": 420,
    "protein": 38,
    "carbs": 8,
    "fat": 22
  },
  "notes": "Can substitute chicken for turkey mince.",
  "favourite": false
}

Populate recipes.json with the following 15 recipes (full ingredients, instructions, nutrition estimates):
1. Chicken Tinga Lettuce Tacos (Mexican)
2. Shrimp Fajita Bowls (Mexican)
3. Teriyaki Salmon with Sesame Bok Choy (Japanese)
4. Ginger Beef Stir-Fry with Zucchini Noodles (Japanese)
5. Lemon Herb Chicken Thighs with Tzatziki (Greek)
7. Butter Chicken with Cauliflower Rice (Indian)
10. Eggplant Parmesan (Italian)
11. Thai Basil Chicken with Fried Egg (Thai)
13. Bacalhau à Brás Deconstructed (Portuguese)
19. Peruvian Lomo Saltado with Cauliflower Rice (Peruvian)
23. Moroccan Chermoula Chicken (Moroccan)
27. Caldo Verde with Chorizo and Kale (Portuguese)
31. Shakshuka with Feta (Middle Eastern)
32. Lamb Kofta with Tahini Sauce (Middle Eastern)
37. Ecuadorian Seco de Pollo (Ecuadorian)

---

STATE MANAGEMENT
- Use React Context or Zustand for global state
- Persist the following in localStorage:
  - currentWeek (active meal plan, locked or unlocked)
  - weekHistory (array of past locked weeks)
  - favourites (array of recipe IDs)
  - shoppingListChecked (checked ingredient state for current week)
  - servings (user preference)

---

FILE STRUCTURE
scramble-cook/
├── public/
├── src/
│   ├── components/
│   │   ├── RecipeCard.jsx
│   │   ├── RecipeDetail.jsx
│   │   ├── DayCard.jsx
│   │   ├── ShoppingItem.jsx
│   │   ├── WeekSetup.jsx
│   │   └── BottomNav.jsx
│   ├── data/
│   │   └── recipes.json
│   ├── context/
│   │   └── AppContext.jsx
│   ├── pages/
│   │   ├── ThisWeek.jsx
│   │   ├── ShoppingList.jsx
│   │   ├── Recipes.jsx
│   │   └── History.jsx
│   ├── utils/
│   │   └── generator.js
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── tailwind.config.js
├── vite.config.js
├── package.json
└── README.md

---

README must include:
- What the app does
- How to run locally (npm install + npm run dev)
- How to deploy to Vercel (connect GitHub repo, auto-deploy on push)
- How to add new recipes to recipes.json
- How to update the app

---

TECHNICAL NOTES
- React 18 + Vite
- Tailwind CSS for styling
- No backend, no API calls, no authentication
- All data in src/data/recipes.json
- localStorage for all persistence
- React Router for navigation
- Keep bundle size lean — no heavy UI libraries needed