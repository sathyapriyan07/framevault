const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY
const BASE_URL = 'https://api.themoviedb.org/3'
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/original'

const cache = new Map()
const CACHE_TTL_MS = 5 * 60 * 1000

const buildImage = (item) => ({
  image_url: item.file_path ? `${IMAGE_BASE_URL}${item.file_path}` : null,
  resolution: item.width && item.height ? `${item.width}x${item.height}` : null,
  width: item.width ?? null,
  height: item.height ?? null,
  aspect_ratio: item.aspect_ratio ?? null,
  file_path: item.file_path
})

const getCached = (key) => {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    cache.delete(key)
    return null
  }
  return entry.data
}

export const tmdbImageService = {
  async fetchMovieImages(tmdbId) {
    const cacheKey = `movie:${tmdbId}`
    const cached = getCached(cacheKey)
    if (cached) return cached

    const response = await fetch(`${BASE_URL}/movie/${tmdbId}/images?api_key=${TMDB_API_KEY}`)
    const data = await response.json()
    const structured = {
      logos: (data.logos || []).map(buildImage),
      posters: (data.posters || []).map(buildImage),
      backdrops: (data.backdrops || []).map(buildImage)
    }
    cache.set(cacheKey, { data: structured, expiresAt: Date.now() + CACHE_TTL_MS })
    return structured
  }
}
