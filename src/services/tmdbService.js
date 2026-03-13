const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY
const BASE_URL = 'https://api.themoviedb.org/3'
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p'

export const tmdbService = {
  async getMovieDetails(tmdbId) {
    const response = await fetch(`${BASE_URL}/movie/${tmdbId}?api_key=${TMDB_API_KEY}`)
    return response.json()
  },

  async getTVDetails(tmdbId) {
    const response = await fetch(`${BASE_URL}/tv/${tmdbId}?api_key=${TMDB_API_KEY}`)
    return response.json()
  },

  async getMovieImages(tmdbId) {
    const response = await fetch(`${BASE_URL}/movie/${tmdbId}/images?api_key=${TMDB_API_KEY}`)
    return response.json()
  },

  async getTVImages(tmdbId) {
    const response = await fetch(`${BASE_URL}/tv/${tmdbId}/images?api_key=${TMDB_API_KEY}`)
    return response.json()
  },

  async getPersonDetails(tmdbId) {
    const response = await fetch(`${BASE_URL}/person/${tmdbId}?api_key=${TMDB_API_KEY}`)
    return response.json()
  },

  async searchMulti(query) {
    const response = await fetch(`${BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`)
    return response.json()
  },

  async getTrending() {
    const response = await fetch(`${BASE_URL}/trending/all/week?api_key=${TMDB_API_KEY}`)
    return response.json()
  },

  getImageUrl(path, size = 'original') {
    return path ? `${IMAGE_BASE_URL}/${size}${path}` : null
  }
}
