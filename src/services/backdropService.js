import { supabase } from './supabaseClient'

export const backdropService = {
  async getAll() {
    const { data, error } = await supabase
      .from('backdrops')
      .select('*, movies(title, type)')
      .order('created_at', { ascending: false })
    return { data, error }
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('backdrops')
      .update(updates)
      .eq('id', id)
      .select()
    return { data, error }
  },

  async delete(id) {
    const { error } = await supabase
      .from('backdrops')
      .delete()
      .eq('id', id)
    return { error }
  }
}
