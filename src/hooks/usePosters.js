import { useEffect, useState } from 'react'
import { mediaService } from '../services/mediaService'

export const usePosters = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const { data: items } = await mediaService.getAll('posters')
      setData(items || [])
      setLoading(false)
    }
    load()
  }, [])

  return { data, loading }
}
