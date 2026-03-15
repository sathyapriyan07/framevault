import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../services/supabaseClient'
import { downloadFile } from '../../utils/downloadHelper'

function LogoTile({ item }) {
  const pngUrl = item.png_download || item.logo_url
  const svgUrl = item.svg_download

  return (
    <div className="w-full">
      <div className="aspect-square bg-[#111] rounded-lg flex items-center justify-center overflow-hidden">
        {item.logo_url ? (
          <img src={item.logo_url} alt="Logo" className="max-w-[70%] max-h-[70%] object-contain" loading="lazy" />
        ) : (
          <div className="w-full h-full bg-black/30" />
        )}
      </div>
      {(pngUrl || svgUrl) && (
        <div className="flex gap-2 mt-1">
          {pngUrl && (
            <button
              type="button"
              onClick={() => downloadFile(pngUrl, `logo-${item.id}.png`)}
              className="text-xs px-2 py-1 rounded-full bg-blue-600 text-white"
            >
              PNG
            </button>
          )}
          {svgUrl && (
            <button
              type="button"
              onClick={() => downloadFile(svgUrl, `logo-${item.id}.svg`)}
              className="text-xs px-2 py-1 rounded-full bg-[#111] border border-[#222] text-white"
            >
              SVG
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function PosterTile({ src, alt }) {
  return (
    <div className="w-full">
      <div className="aspect-[2/3] rounded-lg overflow-hidden bg-[#111]">
        {src ? <img src={src} alt={alt} className="w-full h-full object-cover" loading="lazy" /> : <div className="w-full h-full bg-black/30" />}
      </div>
    </div>
  )
}

function LandscapeTile({ src, alt }) {
  return (
    <div className="w-full">
      <div className="aspect-[16/9] rounded-lg overflow-hidden bg-[#111]">
        {src ? <img src={src} alt={alt} className="w-full h-full object-cover" loading="lazy" /> : <div className="w-full h-full bg-black/30" />}
      </div>
    </div>
  )
}

function PersonTile({ person }) {
  return (
    <Link to={`/person/${person.id}`} className="block w-full">
      <div className="aspect-[2/3] rounded-lg overflow-hidden bg-[#111]">
        {person.profile_url ? (
          <img src={person.profile_url} alt={person.name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full bg-black/30" />
        )}
      </div>
    </Link>
  )
}

function MovieTile({ movie }) {
  return (
    <Link to={`/movie/${movie.id}`} className="block w-full">
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-[#111]">
        {movie.poster_url ? (
          <img src={movie.poster_url} alt={movie.title} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full bg-black/30" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute bottom-1.5 left-1.5 right-1.5">
          <p className="text-[10px] font-medium text-white leading-tight line-clamp-2 font-heading">{movie.title}</p>
          {movie.release_year && <p className="text-[10px] text-neutral-300 font-body">{movie.release_year}</p>}
        </div>
      </div>
    </Link>
  )
}

export default function MediaDenseGrid({ type, limit = 24 }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    const load = async () => {
      setLoading(true)

      let query
      switch (type) {
        case 'movies':
          query = supabase
            .from('movies')
            .select('id,title,type,poster_url,release_year')
            .eq('type', 'movie')
            .order('created_at', { ascending: false })
            .limit(limit)
          break
        case 'series':
          query = supabase
            .from('movies')
            .select('id,title,type,poster_url,release_year')
            .eq('type', 'series')
            .order('created_at', { ascending: false })
            .limit(limit)
          break
        case 'wallpapers':
          query = supabase
            .from('wallpapers')
            .select('id,image_url')
            .order('created_at', { ascending: false })
            .limit(limit)
          break
        case 'logos':
          query = supabase
            .from('logos')
            .select('id,logo_url,png_download,svg_download')
            .order('created_at', { ascending: false })
            .limit(limit)
          break
        case 'posters':
          query = supabase
            .from('posters')
            .select('id,poster_url')
            .order('created_at', { ascending: false })
            .limit(limit)
          break
        case 'backdrops':
          query = supabase
            .from('backdrops')
            .select('id,backdrop_url')
            .order('created_at', { ascending: false })
            .limit(limit)
          break
        case 'persons':
          query = supabase
            .from('persons')
            .select('id,name,profile_url')
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

  if (loading) {
    return <div className="text-sm text-neutral-400 font-body">Loading...</div>
  }

  if (!items.length) {
    return <div className="text-sm text-neutral-500 font-body">No items.</div>
  }

  return (
    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
      {items.map((item) => {
        switch (type) {
          case 'movies':
          case 'series':
            return <MovieTile key={item.id} movie={item} />
          case 'posters':
            return <PosterTile key={item.id} src={item.poster_url} alt="Poster" />
          case 'wallpapers':
            return <LandscapeTile key={item.id} src={item.image_url} alt="Wallpaper" />
          case 'backdrops':
            return <LandscapeTile key={item.id} src={item.backdrop_url} alt="Backdrop" />
          case 'logos':
            return <LogoTile key={item.id} item={item} />
          case 'persons':
            return <PersonTile key={item.id} person={item} />
          default:
            return null
        }
      })}
    </div>
  )
}
