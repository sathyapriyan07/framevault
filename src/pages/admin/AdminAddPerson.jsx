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
    setMessage('')
    try {
      const results = await tmdbService.searchMulti(searchQuery)
      const filtered = (results.results || []).filter((item) => item.media_type === 'person')
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
    setSearchResults([])
    setSearchQuery('')
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-heading font-bold mb-8">Add Person</h1>

      <div className="bg-dark-card p-8 rounded-lg mb-8">
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
              placeholder="Search for persons..."
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
                  {item.profile_path && (
                    <img
                      src={tmdbService.getImageUrl(item.profile_path, 'w92')}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded-full"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="font-semibold">{item.name}</h4>
                    <p className="text-sm text-gray-400">{item.known_for_department || 'Person'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-4">
          <label className="block mb-2">TMDB Person ID</label>
          <input
            type="text"
            value={tmdbId}
            onChange={(e) => setTmdbId(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 rounded"
            placeholder="Enter TMDB person ID"
          />
        </div>
        <button
          onClick={fetchFromTMDB}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Fetch Data'}
        </button>
        {personData && (
          <button
            onClick={saveImportedPerson}
            className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded ml-4"
          >
            Save Person
          </button>
        )}
        {personData && (
          <div className="mt-6 p-4 bg-gray-800 rounded">
            <h3 className="font-semibold mb-2">{personData.name}</h3>
            <p className="text-sm text-gray-400">{personData.biography}</p>
          </div>
        )}
      </div>

      <div className="bg-dark-card p-8 rounded-lg mb-8">
        <h2 className="text-2xl font-heading font-semibold mb-4">Add Manually</h2>
        <form onSubmit={handleManualSubmit}>
          <div className="mb-4">
            <label className="block mb-2">Name</label>
            <input
              type="text"
              value={manualForm.name}
              onChange={(e) => setManualForm({ ...manualForm, name: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">Profile Image URL</label>
            <input
              type="url"
              value={manualForm.profile_url}
              onChange={(e) => setManualForm({ ...manualForm, profile_url: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">Biography</label>
            <textarea
              value={manualForm.biography}
              onChange={(e) => setManualForm({ ...manualForm, biography: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 rounded"
              rows="4"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">Birth Date</label>
            <input
              type="date"
              value={manualForm.birthday}
              onChange={(e) => setManualForm({ ...manualForm, birthday: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">Place of Birth</label>
            <input
              type="text"
              value={manualForm.place_of_birth}
              onChange={(e) => setManualForm({ ...manualForm, place_of_birth: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">Known For</label>
            <input
              type="text"
              value={manualForm.known_for}
              onChange={(e) => setManualForm({ ...manualForm, known_for: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 rounded"
              placeholder="Actor, Director, etc."
            />
          </div>
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded">
            Add Person
          </button>
        </form>
      </div>

      <div className="bg-dark-card p-8 rounded-lg">
        <h2 className="text-2xl font-heading font-semibold mb-4">Add Person Wallpaper</h2>
        <form onSubmit={handleWallpaperSubmit}>
          <div className="mb-4">
            <label className="block mb-2">Person</label>
            <select
              value={wallpaperForm.person_id}
              onChange={(e) => setWallpaperForm({ ...wallpaperForm, person_id: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 rounded"
              required
            >
              <option value="">Select person</option>
              {persons.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block mb-2">Wallpaper Image URL</label>
            <input
              type="url"
              value={wallpaperForm.image_url}
              onChange={(e) => setWallpaperForm({ ...wallpaperForm, image_url: e.target.value })}
              onBlur={(e) => resolveImageResolution(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">Resolution</label>
            <input
              type="text"
              value={wallpaperForm.resolution}
              onChange={(e) => setWallpaperForm({ ...wallpaperForm, resolution: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 rounded"
              placeholder="3840x2160"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">Download URL</label>
            <input
              type="url"
              value={wallpaperForm.download_url}
              onChange={(e) => setWallpaperForm({ ...wallpaperForm, download_url: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 rounded"
            />
          </div>
          <button type="submit" className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded">
            Add Wallpaper
          </button>
        </form>
      </div>

      {message && (
        <p className={`mt-6 ${messageType === 'error' ? 'text-red-400' : 'text-green-400'}`}>{message}</p>
      )}
    </div>
  )
}
