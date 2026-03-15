import { supabase } from '../services/supabaseClient'

export const MEDIA_BUCKET_BY_TYPE = {
  logos: 'logos',
  posters: 'posters',
  backdrops: 'backdrops',
  wallpapers: 'wallpapers'
}

const stripBucketPrefix = (bucket, filePath) => {
  if (!filePath) return null
  const prefix = `${bucket}/`
  return filePath.startsWith(prefix) ? filePath.slice(prefix.length) : filePath
}

export const getPublicUrlForPath = (bucket, filePath) => {
  if (!bucket || !filePath) return null
  const normalized = stripBucketPrefix(bucket, filePath)
  const { data } = supabase.storage.from(bucket).getPublicUrl(normalized)
  return data?.publicUrl || null
}

export const getMediaImageUrl = (type, record) => {
  if (!record) return null
  const bucket = MEDIA_BUCKET_BY_TYPE[type]
  if (bucket && record.file_path) return getPublicUrlForPath(bucket, record.file_path)

  switch (type) {
    case 'logos':
      return record.logo_url || null
    case 'posters':
      return record.poster_url || null
    case 'backdrops':
      return record.backdrop_url || null
    case 'wallpapers':
      return record.image_url || null
    default:
      return null
  }
}

export const getMediaDownloadUrl = (type, record) => {
  if (!record) return null
  const bucket = MEDIA_BUCKET_BY_TYPE[type]
  if (bucket && record.file_path) return getPublicUrlForPath(bucket, record.file_path)

  switch (type) {
    case 'logos':
      return record.png_download || record.logo_url || null
    case 'posters':
      return record.download_url || record.poster_url || null
    case 'backdrops':
      return record.download_url || record.backdrop_url || null
    case 'wallpapers':
      return record.download_url || record.image_url || null
    default:
      return null
  }
}

