import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { movieService } from '../../services/movieService'
import { mediaService } from '../../services/mediaService'
import Tabs from '../../components/ui/Tabs'
import MediaGrid from '../../components/ui/MediaGrid'
import WallpaperCard from '../../components/media/WallpaperCard'
import LogoCard from '../../components/media/LogoCard'
import PosterCard from '../../components/media/PosterCard'
import BackdropCard from '../../components/media/BackdropCard'

export default function MovieDetailsPage() {
  const { id } = useParams()
  const [movie, setMovie] = useState(null)
  const [activeTab, setActiveTab] = useState('Wallpapers')
  const [wallpapers, setWallpapers] = useState([])
  const [logos, setLogos] = useState([])
  const [posters, setPosters] = useState([])
  const [backdrops, setBackdrops] = useState([])

  useEffect(() => {
    loadMovie()
    loadAssets()
  }, [id])

  useEffect(() => {
    if (!movie) return
    const title = `${movie.title} Wallpapers, Logos, Posters & Backdrops`
    const description = `Download ${movie.title} wallpapers, title logos, posters and backdrops in HD and 4K.`
    document.title = title
    let meta = document.querySelector('meta[name="description"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'description')
      document.head.appendChild(meta)
    }
    meta.setAttribute('content', description)
  }, [movie])

  const loadMovie = async () => {
    const { data } = await movieService.getMovieById(id)
    setMovie(data)
  }

  const loadAssets = async () => {
    const { data: wp } = await mediaService.getByMovieId('wallpapers', id)
    const { data: lg } = await mediaService.getByMovieId('logos', id)
    const { data: ps } = await mediaService.getByMovieId('posters', id)
    const { data: bd } = await mediaService.getByMovieId('backdrops', id)
    setWallpapers(wp || [])
    setLogos(lg || [])
    setPosters(ps || [])
    setBackdrops(bd || [])
  }

  if (!movie) return <div className="text-center py-20">Loading...</div>

  return (
    <div className="min-h-screen">
      <section
        className="relative h-[320px] md:h-[420px] lg:h-[520px] overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: `url(${movie.backdrop_url})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto px-4 pb-6 md:pb-10 w-full">
            <div className="flex gap-4 md:gap-6 lg:gap-10 items-end">
              <img
                src={movie.poster_url}
                alt={movie.title}
                className="w-24 h-36 md:w-40 md:h-60 lg:w-60 lg:h-[360px] object-cover rounded-lg md:rounded-2xl shadow-lg"
              />
              <div className="flex-1">
                <p className="text-[10px] md:text-sm text-gray-300 mb-1">{movie.release_year}</p>
                <h1 className="text-xl md:text-3xl lg:text-5xl font-heading font-bold mb-2 md:mb-4">{movie.title}</h1>
                <div className="flex flex-wrap gap-1.5 md:gap-2 mb-2 md:mb-4">
                  {movie.genres?.map((genre) => (
                    <span key={genre} className="rounded-full bg-white/10 px-2 md:px-3 py-0.5 md:py-1 text-[10px] md:text-xs text-gray-200">
                      {genre}
                    </span>
                  ))}
                </div>
                <p className="text-xs md:text-base text-gray-300 max-w-2xl line-clamp-2 md:line-clamp-3">{movie.overview}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-6 md:py-12">
        <Tabs tabs={['Wallpapers', 'Logos', 'Posters', 'Backdrops']} activeTab={activeTab} onChange={setActiveTab} />

        {activeTab === 'Wallpapers' && (
          <div className="mt-6 md:mt-8">
            <MediaGrid className="lg:grid-cols-4">
              {wallpapers.map((item) => (
                <WallpaperCard key={item.id} wallpaper={item} />
              ))}
            </MediaGrid>
          </div>
        )}
        {activeTab === 'Logos' && (
          <div className="mt-6 md:mt-8">
            <MediaGrid className="lg:grid-cols-4">
              {logos.map((item) => (
                <LogoCard key={item.id} logo={item} />
              ))}
            </MediaGrid>
          </div>
        )}
        {activeTab === 'Posters' && (
          <div className="mt-6 md:mt-8">
            <MediaGrid className="lg:grid-cols-5">
              {posters.map((item) => (
                <PosterCard key={item.id} poster={item} />
              ))}
            </MediaGrid>
          </div>
        )}
        {activeTab === 'Backdrops' && (
          <div className="mt-6 md:mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {backdrops.map((item) => (
                <BackdropCard key={item.id} backdrop={item} variant="grid" />
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
