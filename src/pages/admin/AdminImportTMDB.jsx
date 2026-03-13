import { useState } from 'react'
import { tmdbService } from '../../services/tmdbService'
import { tmdbImageService } from '../../services/tmdbImageService'
import { movieService } from '../../services/movieService'
import { supabase } from '../../services/supabaseClient'

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

  const normalizeImages = (raw) => ({
    logos: (raw?.logos || []).map((item) => ({
      image_url: tmdbService.getImageUrl(item.file_path),
      resolution: item.width && item.height ? `${item.width}x${item.height}` : null,
      aspect_ratio: item.aspect_ratio ?? null
    })),
    posters: (raw?.posters || []).map((item) => ({
      image_url: tmdbService.getImageUrl(item.file_path),
      resolution: item.width && item.height ? `${item.width}x${item.height}` : null,
      aspect_ratio: item.aspect_ratio ?? null
    })),
    backdrops: (raw?.backdrops || []).map((item) => ({
      image_url: tmdbService.getImageUrl(item.file_path),
      resolution: item.width && item.height ? `${item.width}x${item.height}` : null,
      aspect_ratio: item.aspect_ratio ?? null
    }))
  })

  const searchTMDB = async () => {
    if (!searchQuery.trim()) return
    setSearching(true)
    setMessage('')
    try {
      const results = await tmdbService.searchMulti(searchQuery)
      const filtered = (results.results || []).filter((item) => item.media_type === 'movie' || item.media_type === 'tv')
      setSearchResults(filtered)
      setMessageType('success')
      setMessage(`Found ${filtered.length} results`)
    } catch (error) {
      setMessageType('error')
      setMessage(`Error searching TMDB: ${error?.message || 'Unknown error'}`)
    }
    setSearching(false)
  }

  const selectFromSearch = (item) => {
    setTmdbId(item.id.toString())
    setType(item.media_type === 'movie' ? 'movie' : 'series')
    setSearchResults([])
    setSearchQuery('')
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
      return
    }
    if (!savedMovie?.[0]?.id) return
    const movieId = savedMovie[0].id

    const logoInserts = (images?.logos || [])
      .filter((item) => selectedLogos.has(item.image_url))
      .map((item) => ({
        movie_id: movieId,
        logo_url: item.image_url,
        png_download: item.image_url
      }))
    const posterInserts = (images?.posters || [])
      .filter((item) => selectedPosters.has(item.image_url))
      .map((item) => ({
        movie_id: movieId,
        poster_url: item.image_url,
        download_url: item.image_url
      }))
    const backdropInserts = (images?.backdrops || [])
      .filter((item) => selectedBackdrops.has(item.image_url))
      .map((item) => ({
        movie_id: movieId,
        backdrop_url: item.image_url,
        download_url: item.image_url
      }))

    if (logoInserts.length) await supabase.from('logos').insert(logoInserts)
    if (posterInserts.length) await supabase.from('posters').insert(posterInserts)
    if (backdropInserts.length) await supabase.from('backdrops').insert(backdropInserts)

    setMessageType('success')
    setMessage('Movie and selected assets imported.')
    setMovieData(null)
    setImages(null)
    setTmdbId('')
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-heading font-bold mb-6">TMDB Import</h1>
      <div className="bg-dark-card p-8 rounded-lg mb-8">
        <div className="mb-6">
          <label className="block mb-2">Search TMDB</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchTMDB()}
              className="flex-1 px-4 py-2 bg-black/40 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#ff375f]/60"
              placeholder="Search for movies or series..."
            />
            <button
              onClick={searchTMDB}
              disabled={searching}
              className="rounded-full bg-[#ff375f] px-5 py-2 text-sm text-white disabled:opacity-50"
            >
              {searching ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {searchResults.length > 0 && (
          <div className="mb-6 max-h-80 overflow-y-auto">
            <h3 className="font-semibold mb-3">Search Results:</h3>
            <div className="space-y-2">
              {searchResults.map((item) => (
                <div
                  key={item.id}
                  onClick={() => selectFromSearch(item)}
                  className="flex gap-4 p-3 bg-black/40 rounded-xl hover:bg-black/60 cursor-pointer transition"
                >
                  {item.poster_path && (
                    <img
                      src={tmdbService.getImageUrl(item.poster_path, 'w92')}
                      alt={item.title || item.name}
                      className="w-10 h-14 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="font-semibold">{item.title || item.name}</h4>
                    <p className="text-sm text-gray-400">
                      {item.release_date || item.first_air_date} - {item.media_type}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block mb-2">Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className="w-full px-4 py-2 bg-gray-800 rounded">
              <option value="movie">Movie</option>
              <option value="series">Series</option>
            </select>
          </div>
          <div>
            <label className="block mb-2">TMDB ID</label>
            <input
              type="text"
              value={tmdbId}
              onChange={(e) => setTmdbId(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 rounded"
            />
          </div>
        </div>
        <div className="mt-4 flex gap-3">
          <button onClick={fetchFromTMDB} className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded">
            {loading ? 'Loading...' : 'Fetch Preview'}
          </button>
          {movieData && (
            <button onClick={saveMovie} className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded">
              Save Selected Assets
            </button>
          )}
          {movieData && (
            <button onClick={importAllImages} className="bg-white/10 hover:bg-white/20 px-6 py-2 rounded">
              Import All Images
            </button>
          )}
        </div>
        {message && (
          <p className={`mt-4 ${messageType === 'error' ? 'text-red-400' : 'text-green-400'}`}>{message}</p>
        )}
      </div>

      {movieData && (
        <div className="space-y-8">
          <div className="bg-dark-card p-6 rounded-lg">
            <h2 className="text-2xl font-heading font-semibold mb-2">Movie Information</h2>
            <p className="text-xl text-white">{movieData.title || movieData.name}</p>
            <p className="text-gray-400 mt-2">{movieData.overview}</p>
          </div>

          <div>
            <h3 className="text-xl font-heading font-semibold mb-4">Logos</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(images?.logos || []).map((logo) => (
                <label key={logo.image_url} className="cursor-pointer">
                  <div className={`rounded-lg p-2 border ${selectedLogos.has(logo.image_url) ? 'border-blue-500' : 'border-white/10'}`}>
                    <img src={logo.image_url} alt="Logo" className="h-20 w-full object-contain" />
                    {logo.resolution && <p className="mt-2 text-xs text-gray-400">{logo.resolution}</p>}
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedLogos.has(logo.image_url)}
                    onChange={() => toggleSelection(setSelectedLogos, logo.image_url)}
                    className="mt-2"
                  />
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-heading font-semibold mb-4">Posters</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(images?.posters || []).map((poster) => (
                <label key={poster.image_url} className="cursor-pointer">
                  <div className={`rounded-lg overflow-hidden border ${selectedPosters.has(poster.image_url) ? 'border-blue-500' : 'border-white/10'}`}>
                    <img src={poster.image_url} alt="Poster" className="h-48 w-full object-cover" />
                    {poster.resolution && <p className="p-2 text-xs text-gray-400">{poster.resolution}</p>}
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedPosters.has(poster.image_url)}
                    onChange={() => toggleSelection(setSelectedPosters, poster.image_url)}
                    className="mt-2"
                  />
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-heading font-semibold mb-4">Backdrops</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {(images?.backdrops || []).map((backdrop) => (
                <label key={backdrop.image_url} className="cursor-pointer">
                  <div className={`rounded-lg overflow-hidden border ${selectedBackdrops.has(backdrop.image_url) ? 'border-blue-500' : 'border-white/10'}`}>
                    <img src={backdrop.image_url} alt="Backdrop" className="h-32 w-full object-cover" />
                    {backdrop.resolution && <p className="p-2 text-xs text-gray-400">{backdrop.resolution}</p>}
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedBackdrops.has(backdrop.image_url)}
                    onChange={() => toggleSelection(setSelectedBackdrops, backdrop.image_url)}
                    className="mt-2"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
