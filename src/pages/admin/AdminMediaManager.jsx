
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import AuthPanel from '../../components/ui/AuthPanel'
import { supabase } from '../../services/supabaseClient'
import { movieService } from '../../services/movieService'
import { wallpaperService } from '../../services/wallpaperService'
import { logoService } from '../../services/logoService'
import { posterService } from '../../services/posterService'
import { backdropService } from '../../services/backdropService'
import { personService } from '../../services/personService'
import { personWallpaperService } from '../../services/personWallpaperService'

export default function AdminMediaManager() {
  const [session, setSession] = useState(null)
  const [role, setRole] = useState(null)
  const [loadingRole, setLoadingRole] = useState(true)
  const [activeTab, setActiveTab] = useState('movies')
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('success')
  const [loadingData, setLoadingData] = useState(false)
  const [movies, setMovies] = useState([])
  const [wallpapers, setWallpapers] = useState([])
  const [logos, setLogos] = useState([])
  const [posters, setPosters] = useState([])
  const [backdrops, setBackdrops] = useState([])
  const [persons, setPersons] = useState([])
  const [personWallpapers, setPersonWallpapers] = useState([])
  const [newPerson, setNewPerson] = useState({
    name: '',
    profile_url: '',
    biography: '',
    birthday: '',
    place_of_birth: '',
    known_for: ''
  })

  const fetchRole = async (userId) => {
    if (!userId) {
      setRole(null)
      setLoadingRole(false)
      return
    }
    const { data, error } = await supabase.from('users').select('role').eq('id', userId).single()
    if (error) {
      setRole(null)
    } else {
      setRole(data?.role ?? null)
    }
    setLoadingRole(false)
  }

  useEffect(() => {
    let isMounted = true
    const init = async () => {
      const { data } = await supabase.auth.getSession()
      if (!isMounted) return
      setSession(data?.session ?? null)
      await fetchRole(data?.session?.user?.id)
    }
    init()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!isMounted) return
      setSession(newSession)
      setLoadingRole(true)
      fetchRole(newSession?.user?.id)
    })

    return () => {
      isMounted = false
      listener?.subscription?.unsubscribe()
    }
  }, [])

  const canManage = role === 'admin'

  const tabs = useMemo(
    () => [
      { id: 'movies', label: 'Movies' },
      { id: 'wallpapers', label: 'Wallpapers' },
      { id: 'logos', label: 'Logos' },
      { id: 'posters', label: 'Posters' },
      { id: 'backdrops', label: 'Backdrops' },
      { id: 'persons', label: 'Persons' },
      { id: 'person_wallpapers', label: 'Person Wallpapers' }
    ],
    []
  )

  const loadData = async () => {
    if (!canManage) return
    setLoadingData(true)
    setMessage('')
    const [movieRes, wallpaperRes, logoRes, posterRes, backdropRes, personRes, personWallpaperRes] = await Promise.all([
      movieService.getAllEntries(),
      wallpaperService.getAll(),
      logoService.getAll(),
      posterService.getAll(),
      backdropService.getAll(),
      personService.getAll(),
      personWallpaperService.getAll()
    ])
    setMovies(movieRes.data || [])
    setWallpapers(wallpaperRes.data || [])
    setLogos(logoRes.data || [])
    setPosters(posterRes.data || [])
    setBackdrops(backdropRes.data || [])
    setPersons(personRes.data || [])
    setPersonWallpapers(personWallpaperRes.data || [])
    setLoadingData(false)
  }

  useEffect(() => {
    if (canManage) {
      loadData()
    }
  }, [canManage])

  const handleSave = async (type, id, updates) => {
    setMessage('')
    let result
    if (type === 'movies') result = await movieService.updateMovie(id, updates)
    if (type === 'wallpapers') result = await wallpaperService.update(id, updates)
    if (type === 'logos') result = await logoService.update(id, updates)
    if (type === 'posters') result = await posterService.update(id, updates)
    if (type === 'backdrops') result = await backdropService.update(id, updates)
    if (type === 'persons') result = await personService.update(id, updates)
    if (type === 'person_wallpapers') result = await personWallpaperService.update(id, updates)

    if (result?.error) {
      setMessageType('error')
      setMessage(result.error.message || 'Update failed')
      return
    }
    setMessageType('success')
    setMessage('Updated successfully.')
    await loadData()
  }

  const handleDelete = async (type, id) => {
    setMessage('')
    let result
    if (type === 'movies') result = await movieService.deleteMovie(id)
    if (type === 'wallpapers') result = await wallpaperService.delete(id)
    if (type === 'logos') result = await logoService.delete(id)
    if (type === 'posters') result = await posterService.delete(id)
    if (type === 'backdrops') result = await backdropService.delete(id)
    if (type === 'persons') result = await personService.delete(id)
    if (type === 'person_wallpapers') result = await personWallpaperService.delete(id)

    if (result?.error) {
      setMessageType('error')
      setMessage(result.error.message || 'Delete failed')
      return
    }
    setMessageType('success')
    setMessage('Deleted successfully.')
    await loadData()
  }

  const handleCreatePerson = async () => {
    setMessage('')
    if (!newPerson.name.trim()) {
      setMessageType('error')
      setMessage('Name is required to add a person.')
      return
    }
    const { error } = await personService.create({
      ...newPerson,
      birthday: newPerson.birthday || null
    })
    if (error) {
      setMessageType('error')
      setMessage(error.message || 'Create failed')
      return
    }
    setMessageType('success')
    setMessage('Person added successfully.')
    setNewPerson({
      name: '',
      profile_url: '',
      biography: '',
      birthday: '',
      place_of_birth: '',
      known_for: ''
    })
    await loadData()
  }

  const syncMovieImages = async (movie) => {
    // Intentionally disabled: assets are curated and added manually.
    if (!movie?.tmdb_id) return
    setMessageType('success')
    setMessage('TMDB image sync is disabled. Add logos/posters/backdrops/wallpapers manually.')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-heading font-bold mb-8">Admin Media Manager</h1>

      <div className="mb-8">
        <AuthPanel onAuthChange={setSession} />
      </div>

      {!session && (
        <div className="bg-dark-card p-6 rounded-lg mb-8 text-gray-300">
          Sign in to access admin tools. After signing in, run `add-admin.sql` once to grant your account admin rights.
        </div>
      )}

      {session && !loadingRole && role !== 'admin' && (
        <div className="bg-dark-card p-6 rounded-lg mb-8 text-gray-300">
          Your account is signed in but not marked as admin. Run `add-admin.sql` to set your role to admin.
        </div>
      )}

      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${role === 'admin' ? '' : 'opacity-50 pointer-events-none'}`}>
        <Link to="/admin/add-movie" className="bg-dark-card p-8 rounded-lg hover:bg-gray-800 transition">
          <h3 className="text-2xl font-heading font-semibold mb-2">Add Movie</h3>
          <p className="text-gray-400">Import from TMDB or add manually</p>
        </Link>

        <Link to="/admin/add-person" className="bg-dark-card p-8 rounded-lg hover:bg-gray-800 transition">
          <h3 className="text-2xl font-heading font-semibold mb-2">Add Person</h3>
          <p className="text-gray-400">Import persons or add wallpapers</p>
        </Link>

        <div className="bg-dark-card p-8 rounded-lg">
          <h3 className="text-2xl font-heading font-semibold mb-2">Manage Content</h3>
          <p className="text-gray-400">Edit or delete existing entries below</p>
        </div>
      </div>

      {canManage && (
        <div className="mt-10 bg-dark-card p-6 rounded-lg">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <h2 className="text-2xl font-heading font-semibold">Manage Existing Data</h2>
            <button
              onClick={loadData}
              className="px-4 py-2 rounded bg-gray-800 hover:bg-gray-700 transition"
              disabled={loadingData}
            >
              {loadingData ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          <div className="flex flex-wrap gap-3 mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-full text-sm ${
                  activeTab === tab.id ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {message && (
            <p className={`mb-4 text-sm ${messageType === 'error' ? 'text-red-400' : 'text-green-400'}`}>
              {message}
            </p>
          )}

          {activeTab === 'movies' && (
            <div className="space-y-4">
              {movies.map((movie) => (
                <div key={movie.id} className="rounded-lg border border-gray-800 p-4 bg-gray-900/30">
                  <div className="grid gap-3 md:grid-cols-2">
                    <input
                      className="w-full px-3 py-2 bg-gray-800 rounded"
                      value={movie.title || ''}
                      onChange={(e) => {
                        const value = e.target.value
                        setMovies((prev) => prev.map((m) => (m.id === movie.id ? { ...m, title: value } : m)))
                      }}
                    />
                    <select
                      className="w-full px-3 py-2 bg-gray-800 rounded"
                      value={movie.type || 'movie'}
                      onChange={(e) => {
                        const value = e.target.value
                        setMovies((prev) => prev.map((m) => (m.id === movie.id ? { ...m, type: value } : m)))
                      }}
                    >
                      <option value="movie">Movie</option>
                      <option value="series">Series</option>
                    </select>
                    <input
                      className="w-full px-3 py-2 bg-gray-800 rounded"
                      placeholder="Poster URL"
                      value={movie.poster_url || ''}
                      onChange={(e) => {
                        const value = e.target.value
                        setMovies((prev) => prev.map((m) => (m.id === movie.id ? { ...m, poster_url: value } : m)))
                      }}
                    />
                    <input
                      className="w-full px-3 py-2 bg-gray-800 rounded"
                      placeholder="Backdrop URL"
                      value={movie.backdrop_url || ''}
                      onChange={(e) => {
                        const value = e.target.value
                        setMovies((prev) => prev.map((m) => (m.id === movie.id ? { ...m, backdrop_url: value } : m)))
                      }}
                    />
                    <input
                      className="w-full px-3 py-2 bg-gray-800 rounded"
                      placeholder="Release year"
                      value={movie.release_year || ''}
                      onChange={(e) => {
                        const value = e.target.value
                        setMovies((prev) => prev.map((m) => (m.id === movie.id ? { ...m, release_year: value } : m)))
                      }}
                    />
                    <input
                      className="w-full px-3 py-2 bg-gray-800 rounded"
                      placeholder="Genres (comma separated)"
                      value={Array.isArray(movie.genres) ? movie.genres.join(', ') : ''}
                      onChange={(e) => {
                        const value = e.target.value
                        setMovies((prev) =>
                          prev.map((m) =>
                            m.id === movie.id ? { ...m, genres: value.split(',').map((g) => g.trim()).filter(Boolean) } : m
                          )
                        )
                      }}
                    />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      onClick={() =>
                        handleSave('movies', movie.id, {
                          title: movie.title,
                          type: movie.type,
                          poster_url: movie.poster_url,
                          backdrop_url: movie.backdrop_url,
                          release_year: movie.release_year ? Number(movie.release_year) : null,
                          genres: movie.genres || []
                        })
                      }
                      className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => handleDelete('movies', movie.id)}
                      className="px-4 py-2 rounded bg-red-600 hover:bg-red-700"
                    >
                      Delete
                    </button>
                    {movie.tmdb_id && (
                      <button
                        onClick={() => syncMovieImages(movie)}
                        className="px-4 py-2 rounded bg-white/10 hover:bg-white/20"
                      >
                        Sync TMDB Images
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {movies.length === 0 && <p className="text-gray-400">No movies found.</p>}
            </div>
          )}

          {activeTab === 'wallpapers' && (
            <div className="space-y-4">
              {wallpapers.map((wallpaper) => (
                <div key={wallpaper.id} className="rounded-lg border border-gray-800 p-4 bg-gray-900/30">
                  <p className="text-sm text-gray-400 mb-3">{wallpaper.movies?.title || 'Unknown title'}</p>
                  <div className="grid gap-3 md:grid-cols-2">
                    <input
                      className="w-full px-3 py-2 bg-gray-800 rounded"
                      placeholder="Image URL"
                      value={wallpaper.image_url || ''}
                      onChange={(e) => {
                        const value = e.target.value
                        setWallpapers((prev) => prev.map((w) => (w.id === wallpaper.id ? { ...w, image_url: value } : w)))
                      }}
                    />
                    <input
                      className="w-full px-3 py-2 bg-gray-800 rounded"
                      placeholder="Resolution"
                      value={wallpaper.resolution || ''}
                      onChange={(e) => {
                        const value = e.target.value
                        setWallpapers((prev) => prev.map((w) => (w.id === wallpaper.id ? { ...w, resolution: value } : w)))
                      }}
                    />
                    <input
                      className="w-full px-3 py-2 bg-gray-800 rounded"
                      placeholder="Download URL"
                      value={wallpaper.download_url || ''}
                      onChange={(e) => {
                        const value = e.target.value
                        setWallpapers((prev) =>
                          prev.map((w) => (w.id === wallpaper.id ? { ...w, download_url: value } : w))
                        )
                      }}
                    />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      onClick={() =>
                        handleSave('wallpapers', wallpaper.id, {
                          image_url: wallpaper.image_url,
                          resolution: wallpaper.resolution,
                          download_url: wallpaper.download_url
                        })
                      }
                      className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => handleDelete('wallpapers', wallpaper.id)}
                      className="px-4 py-2 rounded bg-red-600 hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {wallpapers.length === 0 && <p className="text-gray-400">No wallpapers found.</p>}
            </div>
          )}

          {activeTab === 'logos' && (
            <div className="space-y-4">
              {logos.map((logo) => (
                <div key={logo.id} className="rounded-lg border border-gray-800 p-4 bg-gray-900/30">
                  <p className="text-sm text-gray-400 mb-3">{logo.movies?.title || 'Unknown title'}</p>
                  <div className="grid gap-3 md:grid-cols-2">
                    <input
                      className="w-full px-3 py-2 bg-gray-800 rounded"
                      placeholder="Logo URL"
                      value={logo.logo_url || ''}
                      onChange={(e) => {
                        const value = e.target.value
                        setLogos((prev) => prev.map((l) => (l.id === logo.id ? { ...l, logo_url: value } : l)))
                      }}
                    />
                    <input
                      className="w-full px-3 py-2 bg-gray-800 rounded"
                      placeholder="PNG URL"
                      value={logo.png_download || ''}
                      onChange={(e) => {
                        const value = e.target.value
                        setLogos((prev) => prev.map((l) => (l.id === logo.id ? { ...l, png_download: value } : l)))
                      }}
                    />
                    <input
                      className="w-full px-3 py-2 bg-gray-800 rounded"
                      placeholder="SVG URL"
                      value={logo.svg_download || ''}
                      onChange={(e) => {
                        const value = e.target.value
                        setLogos((prev) => prev.map((l) => (l.id === logo.id ? { ...l, svg_download: value } : l)))
                      }}
                    />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      onClick={() =>
                        handleSave('logos', logo.id, {
                          logo_url: logo.logo_url,
                          png_download: logo.png_download,
                          svg_download: logo.svg_download
                        })
                      }
                      className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => handleDelete('logos', logo.id)}
                      className="px-4 py-2 rounded bg-red-600 hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {logos.length === 0 && <p className="text-gray-400">No logos found.</p>}
            </div>
          )}

          {activeTab === 'posters' && (
            <div className="space-y-4">
              {posters.map((poster) => (
                <div key={poster.id} className="rounded-lg border border-gray-800 p-4 bg-gray-900/30">
                  <p className="text-sm text-gray-400 mb-3">{poster.movies?.title || 'Unknown title'}</p>
                  <div className="grid gap-3 md:grid-cols-2">
                    <input
                      className="w-full px-3 py-2 bg-gray-800 rounded"
                      placeholder="Poster URL"
                      value={poster.poster_url || ''}
                      onChange={(e) => {
                        const value = e.target.value
                        setPosters((prev) => prev.map((p) => (p.id === poster.id ? { ...p, poster_url: value } : p)))
                      }}
                    />
                    <input
                      className="w-full px-3 py-2 bg-gray-800 rounded"
                      placeholder="Download URL"
                      value={poster.download_url || ''}
                      onChange={(e) => {
                        const value = e.target.value
                        setPosters((prev) =>
                          prev.map((p) => (p.id === poster.id ? { ...p, download_url: value } : p))
                        )
                      }}
                    />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      onClick={() =>
                        handleSave('posters', poster.id, {
                          poster_url: poster.poster_url,
                          download_url: poster.download_url
                        })
                      }
                      className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => handleDelete('posters', poster.id)}
                      className="px-4 py-2 rounded bg-red-600 hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {posters.length === 0 && <p className="text-gray-400">No posters found.</p>}
            </div>
          )}

          {activeTab === 'backdrops' && (
            <div className="space-y-4">
              {backdrops.map((backdrop) => (
                <div key={backdrop.id} className="rounded-lg border border-gray-800 p-4 bg-gray-900/30">
                  <p className="text-sm text-gray-400 mb-3">{backdrop.movies?.title || 'Unknown title'}</p>
                  <div className="grid gap-3 md:grid-cols-2">
                    <input
                      className="w-full px-3 py-2 bg-gray-800 rounded"
                      placeholder="Backdrop URL"
                      value={backdrop.backdrop_url || ''}
                      onChange={(e) => {
                        const value = e.target.value
                        setBackdrops((prev) =>
                          prev.map((b) => (b.id === backdrop.id ? { ...b, backdrop_url: value } : b))
                        )
                      }}
                    />
                    <input
                      className="w-full px-3 py-2 bg-gray-800 rounded"
                      placeholder="Download URL"
                      value={backdrop.download_url || ''}
                      onChange={(e) => {
                        const value = e.target.value
                        setBackdrops((prev) =>
                          prev.map((b) => (b.id === backdrop.id ? { ...b, download_url: value } : b))
                        )
                      }}
                    />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      onClick={() =>
                        handleSave('backdrops', backdrop.id, {
                          backdrop_url: backdrop.backdrop_url,
                          download_url: backdrop.download_url
                        })
                      }
                      className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => handleDelete('backdrops', backdrop.id)}
                      className="px-4 py-2 rounded bg-red-600 hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {backdrops.length === 0 && <p className="text-gray-400">No backdrops found.</p>}
            </div>
          )}

          {activeTab === 'persons' && (
            <div className="space-y-4">
              <div className="rounded-lg border border-gray-800 p-4 bg-gray-900/30">
                <h3 className="font-heading font-semibold mb-3">Add Person Manually</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    className="w-full px-3 py-2 bg-gray-800 rounded"
                    placeholder="Name"
                    value={newPerson.name}
                    onChange={(e) => setNewPerson((prev) => ({ ...prev, name: e.target.value }))}
                  />
                  <input
                    className="w-full px-3 py-2 bg-gray-800 rounded"
                    placeholder="Profile URL"
                    value={newPerson.profile_url}
                    onChange={(e) => setNewPerson((prev) => ({ ...prev, profile_url: e.target.value }))}
                  />
                  <input
                    className="w-full px-3 py-2 bg-gray-800 rounded"
                    placeholder="Birthday"
                    value={newPerson.birthday}
                    onChange={(e) => setNewPerson((prev) => ({ ...prev, birthday: e.target.value }))}
                  />
                  <input
                    className="w-full px-3 py-2 bg-gray-800 rounded"
                    placeholder="Place of birth"
                    value={newPerson.place_of_birth}
                    onChange={(e) => setNewPerson((prev) => ({ ...prev, place_of_birth: e.target.value }))}
                  />
                  <input
                    className="w-full px-3 py-2 bg-gray-800 rounded"
                    placeholder="Known for"
                    value={newPerson.known_for}
                    onChange={(e) => setNewPerson((prev) => ({ ...prev, known_for: e.target.value }))}
                  />
                  <textarea
                    className="w-full px-3 py-2 bg-gray-800 rounded md:col-span-2"
                    placeholder="Biography"
                    rows="3"
                    value={newPerson.biography}
                    onChange={(e) => setNewPerson((prev) => ({ ...prev, biography: e.target.value }))}
                  />
                </div>
                <div className="mt-4">
                  <button
                    onClick={handleCreatePerson}
                    className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700"
                  >
                    Add Person
                  </button>
                </div>
              </div>

              {persons.map((person) => (
                <div key={person.id} className="rounded-lg border border-gray-800 p-4 bg-gray-900/30">
                  <div className="grid gap-3 md:grid-cols-2">
                    <input
                      className="w-full px-3 py-2 bg-gray-800 rounded"
                      value={person.name || ''}
                      onChange={(e) => {
                        const value = e.target.value
                        setPersons((prev) => prev.map((p) => (p.id === person.id ? { ...p, name: value } : p)))
                      }}
                    />
                    <input
                      className="w-full px-3 py-2 bg-gray-800 rounded"
                      placeholder="Profile URL"
                      value={person.profile_url || ''}
                      onChange={(e) => {
                        const value = e.target.value
                        setPersons((prev) => prev.map((p) => (p.id === person.id ? { ...p, profile_url: value } : p)))
                      }}
                    />
                    <input
                      className="w-full px-3 py-2 bg-gray-800 rounded"
                      placeholder="Birthday"
                      value={person.birthday || ''}
                      onChange={(e) => {
                        const value = e.target.value
                        setPersons((prev) => prev.map((p) => (p.id === person.id ? { ...p, birthday: value } : p)))
                      }}
                    />
                    <input
                      className="w-full px-3 py-2 bg-gray-800 rounded"
                      placeholder="Place of birth"
                      value={person.place_of_birth || ''}
                      onChange={(e) => {
                        const value = e.target.value
                        setPersons((prev) => prev.map((p) => (p.id === person.id ? { ...p, place_of_birth: value } : p)))
                      }}
                    />
                    <input
                      className="w-full px-3 py-2 bg-gray-800 rounded"
                      placeholder="Known for"
                      value={person.known_for || ''}
                      onChange={(e) => {
                        const value = e.target.value
                        setPersons((prev) => prev.map((p) => (p.id === person.id ? { ...p, known_for: value } : p)))
                      }}
                    />
                    <textarea
                      className="w-full px-3 py-2 bg-gray-800 rounded md:col-span-2"
                      placeholder="Biography"
                      rows="3"
                      value={person.biography || ''}
                      onChange={(e) => {
                        const value = e.target.value
                        setPersons((prev) => prev.map((p) => (p.id === person.id ? { ...p, biography: value } : p)))
                      }}
                    />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      onClick={() =>
                        handleSave('persons', person.id, {
                          name: person.name,
                          profile_url: person.profile_url,
                          biography: person.biography,
                          birthday: person.birthday || null,
                          place_of_birth: person.place_of_birth,
                          known_for: person.known_for
                        })
                      }
                      className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => handleDelete('persons', person.id)}
                      className="px-4 py-2 rounded bg-red-600 hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {persons.length === 0 && <p className="text-gray-400">No persons found.</p>}
            </div>
          )}

          {activeTab === 'person_wallpapers' && (
            <div className="space-y-4">
              {personWallpapers.map((wallpaper) => (
                <div key={wallpaper.id} className="rounded-lg border border-gray-800 p-4 bg-gray-900/30">
                  <p className="text-sm text-gray-400 mb-3">{wallpaper.persons?.name || 'Unknown person'}</p>
                  <div className="grid gap-3 md:grid-cols-2">
                    <input
                      className="w-full px-3 py-2 bg-gray-800 rounded"
                      placeholder="Image URL"
                      value={wallpaper.image_url || ''}
                      onChange={(e) => {
                        const value = e.target.value
                        setPersonWallpapers((prev) =>
                          prev.map((w) => (w.id === wallpaper.id ? { ...w, image_url: value } : w))
                        )
                      }}
                    />
                    <input
                      className="w-full px-3 py-2 bg-gray-800 rounded"
                      placeholder="Resolution"
                      value={wallpaper.resolution || ''}
                      onChange={(e) => {
                        const value = e.target.value
                        setPersonWallpapers((prev) =>
                          prev.map((w) => (w.id === wallpaper.id ? { ...w, resolution: value } : w))
                        )
                      }}
                    />
                    <input
                      className="w-full px-3 py-2 bg-gray-800 rounded"
                      placeholder="Download URL"
                      value={wallpaper.download_url || ''}
                      onChange={(e) => {
                        const value = e.target.value
                        setPersonWallpapers((prev) =>
                          prev.map((w) => (w.id === wallpaper.id ? { ...w, download_url: value } : w))
                        )
                      }}
                    />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      onClick={() =>
                        handleSave('person_wallpapers', wallpaper.id, {
                          image_url: wallpaper.image_url,
                          resolution: wallpaper.resolution,
                          download_url: wallpaper.download_url
                        })
                      }
                      className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => handleDelete('person_wallpapers', wallpaper.id)}
                      className="px-4 py-2 rounded bg-red-600 hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {personWallpapers.length === 0 && <p className="text-gray-400">No person wallpapers found.</p>}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
