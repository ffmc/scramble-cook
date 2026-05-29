import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

const emptySlots = () =>
  Object.fromEntries(
    DAYS.map(d => [d, { lunch: null, dinner: null, lunchSkipped: false, dinnerSkipped: false }])
  )

const emptyWeek = () => ({
  slots: emptySlots(),
  isLocked: false,
  mealType: 'both',
  servings: 3,
})

export const useStore = create(
  persist(
    (set, get) => ({
      currentWeek: emptyWeek(),

      setMealType: (mealType) =>
        set(s => ({ currentWeek: { ...s.currentWeek, mealType } })),

      setServings: (servings) =>
        set(s => ({ currentWeek: { ...s.currentWeek, servings } })),

      setWeekSlots: (slots) =>
        set(s => ({ currentWeek: { ...s.currentWeek, slots } })),

      setSlot: (day, slot, recipeId) =>
        set(s => ({
          currentWeek: {
            ...s.currentWeek,
            slots: {
              ...s.currentWeek.slots,
              [day]: { ...s.currentWeek.slots[day], [slot]: recipeId },
            },
          },
        })),

      skipSlot: (day, slot, value = true) => {
        const skipKey = slot === 'lunch' ? 'lunchSkipped' : 'dinnerSkipped'
        set(s => ({
          currentWeek: {
            ...s.currentWeek,
            slots: {
              ...s.currentWeek.slots,
              [day]: { ...s.currentWeek.slots[day], [slot]: null, [skipKey]: value },
            },
          },
        }))
      },

      lockWeek: () =>
        set(s => ({ currentWeek: { ...s.currentWeek, isLocked: true } })),

      unlockWeek: () =>
        set(s => ({ currentWeek: { ...s.currentWeek, isLocked: false } })),

      startNewWeek: () => {
        const { currentWeek, weekHistory } = get()
        set({
          weekHistory: [{ ...currentWeek, lockedAt: new Date().toISOString() }, ...weekHistory],
          shoppingListChecked: {},
          currentWeek: emptyWeek(),
        })
      },

      loadHistoryWeek: (entry) =>
        set({
          currentWeek: {
            slots: entry.slots,
            isLocked: false,
            mealType: entry.mealType,
            servings: entry.servings,
          },
        }),

      weekHistory: [],

      favourites: [],

      toggleFavourite: (id) =>
        set(s => ({
          favourites: s.favourites.includes(id)
            ? s.favourites.filter(f => f !== id)
            : [...s.favourites, id],
        })),

      shoppingListChecked: {},

      toggleShoppingItem: (key) =>
        set(s => ({
          shoppingListChecked: {
            ...s.shoppingListChecked,
            [key]: !s.shoppingListChecked[key],
          },
        })),
    }),
    { name: 'scramble-cook-store' }
  )
)
