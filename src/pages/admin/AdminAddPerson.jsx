import { useEffect, useState } from 'react'
import { tmdbService } from '../../services/tmdbService'
import { personService } from '../../services/personService'
import { personWallpaperService } from '../../services/personWallpaperService'

export default function AdminAddPerson() {
  const [tmdbId, setTmdbId] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('success')
  const [personData, setPersonData] = useState(null)
  const [persons, setPersons] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [searchRan, setSearchRan] = useState(false)
  const [searchCount, setSearchCount] = useState(0)
  const [searchError, setSearchError] = useState('')

  const [manualForm, setManualForm] = useState({
    name: '',
    profile_url: '',
    biography: '',
    birthday: '',
    place_of_birth: '',
    known_for: ''
  })

  const [wallpaperForm, setWallpaperForm] = useState({
    person_id: '',
    image_url: '',
    resolution: '',
    download_url: ''
  })

  const resolveImageResolution = (url) => {
    if (!url) return
    const img = new Image()
    img.onload = () => {
      const res = `${img.naturalWidth}x${img.naturalHeight}`
      setWallpaperForm((prev) => ({ ...prev, resolution: res }))
    }
    img.onerror = () => {
      setMessageType('error')
      setMessage('Unable to read image resolution. Check the URL.')
    }
    img.src = url
  }

  useEffect(() => {
    loadPersons()
  }, [])

  const loadPersons = async () => {
    const { data } = await personService.getAll()
    setPersons(data || [])
  }

  const searchTMDB = async () => {
    if (!searchQuery.trim()) return
    setSearching(true)
    setSearchRan(true)
    setSearchError('')
    try {
      const results = await tmdbService.searchMulti(searchQuery)
      const filtered = (results.results || []).filter((item) => item.media_type === 'person')
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
      const details = await tmdbService.getPersonDetails(tmdbId)
      setPersonData(details)
      setMessageType('success')
      setMessage('Person fetched successfully!')
    } catch (error) {
      setMessageType('error')
      setMessage(`Error fetching from TMDB: ${error?.message || 'Unknown error'}`)
    }
    setLoading(false)
  }

  const saveImportedPerson = async () => {
    if (!personData) return
    const payload = {
      tmdb_id: personData.id,
      name: personData.name,
      profile_url: tmdbService.getImageUrl(personData.profile_path),
      biography: personData.biography,
      birthday: personData.birthday || null,
      deathday: personData.deathday || null,
      place_of_birth: personData.place_of_birth,
      known_for: personData.known_for_department
    }
    const { error } = await personService.create(payload)
    if (error) {
      setMessageType('error')
      setMessage(`Error saving person: ${error.message || error.details || 'Unknown error'}`)
      return
    }
    setMessageType('success')
    setMessage('Person saved successfully!')
    setPersonData(null)
    setTmdbId('')
    loadPersons()
  }

  const handleManualSubmit = async (e) => {
    e.preventDefault()
    const payload = {
      ...manualForm,
      birthday: manualForm.birthday || null
    }
    const { error } = await personService.create(payload)
    if (error) {
      setMessageType('error')
      setMessage(`Error saving person: ${error.message || error.details || 'Unknown error'}`)
      return
    }
    setMessageType('success')
    setMessage('Person added successfully!')
    setManualForm({
      name: '',
      profile_url: '',
      biography: '',
      birthday: '',
      place_of_birth: '',
      known_for: ''
    })
    loadPersons()
  }

  const handleWallpaperSubmit = async (e) => {
    e.preventDefault()
    if (!wallpaperForm.person_id) {
      setMessageType('error')
      setMessage('Select a person first.')
      return
    }
    const { error } = await personWallpaperService.create({
      ...wallpaperForm,
      download_url: wallpaperForm.download_url || wallpaperForm.image_url
    })
    if (error) {
      setMessageType('error')
      setMessage(`Error saving wallpaper: ${error.message || error.details || 'Unknown error'}`)
      return
    }
    setMessageType('success')
    setMessage('Wallpaper added successfully!')
    setWallpaperForm({
      person_id: '',
      image_url: '',
      resolution: '',
      download_url: ''
    })
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-4">
      <h1 className="text-xl font-semibold mb-4 font-heading">Add Person</h1>

      <div className="bg-[#111] rounded-xl p-4 space-y-3">
        <h2 className="text-sm font-medium font-heading text-neutral-200">Import from TMDB</h2>

        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchTMDB()}
              className="flex-1 px-3 py-2 text-sm rounded-lg bg-black border border-[#222] focus:outline-none focus:ring-2 focus:ring-purple-600/40"
              placeholder="Search person"
            />
            <button
              onClick={searchTMDB}
              disabled={searching}
              className="px-4 py-2 text-sm rounded-lg bg-purple-600 text-white disabled:opacity-50"
            >
              {searching ? '...' : 'Search'}
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="max-h-52 overflow-y-auto space-y-2">
              {searchResults.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectFromSearch(item)}
                  className="w-full text-left flex items-center gap-3 bg-[#161616] rounded-lg p-2 hover:bg-[#1c1c1c] transition"
                >
                  {item.profile_path ? (
                    <img
                      src={tmdbService.getImageUrl(item.profile_path, 'w92')}
                      alt={item.name}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-black/40 border border-[#222] flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium font-heading truncate">{item.name}</p>
                    <p className="text-xs text-neutral-400 font-body">{item.known_for_department || 'Person'}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {searchError && <p className="text-xs text-red-400 font-body">{searchError}</p>}
          {!searchError && searchRan && <p className="text-xs text-green-400 font-body">Found {searchCount} results</p>}

          <input
            type="text"
            value={tmdbId}
            onChange={(e) => setTmdbId(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg bg-[#1a1a1a] border border-[#222]"
            placeholder="TMDB person ID"
          />

          <div className="flex flex-wrap gap-2">
            <button
              onClick={fetchFromTMDB}
              disabled={loading || !tmdbId}
              className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white disabled:opacity-60"
            >
              {loading ? 'Loading...' : 'Fetch Data'}
            </button>
            {personData && (
              <button onClick={saveImportedPerson} className="px-4 py-2 text-sm rounded-lg bg-green-600 text-white">
                Save Person
              </button>
            )}
          </div>

          {personData && (
            <div className="rounded-lg bg-[#161616] border border-white/10 p-3">
              <p className="text-sm font-medium font-heading">{personData.name}</p>
              {personData.biography && <p className="text-xs text-neutral-400 font-body mt-2 line-clamp-4">{personData.biography}</p>}
            </div>
          )}
        </div>
      </div>

      <div className="bg-[#111] rounded-xl p-4 space-y-3">
        <h2 className="text-sm font-medium font-heading text-neutral-200">Add Manually</h2>
        <form onSubmit={handleManualSubmit} className="space-y-3">
          <input
            type="text"
            value={manualForm.name}
            onChange={(e) => setManualForm({ ...manualForm, name: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-[#1a1a1a] rounded-lg border border-[#222]"
            placeholder="Name"
            required
          />

          <input
            type="url"
            value={manualForm.profile_url}
            onChange={(e) => setManualForm({ ...manualForm, profile_url: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-[#1a1a1a] rounded-lg border border-[#222]"
            placeholder="Profile image URL"
            required
          />

          <textarea
            value={manualForm.biography}
            onChange={(e) => setManualForm({ ...manualForm, biography: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-[#1a1a1a] rounded-lg border border-[#222] h-24"
            placeholder="Biography"
          />

          <div className="grid grid-cols-2 gap-3">
            <input
              type="date"
              value={manualForm.birthday}
              onChange={(e) => setManualForm({ ...manualForm, birthday: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-[#1a1a1a] rounded-lg border border-[#222]"
            />
            <input
              type="text"
              value={manualForm.place_of_birth}
              onChange={(e) => setManualForm({ ...manualForm, place_of_birth: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-[#1a1a1a] rounded-lg border border-[#222]"
              placeholder="Place of birth"
            />
          </div>

          <input
            type="text"
            value={manualForm.known_for}
            onChange={(e) => setManualForm({ ...manualForm, known_for: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-[#1a1a1a] rounded-lg border border-[#222]"
            placeholder="Known for (Actor, Director, etc.)"
          />

          <button type="submit" className="w-full px-4 py-2 text-sm rounded-lg bg-green-600 text-white">
            Add Person
          </button>
        </form>
      </div>

      <div className="bg-[#111] rounded-xl p-4 space-y-3">
        <h2 className="text-sm font-medium font-heading text-neutral-200">Add Person Wallpaper</h2>
        <form onSubmit={handleWallpaperSubmit} className="space-y-3">
          <select
            value={wallpaperForm.person_id}
            onChange={(e) => setWallpaperForm({ ...wallpaperForm, person_id: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-[#1a1a1a] rounded-lg border border-[#222]"
            required
          >
            <option value="">Select person</option>
            {persons.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name}
              </option>
            ))}
          </select>

          <input
            type="url"
            value={wallpaperForm.image_url}
            onChange={(e) => setWallpaperForm({ ...wallpaperForm, image_url: e.target.value })}
            onBlur={(e) => resolveImageResolution(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-[#1a1a1a] rounded-lg border border-[#222]"
            placeholder="Wallpaper image URL"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              value={wallpaperForm.resolution}
              onChange={(e) => setWallpaperForm({ ...wallpaperForm, resolution: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-[#1a1a1a] rounded-lg border border-[#222]"
              placeholder="3840x2160"
            />
            <input
              type="url"
              value={wallpaperForm.download_url}
              onChange={(e) => setWallpaperForm({ ...wallpaperForm, download_url: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-[#1a1a1a] rounded-lg border border-[#222]"
              placeholder="Download URL (optional)"
            />
          </div>

          <button type="submit" className="w-full px-4 py-2 text-sm rounded-lg bg-green-600 text-white">
            Add Wallpaper
          </button>
        </form>
      </div>

      {message && (
        <p className={`text-xs ${messageType === 'error' ? 'text-red-400' : 'text-green-400'} font-body`}>{message}</p>
      )}
    </div>
  )
}
