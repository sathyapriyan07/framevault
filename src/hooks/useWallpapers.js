import { useEffect, useState } from 'react'
import { mediaService } from '../services/mediaService'

export const useWallpapers = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const { data: items } = await mediaService.getAll('wallpapers')
      setData(items || [])
      setLoading(false)
    }
    load()
  }, [])

  return { data, loading }
}
