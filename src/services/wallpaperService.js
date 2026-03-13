import { supabase } from './supabaseClient'

export const wallpaperService = {
  async getAll() {
    const { data, error } = await supabase
      .from('wallpapers')
      .select('*, movies(title, type)')
      .order('created_at', { ascending: false })
    return { data, error }
  },

  async getByMovieId(movieId) {
    const { data, error } = await supabase
      .from('wallpapers')
      .select('*')
      .eq('movie_id', movieId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  async create(wallpaperData) {
    const { data, error } = await supabase
      .from('wallpapers')
      .insert([wallpaperData])
      .select()
    return { data, error }
  },

  async delete(id) {
    const { error } = await supabase
      .from('wallpapers')
      .delete()
      .eq('id', id)
    return { error }
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('wallpapers')
      .update(updates)
      .eq('id', id)
      .select()
    return { data, error }
  }
}
