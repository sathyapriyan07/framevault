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

    const inferredFromUrlExt = fileExt || guessExtFromUrl(remoteUrl) || undefined

    const safePrefix = pathPrefix ? pathPrefix.replace(/\/+$/, '') : ''
    const objectPath = `${safePrefix ? `${safePrefix}/` : ''}${Date.now()}-${randomId()}.${inferredFromUrlExt || 'jpg'}`

    // Try client-side download -> upload (fast path). This may fail in browsers due to CORS.
    try {
      const response = await fetch(remoteUrl)
      if (!response.ok) {
        throw new Error(`Failed to download remote image (${response.status})`)
      }

      const blob = await response.blob()
      const inferredContentType = contentType || blob.type || response.headers.get('content-type') || undefined
      const ext = fileExt || extFromContentType(inferredContentType) || inferredFromUrlExt || 'jpg'
      const normalizedObjectPath = objectPath.replace(/\.[^.]+$/, `.${ext}`)

      const { data, error } = await supabase.storage.from(bucket).upload(normalizedObjectPath, blob, {
        contentType: inferredContentType,
        upsert: false
      })

      if (error) throw error
      return { path: data.path, via: 'client' }
    } catch (clientError) {
      // Fallback: Edge Function fetches the TMDB URL server-side and uploads to Storage.
      let invokeResult
      try {
        invokeResult = await supabase.functions.invoke('tmdb-upload', {
          body: {
            bucket,
            objectPath,
            remoteUrl
          }
        })
      } catch (invokeError) {
        const fnUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tmdb-upload`
        const hint =
          `Failed to send a request to the Edge Function. ` +
          `Verify the function is deployed as "tmdb-upload" and reachable at ${fnUrl}. ` +
          `Also verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are correct in Vercel.`
        const err = new Error(`${hint} Original error: ${invokeError?.message || invokeError}`)
        err.cause = invokeError
        throw err
      }

      const { data, error } = invokeResult

      if (error) {
        const err = new Error(
          `Storage upload failed (client+function). Client error: ${clientError?.message || clientError}. Function error: ${error.message || error}`
        )
        err.cause = clientError
        throw err
      }

      if (!data?.path) {
        throw new Error('tmdb-upload function did not return a path')
      }

      return { path: data.path, via: 'function' }
    }
  }
}
