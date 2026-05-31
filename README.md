# The Scramble Cook

A meal scramble planning PWA for households. Pick your meals for the week, lock the plan, and get a ready-to-use shopping list — automatically scaled to your servings. Aimed to remove the mental burden of planning the meals for the week ahead with your own personal recipes or imported ones.  

Built with React + Vite, Supabase (real-time sync), and Tailwind CSS. Deployed on Vercel.

---

## What it does

You plan a week of lunches and dinners, one recipe per slot. The app then builds a shopping list from the ingredients across all those recipes, consolidated and scaled to however many people you're cooking for.

The whole thing is shared — two people on the same household code see the same plan in real time.

---

## How weekly meal planning works

### 1. Join a household

On first open, you enter a household code (or create one). Everyone with the same code shares the same week plan, history, and favourites. No accounts or passwords.

### 2. Configure the week

Before generating anything, you set three things at the top of the screen:

- **Meal type** — plan lunches only, dinners only, or both
- **Servings** — how many people (1–12); this scales all ingredient quantities in the shopping list
- **Active days** — toggle individual days off if you're eating out or travelling that day

### 3. Scramble (auto-generate)

Hit **Scramble the Week** and the app fills every active day slot with a recipe automatically. The algorithm:

- Never repeats a recipe from the previous week
- Never assigns the same recipe twice in the same week
- Avoids back-to-back days with the same protein
- Avoids the same protein for lunch and dinner on the same day
- Gives favourited recipes a higher chance of appearing

Before scrambling you can **exclude proteins for the week** — a row of protein pills sits below the Scramble button. Tap any protein (chicken, beef, salmon, etc.) to mark it as excluded. The scramble will not pick any recipe with that protein.

### 4. Adjust individual slots

After scrambling (or instead of it), you can manually adjust any slot:

- **Swap** — tap the refresh icon on any slot to open the recipe picker and choose a different dish
- **Skip** — tap the X icon to mark a slot as "not home"; it's excluded from the shopping list
- **Swap lunch/dinner** — tap the swap arrows in the day header to flip the two slots on that day
- **Collapse days** — tap any day header to collapse it, useful once you've reviewed it

The **recipe picker** is a full-screen search interface with:
- Text search by recipe name
- Filter by favourites, cuisine, and protein
- **Hide last week** toggle — hides recipes used in the previous locked week; they're also labelled "last week" when visible
- Recipes already assigned somewhere this week are shown greyed out as a visual indicator (you can still select them)
- Sort by name, cook time, calories, or favourites-first

### 5. Lock the week

Once the plan looks right, tap **Lock the Week**. Locking:

- Freezes all slots — no more swaps or changes
- Collapses days that have already passed (today and future days stay open)
- Saves the week to history

### 6. Start a new week

When the week is done, tap **New Week**. The current locked plan moves to history and a blank week opens. The previous week's recipes are then automatically avoided by the next scramble.

---

## Shopping list

The Shopping List tab builds an ingredient list from all non-skipped slots in the current week. Quantities are scaled to your servings setting.

**Group by Category** (default) — ingredients merged across all recipes, organised into sections: proteins, vegetables, aromatics, pantry, dairy, condiments. If two recipes use the same ingredient, quantities are combined into one line.

**Group by Day** — each day shows its meals and their ingredients separately. Days are collapsible.

Other controls:
- **Tick items** — tap any ingredient to check it off as you shop; checked state persists
- **Copy** — copies the full list as plain text for pasting into a message or notes app
- **Filters** — narrow the list by meal type (lunch/dinner/both), by specific days, or by individual dishes

---

## Recipes

The Recipes tab lets you browse the full recipe library, search by name, and mark favourites. Tapping a recipe shows the full detail: ingredients, instructions, nutrition info, and prep/cook time.

---

## History

Every locked week is saved to History. You can expand any past week to see the full day-by-day plan, and tap **Re-use this week** to load it back as the current week.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS |
| State | Zustand |
| Backend / sync | Supabase (Postgres + Realtime) |
| Hosting | Vercel |
| PWA | Web App Manifest, apple-touch-icon |

---

## Running locally

```bash
npm install
npm run dev
```

Requires a `.env` file with:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```
