import { supabase } from './supabaseClient'

export const movieService = {
  async getAllMovies() {
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .eq('type', 'movie')
      .order('created_at', { ascending: false })
    return { data, error }
  },

  async getAllEntries() {
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .order('created_at', { ascending: false })
    return { data, error }
  },

  async getAllSeries() {
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .eq('type', 'series')
      .order('created_at', { ascending: false })
    return { data, error }
  },

  async getMoviesPaged(type, page, pageSize) {
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .eq('type', type)
      .order('created_at', { ascending: false })
      .range(from, to)
    return { data, error }
  },

  async getMovieById(id) {
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .eq('id', id)
      .single()
    return { data, error }
  },

  async searchMovies(query) {
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .ilike('title', `%${query}%`)
    return { data, error }
  },

  async createMovie(movieData) {
    const { data, error } = await supabase
      .from('movies')
      .insert([movieData])
      .select()
    return { data, error }
  },

  async updateMovie(id, movieData) {
    const { data, error } = await supabase
      .from('movies')
      .update(movieData)
      .eq('id', id)
      .select()
    return { data, error }
  },

  async deleteMovie(id) {
    const { error } = await supabase
      .from('movies')
      .delete()
      .eq('id', id)
    return { error }
  },

  async getRelatedMovies(genres, currentId) {
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .contains('genres', genres)
      .neq('id', currentId)
      .limit(6)
    return { data, error }
  }
}
