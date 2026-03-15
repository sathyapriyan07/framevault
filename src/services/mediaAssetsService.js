import { supabase } from './supabaseClient'

export const mediaAssetsService = {
  async insertManyUnique({ movieId, type, filePaths }) {
    if (!movieId) return { inserted: 0, skipped: 0, error: new Error('movieId is required') }
    if (!type) return { inserted: 0, skipped: 0, error: new Error('type is required') }

    const unique = Array.from(new Set((filePaths || []).filter(Boolean)))
    if (!unique.length) return { inserted: 0, skipped: 0, error: null }

    const { data: existing, error: existingError } = await supabase
      .from('media_assets')
      .select('file_path')
      .eq('movie_id', movieId)
      .eq('type', type)
      .in('file_path', unique)

    if (existingError) return { inserted: 0, skipped: 0, error: existingError }

    const existingSet = new Set((existing || []).map((row) => row.file_path))
    const toInsert = unique.filter((path) => !existingSet.has(path))

    if (!toInsert.length) return { inserted: 0, skipped: unique.length, error: null }

    const payload = toInsert.map((path) => ({
      movie_id: movieId,
      type,
      file_path: path
    }))

    const { error: insertError } = await supabase.from('media_assets').insert(payload)
    if (insertError) return { inserted: 0, skipped: 0, error: insertError }

    return { inserted: toInsert.length, skipped: unique.length - toInsert.length, error: null }
  },

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

