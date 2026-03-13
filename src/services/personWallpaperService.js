import { supabase } from './supabaseClient'

export const personWallpaperService = {
  async getAll() {
    const { data, error } = await supabase
      .from('person_wallpapers')
      .select('*, persons(name)')
      .order('created_at', { ascending: false })
    return { data, error }
  },

  async getByPersonId(personId) {
    const { data, error } = await supabase
      .from('person_wallpapers')
      .select('*')
      .eq('person_id', personId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  async create(payload) {
    const { data, error } = await supabase
      .from('person_wallpapers')
      .insert([payload])
      .select()
    return { data, error }
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('person_wallpapers')
      .update(updates)
      .eq('id', id)
      .select()
    return { data, error }
  },

  async delete(id) {
    const { error } = await supabase
      .from('person_wallpapers')
      .delete()
      .eq('id', id)
    return { error }
  }
}
