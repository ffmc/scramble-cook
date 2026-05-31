import { create } from 'zustand'

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
  activeDays: [...DAYS],
})

export const useStore = create(
    (set, get) => ({
      hydrated: false,
      recipes: [],

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

      toggleActiveDay: (day) =>
        set(s => {
          const activeDays = s.currentWeek.activeDays ?? DAYS
          const { slots } = s.currentWeek
          const removing = activeDays.includes(day)
          return {
            currentWeek: {
              ...s.currentWeek,
              activeDays: removing ? activeDays.filter(d => d !== day) : [...activeDays, day],
              slots: removing
                ? { ...slots, [day]: { lunch: null, dinner: null, lunchSkipped: false, dinnerSkipped: false } }
                : slots,
            },
          }
        }),

      swapDaySlots: (day) =>
        set(s => {
          const d = s.currentWeek.slots[day]
          return {
            currentWeek: {
              ...s.currentWeek,
              slots: {
                ...s.currentWeek.slots,
                [day]: {
                  lunch: d.dinner,
                  dinner: d.lunch,
                  lunchSkipped: d.dinnerSkipped,
                  dinnerSkipped: d.lunchSkipped,
                },
              },
            },
          }
        }),

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
    })
)
