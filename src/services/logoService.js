import { supabase } from './supabaseClient'

export const logoService = {
  async getAll() {
    const { data, error } = await supabase
      .from('logos')
      .select('*, movies(title, type)')
      .order('created_at', { ascending: false })
    return { data, error }
  },

  async getByMovieId(movieId) {
    const { data, error } = await supabase
      .from('logos')
      .select('*')
      .eq('movie_id', movieId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  async create(logoData) {
    const { data, error } = await supabase
      .from('logos')
      .insert([logoData])
      .select()
    return { data, error }
  },

  async delete(id) {
    const { error } = await supabase
      .from('logos')
      .delete()
      .eq('id', id)
    return { error }
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('logos')
      .update(updates)
      .eq('id', id)
      .select()
    return { data, error }
  }
}
