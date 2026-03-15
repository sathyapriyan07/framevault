import { useState } from 'react'
import { tmdbService } from '../../services/tmdbService'
import { movieService } from '../../services/movieService'

export default function AdminImportTMDB() {
  const [tmdbId, setTmdbId] = useState('')
  const [type, setType] = useState('movie')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('success')
  const [movieData, setMovieData] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [searchRan, setSearchRan] = useState(false)
  const [searchCount, setSearchCount] = useState(0)
  const [searchError, setSearchError] = useState('')

  const searchTMDB = async () => {
    if (!searchQuery.trim()) return
    setSearching(true)
    setSearchRan(true)
    setSearchError('')
    try {
      const results = await tmdbService.searchMulti(searchQuery)
      const filtered = (results.results || []).filter((item) => item.media_type === 'movie' || item.media_type === 'tv')
      setSearchResults(filtered)
      setSearchCount(filtered.length)
    } catch (error) {
      setSearchResults([])
      setSearchCount(0)
      setSearchError(`Error searching TMDB: ${error?.message || 'Unknown error'}`)
    }
    setSearching(false)
  }

  const selectFromSearch = (item) => {
    setTmdbId(item.id.toString())
    setType(item.media_type === 'movie' ? 'movie' : 'series')
    setSearchResults([])
    setSearchQuery('')
    setSearchRan(false)
    setSearchCount(0)
    setSearchError('')
  }

  const fetchFromTMDB = async () => {
    if (!tmdbId) return
    setLoading(true)
    setMessage('')
    try {
      const details =
        type === 'movie' ? await tmdbService.getMovieDetails(tmdbId) : await tmdbService.getTVDetails(tmdbId)
      setMovieData(details)
      setMessageType('success')
      setMessage('Metadata loaded. Media assets are added manually from the admin panel.')
    } catch (error) {
      setMessageType('error')
      setMessage(`Error fetching from TMDB: ${error?.message || 'Unknown error'}`)
    }
    setLoading(false)
  }

  const saveMovie = async () => {
    if (!movieData) return
    setLoading(true)
    setMessage('')
    const releaseDate = movieData.release_date || movieData.first_air_date
    const releaseYear = releaseDate ? new Date(releaseDate).getFullYear() : null
    const runtime =
      type === 'movie'
        ? movieData.runtime ?? null
        : Array.isArray(movieData.episode_run_time) && movieData.episode_run_time.length
          ? movieData.episode_run_time[0]
          : null
    const movie = {
      tmdb_id: movieData.id,
      title: movieData.title || movieData.name,
      original_title: movieData.original_title || movieData.original_name || null,
      type,
      overview: movieData.overview,
      release_date: releaseDate || null,
      release_year: Number.isFinite(releaseYear) ? releaseYear : null,
      poster_path: movieData.poster_path || null,
      backdrop_path: movieData.backdrop_path || null,
      vote_average: typeof movieData.vote_average === 'number' ? movieData.vote_average : null,
      runtime,
      status: movieData.status || null,
      genres: movieData.genres?.map((g) => g.name) || []
    }

    const { data: savedMovie, error } = await movieService.createMovie(movie)
    if (error) {
      setMessageType('error')
      setMessage(`Error saving movie: ${error.message || error.details || 'Unknown error'}`)
      setLoading(false)
      return
    }
    if (!savedMovie?.[0]?.id) return

    setMessageType('success')
    setMessage('Movie imported (metadata only). Add media assets manually in Admin Media Manager.')
    setMovieData(null)
    setTmdbId('')
    setLoading(false)
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <h1 className="text-xl font-semibold mb-4 font-heading">TMDB Import</h1>

      <div className="bg-[#111] rounded-xl p-4 space-y-4">
        <div className="space-y-3">
          <label className="block text-sm text-neutral-300 font-heading">Search TMDB</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchTMDB()}
              className="flex-1 px-3 py-2 text-sm rounded-lg bg-black border border-[#222] focus:outline-none focus:ring-2 focus:ring-pink-600/40"
              placeholder="Search movie"
            />
            <button
              onClick={searchTMDB}
              disabled={searching}
              className="px-4 py-2 text-sm rounded-lg bg-pink-600 text-white disabled:opacity-50"
            >
              {searching ? '...' : 'Search'}
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="max-h-52 overflow-y-auto space-y-2">
              {searchResults.map((item) => {
                const date = item.release_date || item.first_air_date
                const year = date ? String(date).slice(0, 4) : '-'
                const mediaType = item.media_type === 'tv' ? 'series' : item.media_type
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => selectFromSearch(item)}
                    className="w-full text-left flex items-center gap-3 bg-[#161616] rounded-lg p-2 hover:bg-[#1c1c1c] transition"
                  >
                    {item.poster_path ? (
                      <img
                        src={tmdbService.getImageUrl(item.poster_path, 'w92')}
                        alt={item.title || item.name}
                        className="w-10 h-14 rounded object-cover flex-shrink-0"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-10 h-14 rounded bg-black/40 border border-[#222] flex-shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium font-heading truncate">{item.title || item.name}</p>
                      <p className="text-xs text-neutral-400 font-body">
                        {year} • {mediaType}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {searchError && <p className="text-xs text-red-400 font-body">{searchError}</p>}
          {!searchError && searchRan && (
            <p className="text-xs text-green-400 font-body">Found {searchCount} results</p>
          )}
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs text-neutral-400 font-body">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[#1a1a1a] rounded-lg border border-[#222]"
              >
                <option value="movie">Movie</option>
                <option value="series">Series</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs text-neutral-400 font-body">TMDB ID</label>
              <input
                type="text"
                value={tmdbId}
                onChange={(e) => setTmdbId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[#1a1a1a] rounded-lg border border-[#222]"
                placeholder="e.g. 603"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={fetchFromTMDB}
              className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white disabled:opacity-60"
              disabled={loading || !tmdbId}
            >
              {loading ? 'Loading...' : 'Fetch Metadata'}
            </button>
            {movieData && (
              <button onClick={saveMovie} className="px-4 py-2 text-sm rounded-lg bg-green-600 text-white">
                Save Movie
              </button>
            )}
          </div>

          {message && (
            <p className={`text-xs ${messageType === 'error' ? 'text-red-400' : 'text-green-400'} font-body`}>
              {message}
            </p>
          )}
        </div>
      </div>

      {movieData && (
        <div className="space-y-4 mt-4">
          <div className="bg-[#111] rounded-xl p-4">
            <h2 className="text-sm font-medium font-heading text-neutral-200">Movie Information</h2>
            <p className="text-sm text-white font-heading mt-2">{movieData.title || movieData.name}</p>
            {movieData.overview && <p className="text-xs text-neutral-400 font-body mt-2">{movieData.overview}</p>}
          </div>
        </div>
      )}
    </div>
  )
}
