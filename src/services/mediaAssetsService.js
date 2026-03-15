import { supabase } from './supabaseClient'

export const mediaAssetsService = {
  async getByMovieId(movieId) {
    const { data, error } = await supabase
      .from('media_assets')
      .select('*')
      .eq('movie_id', movieId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  async getAllByType(type, limit = 500) {
    const query = supabase.from('media_assets').select('*').eq('type', type).order('created_at', { ascending: false })
    const { data, error } = limit ? await query.limit(limit) : await query
    return { data, error }
  },

  async getLatestByType(type, limit = 24) {
    const { data, error } = await supabase
      .from('media_assets')
      .select('*')
      .eq('type', type)
      .order('created_at', { ascending: false })
      .limit(limit)
    return { data, error }
  },

  async create(payload) {
    const { data, error } = await supabase.from('media_assets').insert([payload]).select()
    return { data, error }
  },

  async delete(id) {
    const { error } = await supabase.from('media_assets').delete().eq('id', id)
    return { error }
  }
}

