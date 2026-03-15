import { useState } from 'react'
import { tmdbService } from '../../services/tmdbService'
import { tmdbImageService } from '../../services/tmdbImageService'
import { movieService } from '../../services/movieService'
import { mediaStorageService } from '../../services/mediaStorageService'

export default function AdminImportTMDB() {
  const [tmdbId, setTmdbId] = useState('')
  const [type, setType] = useState('movie')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('success')
  const [movieData, setMovieData] = useState(null)
  const [images, setImages] = useState(null)
  const [selectedLogos, setSelectedLogos] = useState(new Set())
  const [selectedPosters, setSelectedPosters] = useState(new Set())
  const [selectedBackdrops, setSelectedBackdrops] = useState(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [searchRan, setSearchRan] = useState(false)
  const [searchCount, setSearchCount] = useState(0)
  const [searchError, setSearchError] = useState('')

  const normalizeImages = (raw) => ({
    logos: (raw?.logos || []).map((item) => ({
      image_url: tmdbService.getImageUrl(item.file_path),
      resolution: item.width && item.height ? `${item.width}x${item.height}` : null,
      width: item.width ?? null,
      height: item.height ?? null,
      aspect_ratio: item.aspect_ratio ?? null
    })),
    posters: (raw?.posters || []).map((item) => ({
      image_url: tmdbService.getImageUrl(item.file_path),
      resolution: item.width && item.height ? `${item.width}x${item.height}` : null,
      width: item.width ?? null,
      height: item.height ?? null,
      aspect_ratio: item.aspect_ratio ?? null
    })),
    backdrops: (raw?.backdrops || []).map((item) => ({
      image_url: tmdbService.getImageUrl(item.file_path),
      resolution: item.width && item.height ? `${item.width}x${item.height}` : null,
      width: item.width ?? null,
      height: item.height ?? null,
      aspect_ratio: item.aspect_ratio ?? null
    }))
  })

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
      const imgs = type === 'movie'
        ? await tmdbImageService.fetchMovieImages(tmdbId)
        : normalizeImages(await tmdbService.getTVImages(tmdbId))
      setMovieData(details)
      setImages(imgs)
      setSelectedLogos(new Set((imgs.logos || []).slice(0, 5).map((item) => item.image_url)))
      setSelectedPosters(new Set((imgs.posters || []).slice(0, 6).map((item) => item.image_url)))
      setSelectedBackdrops(new Set((imgs.backdrops || []).slice(0, 6).map((item) => item.image_url)))
      setMessageType('success')
      setMessage('Preview loaded. Select assets to import.')
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
    const movie = {
      tmdb_id: movieData.id,
      title: movieData.title || movieData.name,
      type,
      poster_url: tmdbService.getImageUrl(movieData.poster_path),
      backdrop_url: tmdbService.getImageUrl(movieData.backdrop_path),
      overview: movieData.overview,
      release_year: Number.isFinite(releaseYear) ? releaseYear : null,
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
    const movieId = savedMovie[0].id

    try {
      const selectedLogoItems = (images?.logos || []).filter((item) => selectedLogos.has(item.image_url))
      const selectedPosterItems = (images?.posters || []).filter((item) => selectedPosters.has(item.image_url))
      const selectedBackdropItems = (images?.backdrops || []).filter((item) => selectedBackdrops.has(item.image_url))

      for (const item of selectedLogoItems) {
        await mediaStorageService.uploadAndInsertMovieMedia({
          type: 'logos',
          movieId,
          remoteUrl: item.image_url,
          width: item.width,
          height: item.height,
          requireStorage: true,
          allowLegacyFallback: false
        })
      }
      for (const item of selectedPosterItems) {
        await mediaStorageService.uploadAndInsertMovieMedia({
          type: 'posters',
          movieId,
          remoteUrl: item.image_url,
          width: item.width,
          height: item.height,
          requireStorage: true,
          allowLegacyFallback: false
        })
      }
      for (const item of selectedBackdropItems) {
        await mediaStorageService.uploadAndInsertMovieMedia({
          type: 'backdrops',
          movieId,
          remoteUrl: item.image_url,
          width: item.width,
          height: item.height,
          requireStorage: true,
          allowLegacyFallback: false
        })
      }

      setMessageType('success')
      setMessage('Movie and selected assets imported.')
    } catch (e) {
      setMessageType('error')
      setMessage(`Import completed, but some uploads failed: ${e?.message || 'Unknown error'}`)
    }
    setMovieData(null)
    setImages(null)
    setTmdbId('')
    setLoading(false)
  }

  const toggleSelection = (setFn, imageUrl) => {
    setFn((prev) => {
      const next = new Set(prev)
      if (next.has(imageUrl)) {
        next.delete(imageUrl)
      } else {
        next.add(imageUrl)
      }
      return next
    })
  }

  const importAllImages = () => {
    setSelectedLogos(new Set((images?.logos || []).map((item) => item.image_url)))
    setSelectedPosters(new Set((images?.posters || []).map((item) => item.image_url)))
    setSelectedBackdrops(new Set((images?.backdrops || []).map((item) => item.image_url)))
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
              {loading ? 'Loading...' : 'Fetch Preview'}
            </button>
            {movieData && (
              <button onClick={saveMovie} className="px-4 py-2 text-sm rounded-lg bg-green-600 text-white">
                Save Selected
              </button>
            )}
            {movieData && (
              <button onClick={importAllImages} className="px-4 py-2 text-sm rounded-lg bg-white/10 text-white hover:bg-white/15">
                Select All
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

          <div>
            <h3 className="text-sm font-medium font-heading mb-2">Logos</h3>
            <div className="grid grid-cols-2 gap-3">
              {(images?.logos || []).map((logo) => (
                <label key={logo.image_url} className="cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedLogos.has(logo.image_url)}
                    onChange={() => toggleSelection(setSelectedLogos, logo.image_url)}
                    className="sr-only"
                  />
                  <div
                    className={`rounded-lg p-2 bg-[#161616] border ${
                      selectedLogos.has(logo.image_url) ? 'border-blue-500' : 'border-white/10'
                    }`}
                  >
                    <img src={logo.image_url} alt="Logo" className="h-16 w-full object-contain" loading="lazy" />
                    {logo.resolution && <p className="mt-2 text-[10px] text-neutral-400 font-body">{logo.resolution}</p>}
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium font-heading mb-2">Posters</h3>
            <div className="grid grid-cols-2 gap-3">
              {(images?.posters || []).map((poster) => (
                <label key={poster.image_url} className="cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedPosters.has(poster.image_url)}
                    onChange={() => toggleSelection(setSelectedPosters, poster.image_url)}
                    className="sr-only"
                  />
                  <div
                    className={`rounded-lg overflow-hidden bg-[#161616] border ${
                      selectedPosters.has(poster.image_url) ? 'border-blue-500' : 'border-white/10'
                    }`}
                  >
                    <img src={poster.image_url} alt="Poster" className="h-40 w-full object-cover" loading="lazy" />
                    {poster.resolution && <p className="p-2 text-[10px] text-neutral-400 font-body">{poster.resolution}</p>}
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium font-heading mb-2">Backdrops</h3>
            <div className="grid grid-cols-2 gap-3">
              {(images?.backdrops || []).map((backdrop) => (
                <label key={backdrop.image_url} className="cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedBackdrops.has(backdrop.image_url)}
                    onChange={() => toggleSelection(setSelectedBackdrops, backdrop.image_url)}
                    className="sr-only"
                  />
                  <div
                    className={`rounded-lg overflow-hidden bg-[#161616] border ${
                      selectedBackdrops.has(backdrop.image_url) ? 'border-blue-500' : 'border-white/10'
                    }`}
                  >
                    <img src={backdrop.image_url} alt="Backdrop" className="h-24 w-full object-cover" loading="lazy" />
                    {backdrop.resolution && <p className="p-2 text-[10px] text-neutral-400 font-body">{backdrop.resolution}</p>}
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
