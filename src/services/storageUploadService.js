import { supabase } from './supabaseClient'

const guessExtFromUrl = (url) => {
  try {
    const clean = url.split('?')[0]
    const last = clean.split('/').pop() || ''
    const parts = last.split('.')
    if (parts.length < 2) return null
    const ext = parts.pop().toLowerCase()
    if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(ext)) return ext === 'jpeg' ? 'jpg' : ext
    return null
  } catch {
    return null
  }
}

const extFromContentType = (contentType) => {
  if (!contentType) return null
  const normalized = contentType.split(';')[0].trim().toLowerCase()
  const map = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/svg+xml': 'svg'
  }
  return map[normalized] || null
}

const randomId = () => Math.random().toString(36).slice(2, 10)

export const storageUploadService = {
  async uploadImageFromUrl({ bucket, pathPrefix = '', remoteUrl, fileExt, contentType }) {
    if (!bucket) throw new Error('bucket is required')
    if (!remoteUrl) throw new Error('remoteUrl is required')

    const response = await fetch(remoteUrl)
    if (!response.ok) {
      throw new Error(`Failed to download remote image (${response.status})`)
    }

    const blob = await response.blob()
    const inferredContentType = contentType || blob.type || response.headers.get('content-type') || undefined

    const ext =
      fileExt ||
      extFromContentType(inferredContentType) ||
      guessExtFromUrl(remoteUrl) ||
      'jpg'

    const safePrefix = pathPrefix ? pathPrefix.replace(/\/+$/, '') : ''
    const objectPath = `${safePrefix ? `${safePrefix}/` : ''}${Date.now()}-${randomId()}.${ext}`

    const { data, error } = await supabase.storage.from(bucket).upload(objectPath, blob, {
      contentType: inferredContentType,
      upsert: false
    })

    if (error) throw error
    return { path: data.path }
  }
}

