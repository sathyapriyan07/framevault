import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../services/supabaseClient'
import { mediaAssetsService } from '../../services/mediaAssetsService'
import { getPublicUrl } from '../../utils/storageUrl'

const VIEW_ALL_ROUTE_BY_TYPE = {
  wallpapers: '/wallpapers',
  posters: '/posters',
  logos: '/logos',
  backdrops: '/backdrops'
}

const TAB_QUERY_BY_TYPE = {
  wallpapers: 'wallpapers',
  posters: 'posters',
  logos: 'logos',
  backdrops: 'backdrops'
}

const STORAGE_ASSET_TYPE_BY_SECTION_TYPE = {
  wallpapers: 'wallpaper',
  posters: 'poster',
  logos: 'logo',
  backdrops: 'backdrop'
}

function LogoCard({ src }) {
  return (
    <div className="flex-shrink-0 w-[90px] h-[90px] bg-[#111] rounded-lg flex items-center justify-center overflow-hidden">
      {src ? <img src={src} alt="Logo" className="max-w-[70%] max-h-[70%] object-contain" loading="lazy" /> : <div className="w-full h-full bg-black/30" />}
    </div>
  )
}

function PosterCard({ src, alt = 'Poster' }) {
  return (
    <div className="flex-shrink-0 w-[90px]">
      <div className="w-full aspect-[2/3] rounded-lg overflow-hidden bg-[#111]">
        {src ? <img src={src} alt={alt} className="w-full h-full object-cover" loading="lazy" /> : <div className="w-full h-full bg-black/30" />}
      </div>
    </div>
  )
}

function LandscapeCard({ src, alt }) {
  return (
    <div className="flex-shrink-0 w-[140px]">
      <div className="w-full aspect-[16/9] rounded-lg overflow-hidden bg-[#111]">
        {src ? <img src={src} alt={alt} className="w-full h-full object-cover" loading="lazy" /> : <div className="w-full h-full bg-black/30" />}
      </div>
    </div>
  )
}

export default function MediaBrowseRow({ title, type, limit = 24 }) {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    const load = async () => {
      setLoading(true)

      const normalized = []
      const storageType = STORAGE_ASSET_TYPE_BY_SECTION_TYPE[type]

      if (storageType) {
        const { data: storageData, error: storageError } = await mediaAssetsService.getLatestByType(storageType, limit)
        if (!storageError) {
          for (const asset of storageData || []) {
            normalized.push({
              key: `storage-${asset.id}`,
              movieId: asset.movie_id,
              src: getPublicUrl('media', asset.file_path)
            })
          }
        }
      }

      const remaining = Math.max(0, limit - normalized.length)
      if (remaining > 0) {
        let query
        switch (type) {
          case 'logos':
            query = supabase.from('logos').select('*').order('created_at', { ascending: false }).limit(remaining)
            break
          case 'posters':
            query = supabase.from('posters').select('*').order('created_at', { ascending: false }).limit(remaining)
            break
          case 'backdrops':
            query = supabase.from('backdrops').select('*').order('created_at', { ascending: false }).limit(remaining)
            break
          case 'wallpapers':
            query = supabase.from('wallpapers').select('*').order('created_at', { ascending: false }).limit(remaining)
            break
          default:
            break
        }

        if (query) {
          const { data } = await query
          for (const item of data || []) {
            const legacySrc =
              type === 'logos'
                ? item.logo_url
                : type === 'posters'
                  ? item.poster_url
                  : type === 'backdrops'
                    ? item.backdrop_url
                    : item.image_url

            normalized.push({
              key: `legacy-${item.id}`,
              movieId: item.movie_id,
              src: legacySrc
            })
          }
        }
      }

      if (!isMounted) return
      setItems(normalized)
      setLoading(false)
    }

    load()
    return () => {
      isMounted = false
    }
  }, [type, limit])

  const onCardClick = (movieId) => {
    if (!movieId) return
    const tab = TAB_QUERY_BY_TYPE[type]
    navigate(`/movie/${movieId}${tab ? `?tab=${tab}` : ''}`)
  }

  const viewAllRoute = VIEW_ALL_ROUTE_BY_TYPE[type]

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold font-heading">{title}</h2>
        {viewAllRoute && (
          <button type="button" onClick={() => navigate(viewAllRoute)} className="text-sm text-blue-500 font-body">
            View All
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-sm text-neutral-400 font-body">Loading...</div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2 scroll-hidden">
          {items.map((item) => {
            if (type === 'logos') {
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => onCardClick(item.movieId)}
                  className="text-left p-0 bg-transparent border-0 focus:outline-none focus:ring-2 focus:ring-white/10 rounded-lg"
                >
                  <LogoCard src={item.src} />
                </button>
              )
            }

            if (type === 'posters') {
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => onCardClick(item.movieId)}
                  className="text-left p-0 bg-transparent border-0 focus:outline-none focus:ring-2 focus:ring-white/10 rounded-lg"
                >
                  <PosterCard src={item.src} />
                </button>
              )
            }

            if (type === 'backdrops') {
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => onCardClick(item.movieId)}
                  className="text-left p-0 bg-transparent border-0 focus:outline-none focus:ring-2 focus:ring-white/10 rounded-lg"
                >
                  <LandscapeCard src={item.src} alt="Backdrop" />
                </button>
              )
            }

            if (type === 'wallpapers') {
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => onCardClick(item.movieId)}
                  className="text-left p-0 bg-transparent border-0 focus:outline-none focus:ring-2 focus:ring-white/10 rounded-lg"
                >
                  <LandscapeCard src={item.src} alt="Wallpaper" />
                </button>
              )
            }

            return null
          })}
        </div>
      )}
    </div>
  )
}
