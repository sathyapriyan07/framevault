import { supabase } from './supabaseClient'

const tableMap = {
  wallpapers: 'wallpapers',
  logos: 'logos',
  posters: 'posters',
  backdrops: 'backdrops'
}

export const mediaService = {
  async getAll(type) {
    const table = tableMap[type]
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order('created_at', { ascending: false })
    return { data, error }
  },

  async getByMovieId(type, movieId) {
    const table = tableMap[type]
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('movie_id', movieId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  async create(type, payload) {
    const table = tableMap[type]
    const { data, error } = await supabase.from(table).insert([payload]).select()
    return { data, error }
  }
}
