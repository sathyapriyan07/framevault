import { supabase } from './supabaseClient'

export const personService = {
  async getAll() {
    const { data, error } = await supabase
      .from('persons')
      .select('*')
      .order('created_at', { ascending: false })
    return { data, error }
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('persons')
      .select('*')
      .eq('id', id)
      .single()
    return { data, error }
  },

  async searchPersons(query) {
    const { data, error } = await supabase
      .from('persons')
      .select('*')
      .ilike('name', `%${query}%`)
    return { data, error }
  },

  async create(personData) {
    const { data, error } = await supabase
      .from('persons')
      .insert([personData])
      .select()
    return { data, error }
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('persons')
      .update(updates)
      .eq('id', id)
      .select()
    return { data, error }
  },

  async delete(id) {
    const { error } = await supabase
      .from('persons')
      .delete()
      .eq('id', id)
    return { error }
  }
}
