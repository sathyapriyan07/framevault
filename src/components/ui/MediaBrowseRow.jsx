import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../services/supabaseClient'
import { getMediaImageUrl } from '../../utils/mediaStorage'

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

      let query
      switch (type) {
        case 'logos':
          query = supabase
            .from('logos')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit)
          break
        case 'posters':
          query = supabase
            .from('posters')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit)
          break
        case 'backdrops':
          query = supabase
            .from('backdrops')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit)
          break
        case 'wallpapers':
          query = supabase
            .from('wallpapers')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit)
          break
        default:
          if (isMounted) {
            setItems([])
            setLoading(false)
          }
          return
      }

      const { data } = await query
      if (!isMounted) return
      setItems(data || [])
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
              const src = getMediaImageUrl('logos', item)
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onCardClick(item.movie_id)}
                  className="text-left p-0 bg-transparent border-0 focus:outline-none focus:ring-2 focus:ring-white/10 rounded-lg"
                >
                  <LogoCard src={src} />
                </button>
              )
            }

            if (type === 'posters') {
              const src = getMediaImageUrl('posters', item)
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onCardClick(item.movie_id)}
                  className="text-left p-0 bg-transparent border-0 focus:outline-none focus:ring-2 focus:ring-white/10 rounded-lg"
                >
                  <PosterCard src={src} />
                </button>
              )
            }

            if (type === 'backdrops') {
              const src = getMediaImageUrl('backdrops', item)
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onCardClick(item.movie_id)}
                  className="text-left p-0 bg-transparent border-0 focus:outline-none focus:ring-2 focus:ring-white/10 rounded-lg"
                >
                  <LandscapeCard src={src} alt="Backdrop" />
                </button>
              )
            }

            if (type === 'wallpapers') {
              const src = getMediaImageUrl('wallpapers', item)
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onCardClick(item.movie_id)}
                  className="text-left p-0 bg-transparent border-0 focus:outline-none focus:ring-2 focus:ring-white/10 rounded-lg"
                >
                  <LandscapeCard src={src} alt="Wallpaper" />
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
