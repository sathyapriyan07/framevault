import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { personService } from '../../services/personService'
import { personWallpaperService } from '../../services/personWallpaperService'
import PersonWallpaperCard from '../../components/media/PersonWallpaperCard'
import Grid from '../../components/ui/Grid'
import Loader from '../../components/ui/Loader'
import { formatDate } from '../../utils/formatDate'

export default function PersonDetailsPage() {
  const { id } = useParams()
  const [person, setPerson] = useState(null)
  const [wallpapers, setWallpapers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const { data } = await personService.getById(id)
      const { data: wp } = await personWallpaperService.getByPersonId(id)
      setPerson(data)
      setWallpapers(wp || [])
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) return <Loader />
  if (!person) return <div className="text-center py-20">Person not found.</div>

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-12">
      <div className="flex flex-col md:flex-row gap-6 md:gap-10 mb-8 md:mb-12">
        <img
          src={person.profile_url || 'https://via.placeholder.com/400x600?text=No+Image'}
          alt={person.name}
          className="w-full max-w-[200px] md:max-w-sm rounded-lg md:rounded-2xl shadow-lg object-cover"
        />
        <div className="flex-1">
          <h1 className="text-2xl md:text-4xl font-heading font-bold mb-2 md:mb-3">{person.name}</h1>
          {person.known_for && <p className="text-xs md:text-sm text-blue-300 mb-3 md:mb-4">{person.known_for}</p>}
          <div className="flex flex-wrap gap-3 md:gap-4 text-xs md:text-sm text-gray-300 mb-4 md:mb-6">
            {person.birthday && <span>Born: {formatDate(person.birthday)}</span>}
            {person.place_of_birth && <span>Place: {person.place_of_birth}</span>}
          </div>
          <p className="text-sm md:text-base text-gray-300 leading-relaxed">{person.biography || 'No biography available.'}</p>
        </div>
      </div>

      <section>
        <h2 className="text-lg md:text-2xl font-heading font-semibold mb-4 md:mb-6">Wallpapers</h2>
        {wallpapers.length === 0 ? (
          <p className="text-sm text-gray-400">No wallpapers available.</p>
        ) : (
          <Grid className="lg:grid-cols-4">
            {wallpapers.map((wallpaper) => (
              <PersonWallpaperCard key={wallpaper.id} wallpaper={wallpaper} />
            ))}
          </Grid>
        )}
      </section>
    </div>
  )
}
