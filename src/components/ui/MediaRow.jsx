import { useEffect, useState } from 'react'
import { supabase } from '../../services/supabaseClient'
import MovieCard from '../media/MovieCard'
import WallpaperCard from '../media/WallpaperCard'
import LogoCard from '../media/LogoCard'
import PosterCard from '../media/PosterCard'
import BackdropCard from '../media/BackdropCard'
import PersonCard from '../media/PersonCard'

export default function MediaRow({ type, limit = 10 }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadItems()
  }, [type, limit])

  const loadItems = async () => {
    setLoading(true)
    let query

    switch (type) {
      case 'movies':
        query = supabase
          .from('movies')
          .select('*')
          .eq('type', 'movie')
          .order('created_at', { ascending: false })
          .limit(limit)
        break
      case 'series':
        query = supabase
          .from('movies')
          .select('*')
          .eq('type', 'series')
          .order('created_at', { ascending: false })
          .limit(limit)
        break
      case 'wallpapers':
        query = supabase
          .from('wallpapers')
          .select('*, movies(title)')
          .order('created_at', { ascending: false })
          .limit(limit)
        break
      case 'logos':
        query = supabase
          .from('logos')
          .select('*, movies(title)')
          .order('created_at', { ascending: false })
          .limit(limit)
        break
      case 'posters':
        query = supabase
          .from('posters')
          .select('*, movies(title)')
          .order('created_at', { ascending: false })
          .limit(limit)
        break
      case 'backdrops':
        query = supabase
          .from('backdrops')
          .select('*, movies(title)')
          .order('created_at', { ascending: false })
          .limit(limit)
        break
      case 'persons':
        query = supabase
          .from('persons')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit)
        break
      default:
        setLoading(false)
        return
    }

    const { data } = await query
    setItems(data || [])
    setLoading(false)
  }

  const renderCard = (item) => {
    switch (type) {
      case 'movies':
      case 'series':
        return <MovieCard key={item.id} movie={item} />
      case 'wallpapers':
        return <WallpaperCard key={item.id} wallpaper={item} />
      case 'logos':
        return <LogoCard key={item.id} logo={item} />
      case 'posters':
        return <PosterCard key={item.id} poster={item} />
      case 'backdrops':
        return <BackdropCard key={item.id} backdrop={item} />
      case 'persons':
        return <PersonCard key={item.id} person={item} />
      default:
        return null
    }
  }

  if (loading) {
    return <div className="text-gray-400">Loading...</div>
  }

  if (items.length === 0) {
    return null
  }

  return (
    <div className="flex gap-6 overflow-x-auto scroll-hidden scroll-smooth pb-4 touch-pan-x">
      {items.map(renderCard)}
    </div>
  )
}
