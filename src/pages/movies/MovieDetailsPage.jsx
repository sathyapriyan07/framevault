import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { movieService } from '../../services/movieService'
import { mediaService } from '../../services/mediaService'
import { downloadFile } from '../../utils/downloadHelper'

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

  const tabItems = ['Wallpapers', 'Posters', 'Logos', 'Backdrops']

  const renderMediaGrid = () => {
    switch (activeTab) {
      case 'Wallpapers':
        return (
          <div className="grid grid-cols-2 gap-4 px-4 mt-6">
            {wallpapers.map((item) => {
              const url = item.download_url || item.image_url
              return (
                <div key={item.id}>
                  <div className="bg-[#111111] rounded-xl overflow-hidden">
                    <div className="aspect-[16/9] w-full overflow-hidden">
                      <img src={item.image_url} alt="Wallpaper" className="w-full h-full object-cover" loading="lazy" />
                    </div>
                  </div>
                  {url && (
                    <button
                      onClick={() => downloadFile(url, `wallpaper-${item.id}.jpg`)}
                      className="mt-2 w-full px-3 py-1.5 text-xs rounded-full bg-blue-600 text-white"
                    >
                      Download
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )
      case 'Posters':
        return (
          <div className="grid grid-cols-2 gap-4 px-4 mt-6">
            {posters.map((item) => {
              const url = item.download_url || item.poster_url
              return (
                <div key={item.id}>
                  <div className="bg-[#111111] rounded-xl overflow-hidden">
                    <div className="aspect-[2/3] w-full overflow-hidden">
                      <img src={item.poster_url} alt="Poster" className="w-full h-full object-cover" loading="lazy" />
                    </div>
                  </div>
                  {url && (
                    <button
                      onClick={() => downloadFile(url, `poster-${item.id}.jpg`)}
                      className="mt-2 w-full px-3 py-1.5 text-xs rounded-full bg-blue-600 text-white"
                    >
                      Download
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )
      case 'Logos':
        return (
          <div className="grid grid-cols-2 gap-4 px-4 mt-6">
            {logos.map((item) => {
              const pngUrl = item.png_download || item.logo_url
              const svgUrl = item.svg_download
              return (
                <div key={item.id}>
                  <div className="bg-[#2a2a2a] rounded-xl aspect-[4/3] flex items-center justify-center">
                    <img
                      src={item.logo_url}
                      alt="Logo"
                      className="max-w-[70%] max-h-[70%] object-contain"
                      loading="lazy"
                    />
                  </div>
                  {(pngUrl || svgUrl) && (
                    <div className="mt-2 flex gap-2 justify-center">
                      {pngUrl && (
                        <button
                          onClick={() => downloadFile(pngUrl, `logo-${item.id}.png`)}
                          className="px-3 py-1 text-xs rounded-full bg-blue-600 text-white"
                        >
                          PNG
                        </button>
                      )}
                      {svgUrl && (
                        <button
                          onClick={() => downloadFile(svgUrl, `logo-${item.id}.svg`)}
                          className="px-3 py-1 text-xs rounded-full bg-[#2a2a2a] text-white"
                        >
                          SVG
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )
      case 'Backdrops':
        return (
          <div className="grid grid-cols-2 gap-4 px-4 mt-6">
            {backdrops.map((item) => {
              const url = item.download_url || item.backdrop_url
              return (
                <div key={item.id}>
                  <div className="bg-[#111111] rounded-xl overflow-hidden">
                    <div className="aspect-[16/9] w-full overflow-hidden">
                      <img src={item.backdrop_url} alt="Backdrop" className="w-full h-full object-cover" loading="lazy" />
                    </div>
                  </div>
                  {url && (
                    <button
                      onClick={() => downloadFile(url, `backdrop-${item.id}.jpg`)}
                      className="mt-2 w-full px-3 py-1.5 text-xs rounded-full bg-blue-600 text-white"
                    >
                      Download
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="relative h-[320px] overflow-hidden rounded-b-[40px]">
        <img
          src={movie.backdrop_url || movie.poster_url}
          alt={movie.title}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
      </div>

      <div className="px-6 text-center -mt-16 relative z-10">
        <h1 className="text-2xl font-heading font-semibold mb-2">{movie.title}</h1>
        <p className="text-neutral-400 text-sm mb-3 font-body">{movie.release_year}</p>
        <p className="text-neutral-400 text-sm leading-relaxed max-w-md mx-auto font-body">
          {movie.overview || 'No description available.'}
        </p>

        <div className="grid grid-cols-2 gap-3 mt-6 px-4">
          {tabItems.map((tab) => {
            const isActive = activeTab === tab
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={
                  isActive
                    ? 'py-3 rounded-full bg-white text-black text-sm font-medium'
                    : 'py-3 rounded-full bg-[#2a2a2a] text-sm text-white'
                }
              >
                {tab}
              </button>
            )
          })}
        </div>
      </div>

      {renderMediaGrid()}
    </div>
  )
}
