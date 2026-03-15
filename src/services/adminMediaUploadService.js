import { supabase } from './supabaseClient'
import { mediaAssetsService } from './mediaAssetsService'

const sanitizeFilename = (name) => {
  const base = String(name || 'file')
  return base.replace(/[^\w.\-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
}

const randomId = () => Math.random().toString(36).slice(2, 8)

export const adminMediaUploadService = {
  async uploadFiles({ movieId, type, files }) {
    if (!movieId) throw new Error('movieId is required')
    if (!type) throw new Error('type is required')
    if (!files?.length) return []

    const results = []

    for (const file of files) {
      const safeName = sanitizeFilename(file.name)
      const fileName = `${Date.now()}-${randomId()}-${safeName}`
      const objectPath = `movies/${movieId}/${type}/${fileName}`

      const { data, error } = await supabase.storage.from('media').upload(objectPath, file, {
        contentType: file.type || undefined,
        upsert: false
      })

      if (error) throw error

      const insert = await mediaAssetsService.create({
        movie_id: movieId,
        type,
        file_path: data.path
      })

      if (insert.error) throw insert.error
      results.push(insert.data?.[0])
    }

    return results
  }
}

