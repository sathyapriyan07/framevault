import { supabase } from './supabaseClient'
import { storageUploadService } from './storageUploadService'

const TABLE_BY_TYPE = {
  logos: 'logos',
  posters: 'posters',
  backdrops: 'backdrops',
  wallpapers: 'wallpapers'
}

const BUCKET_BY_TYPE = {
  logos: 'logos',
  posters: 'posters',
  backdrops: 'backdrops',
  wallpapers: 'wallpapers'
}

const legacyPayloadForUrl = (type, movieId, remoteUrl) => {
  switch (type) {
    case 'logos':
      return { movie_id: movieId, logo_url: remoteUrl, png_download: remoteUrl }
    case 'posters':
      return { movie_id: movieId, poster_url: remoteUrl, download_url: remoteUrl }
    case 'backdrops':
      return { movie_id: movieId, backdrop_url: remoteUrl, download_url: remoteUrl }
    case 'wallpapers':
      return { movie_id: movieId, image_url: remoteUrl, download_url: remoteUrl }
    default:
      return null
  }
}

const isMissingColumnError = (error, column) => {
  const msg = String(error?.message || error || '')
  return msg.toLowerCase().includes('does not exist') && msg.toLowerCase().includes(column)
}

export const mediaStorageService = {
  async uploadAndInsertMovieMedia({
    type,
    movieId,
    remoteUrl,
    width = null,
    height = null,
    requireStorage = false,
    allowLegacyFallback = true
  }) {
    const table = TABLE_BY_TYPE[type]
    const bucket = BUCKET_BY_TYPE[type]
    if (!table || !bucket) throw new Error(`Unsupported media type: ${type}`)
    if (!movieId) throw new Error('movieId is required')
    if (!remoteUrl) throw new Error('remoteUrl is required')

    // Attempt the new flow first: upload into Storage and insert file_path.
    try {
      const upload = await storageUploadService.uploadImageFromUrl({
        bucket,
        pathPrefix: movieId,
        remoteUrl
      })

      const { error } = await supabase.from(table).insert({
        movie_id: movieId,
        file_path: upload.path,
        width,
        height
      })

      if (!error) return { ok: true, stored: 'storage', file_path: upload.path, via: upload.via }

      // If schema isn't migrated (no file_path column), fall back to legacy insert.
      if (isMissingColumnError(error, 'file_path')) {
        if (requireStorage) {
          throw new Error(`Table ${table} is missing file_path. Run SUPABASE_STORAGE_MEDIA_REFACTOR.sql first.`)
        }
        const legacy = legacyPayloadForUrl(type, movieId, remoteUrl)
        const { error: legacyError } = await supabase.from(table).insert(legacy)
        if (legacyError) throw legacyError
        return { ok: true, stored: 'legacy', legacy: true }
      }

      throw error
    } catch (error) {
      // Storage upload may fail (CORS, bucket missing, RLS). Fall back to legacy insert if possible.
      if (!allowLegacyFallback || requireStorage) throw error

      const legacy = legacyPayloadForUrl(type, movieId, remoteUrl)
      if (!legacy) throw error

      const { error: legacyError } = await supabase.from(table).insert(legacy)
      if (legacyError) throw error
      return { ok: true, stored: 'legacy', legacy: true }
    }
  }
}
