import { useEffect, useState } from 'react'
import { mediaService } from '../services/mediaService'

export const useLogos = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const { data: items } = await mediaService.getAll('logos')
      setData(items || [])
      setLoading(false)
    }
    load()
  }, [])

  return { data, loading }
}
