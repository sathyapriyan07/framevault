import { supabase } from './supabaseClient'

export const posterService = {
  async getAll() {
    const { data, error } = await supabase
      .from('posters')
      .select('*, movies(title, type)')
      .order('created_at', { ascending: false })
    return { data, error }
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('posters')
      .update(updates)
      .eq('id', id)
      .select()
    return { data, error }
  },

  async delete(id) {
    const { error } = await supabase
      .from('posters')
      .delete()
      .eq('id', id)
    return { error }
  }
}
