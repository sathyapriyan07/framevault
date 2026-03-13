import { create } from 'zustand'

export const useFilterStore = create((set) => ({
  genre: '',
  year: '',
  type: 'movie',
  setGenre: (genre) => set({ genre }),
  setYear: (year) => set({ year }),
  setType: (type) => set({ type })
}))
