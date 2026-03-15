import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { tmdbService } from '../../services/tmdbService'
import { movieService } from '../../services/movieService'
import { supabase } from '../../services/supabaseClient'
import { mediaStorageService } from '../../services/mediaStorageService'

export default function AdminAddMovie() {
  const [tmdbId, setTmdbId] = useState('')
  const [type, setType] = useState('movie')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('success')
  const [movieData, setMovieData] = useState(null)
  const [images, setImages] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [role, setRole] = useState(null)
  const [loadingRole, setLoadingRole] = useState(true)

  useEffect(() => {
    let isMounted = true
    const init = async () => {
      const { data } = await supabase.auth.getSession()
      const userId = data?.session?.user?.id
      if (!userId) {
        if (isMounted) {
          setRole(null)
          setLoadingRole(false)
        }
        return
      }
      const { data: roleData } = await supabase.from('users').select('role').eq('id', userId).single()
      if (isMounted) {
        setRole(roleData?.role ?? null)
        setLoadingRole(false)
      }
    }
    init()
    return () => {
      isMounted = false
    }
  }, [])

  const searchTMDB = async () => {
    if (!searchQuery.trim()) return
    setSearching(true)
    setMessage('')
    try {
      const results = await tmdbService.searchMulti(searchQuery)
      const filtered = results.results.filter((item) => item.media_type === 'movie' || item.media_type === 'tv')
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
    setLoading(true)
    setMessage('')
    try {
      const details =
        type === 'movie' ? await tmdbService.getMovieDetails(tmdbId) : await tmdbService.getTVDetails(tmdbId)

      const imgs = type === 'movie' ? await tmdbService.getMovieImages(tmdbId) : await tmdbService.getTVImages(tmdbId)

      setMovieData(details)
      setImages(imgs)
      setMessageType('success')
      setMessage('Data fetched successfully!')
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

    if (images && savedMovie) {
      await saveImages(savedMovie[0].id)
    }

    setMessageType('success')
    setMessage('Movie saved successfully!')
    setMovieData(null)
    setImages(null)
    setTmdbId('')
  }

  const saveImages = async (movieId) => {
    if (images.logos) {
      for (const logo of images.logos.slice(0, 5)) {
        await mediaStorageService.uploadAndInsertMovieMedia({
          type: 'logos',
          movieId,
          remoteUrl: tmdbService.getImageUrl(logo.file_path),
          width: logo.width ?? null,
          height: logo.height ?? null,
          requireStorage: true,
          allowLegacyFallback: false
        })
      }
    }

    if (images.posters) {
      for (const poster of images.posters.slice(0, 10)) {
        await mediaStorageService.uploadAndInsertMovieMedia({
          type: 'posters',
          movieId,
          remoteUrl: tmdbService.getImageUrl(poster.file_path),
          width: poster.width ?? null,
          height: poster.height ?? null,
          requireStorage: true,
          allowLegacyFallback: false
        })
      }
    }

    if (images.backdrops) {
      for (const backdrop of images.backdrops.slice(0, 10)) {
        await mediaStorageService.uploadAndInsertMovieMedia({
          type: 'backdrops',
          movieId,
          remoteUrl: tmdbService.getImageUrl(backdrop.file_path),
          width: backdrop.width ?? null,
          height: backdrop.height ?? null,
          requireStorage: true,
          allowLegacyFallback: false
        })
      }
    }
  }

  const [manualForm, setManualForm] = useState({
    title: '',
    type: 'movie',
    poster_url: '',
    backdrop_url: '',
    overview: '',
    release_year: '',
    genres: ''
  })

  const handleManualSubmit = async (e) => {
    e.preventDefault()
    const movie = {
      ...manualForm,
      release_year: parseInt(manualForm.release_year),
      genres: manualForm.genres.split(',').map((g) => g.trim())
    }

    const { error } = await movieService.createMovie(movie)
    if (error) {
      setMessageType('error')
      setMessage(`Error saving movie: ${error.message || error.details || 'Unknown error'}`)
    } else {
      setMessageType('success')
      setMessage('Movie added successfully!')
      setManualForm({
        title: '',
        type: 'movie',
        poster_url: '',
        backdrop_url: '',
        overview: '',
        release_year: '',
        genres: ''
      })
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-heading font-bold mb-8">Add Movie</h1>

      {loadingRole && (
        <div className="bg-dark-card p-6 rounded-lg mb-8 text-gray-300">
          Checking admin access...
        </div>
      )}

      {!loadingRole && role !== 'admin' && (
        <div className="bg-dark-card p-6 rounded-lg mb-8 text-gray-300">
          You need admin access to add or import movies. Go to the admin dashboard to sign in and set your role.
          <div className="mt-4">
            <Link
              to="/admin"
              className="inline-flex items-center px-4 py-2 rounded bg-gray-800 hover:bg-gray-700 transition"
            >
              Go to Admin Dashboard
            </Link>
          </div>
        </div>
      )}

      {role === 'admin' && (
        <div className="space-y-8">
          <div className="bg-dark-card p-8 rounded-lg">
            <h2 className="text-2xl font-heading font-semibold mb-4">Import from TMDB</h2>

            <div className="mb-6">
              <label className="block mb-2">Search TMDB</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && searchTMDB()}
                  className="flex-1 px-4 py-2 bg-gray-800 rounded"
                  placeholder="Search for movies or series..."
                />
                <button
                  onClick={searchTMDB}
                  disabled={searching}
                  className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded disabled:opacity-50"
                >
                  {searching ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>

            {searchResults.length > 0 && (
              <div className="mb-6 max-h-96 overflow-y-auto">
                <h3 className="font-semibold mb-3">Search Results:</h3>
                <div className="space-y-2">
                  {searchResults.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => selectFromSearch(item)}
                      className="flex gap-4 p-3 bg-gray-800 rounded hover:bg-gray-700 cursor-pointer transition"
                    >
                      {item.poster_path && (
                        <img
                          src={tmdbService.getImageUrl(item.poster_path, 'w92')}
                          alt={item.title || item.name}
                          className="w-12 h-18 object-cover rounded"
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

            <div className="mb-4">
              <label className="block mb-2">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 rounded"
              >
                <option value="movie">Movie</option>
                <option value="series">Series</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block mb-2">TMDB ID</label>
              <input
                type="text"
                value={tmdbId}
                onChange={(e) => setTmdbId(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 rounded"
                placeholder="Enter TMDB ID or search above"
              />
            </div>

            <button
              onClick={fetchFromTMDB}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded mr-4 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Fetch Data'}
            </button>

            {movieData && (
              <button
                onClick={saveMovie}
                className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded"
              >
                Save Movie
              </button>
            )}

            {message && (
              <p className={`mt-4 ${messageType === 'error' ? 'text-red-400' : 'text-green-400'}`}>{message}</p>
            )}

            {movieData && (
              <div className="mt-6 p-4 bg-gray-800 rounded">
                <h3 className="font-semibold mb-2">{movieData.title || movieData.name}</h3>
                <p className="text-sm text-gray-400">{movieData.overview}</p>
              </div>
            )}
          </div>

          <div className="bg-dark-card p-8 rounded-lg">
            <h2 className="text-2xl font-heading font-semibold mb-4">Add Manually</h2>

            <form onSubmit={handleManualSubmit}>
              <div className="mb-4">
                <label className="block mb-2">Title</label>
                <input
                  type="text"
                  value={manualForm.title}
                  onChange={(e) => setManualForm({ ...manualForm, title: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 rounded"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2">Type</label>
                <select
                  value={manualForm.type}
                  onChange={(e) => setManualForm({ ...manualForm, type: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 rounded"
                >
                  <option value="movie">Movie</option>
                  <option value="series">Series</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block mb-2">Poster URL</label>
                <input
                  type="url"
                  value={manualForm.poster_url}
                  onChange={(e) => setManualForm({ ...manualForm, poster_url: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 rounded"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2">Backdrop URL</label>
                <input
                  type="url"
                  value={manualForm.backdrop_url}
                  onChange={(e) => setManualForm({ ...manualForm, backdrop_url: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 rounded"
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2">Overview</label>
                <textarea
                  value={manualForm.overview}
                  onChange={(e) => setManualForm({ ...manualForm, overview: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 rounded"
                  rows="4"
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2">Release Year</label>
                <input
                  type="number"
                  value={manualForm.release_year}
                  onChange={(e) => setManualForm({ ...manualForm, release_year: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 rounded"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2">Genres (comma separated)</label>
                <input
                  type="text"
                  value={manualForm.genres}
                  onChange={(e) => setManualForm({ ...manualForm, genres: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 rounded"
                  placeholder="Action, Drama, Thriller"
                />
              </div>

              <button type="submit" className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded">
                Add Movie
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
